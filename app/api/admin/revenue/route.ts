export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const sb = getSupabaseAdmin()
    const { searchParams } = new URL(request.url)
    const filter = searchParams.get('filter') // pipeline | fees | collected | outstanding
    const clientId = searchParams.get('client_id')
    const dateFrom = searchParams.get('date_from')
    const dateTo = searchParams.get('date_to')

    // ── 1. Fetch all active itineraries ──────────────────────────
    const { data: itineraries } = await sb
      .from('itineraries')
      .select('id, client_name, title, status, currency, client_account_id, start_date')
      .in('status', ['draft', 'shared'])

    const itList = itineraries || []
    const itineraryIds = itList.map((it) => it.id)

    const itineraryLookup: Record<string, {
      clientName: string
      title: string
      currency: string
      clientAccountId: string | null
      startDate: string | null
    }> = {}
    for (const it of itList) {
      itineraryLookup[it.id] = {
        clientName: it.client_name,
        title: it.title,
        currency: it.currency || 'EUR',
        clientAccountId: it.client_account_id || null,
        startDate: it.start_date || null,
      }
    }

    // ── 2. Fetch all payment items ───────────────────────────────
    let allPayments: Array<Record<string, unknown>> = []
    if (itineraryIds.length > 0) {
      const { data } = await sb
        .from('payment_items')
        .select('*')
        .in('itinerary_id', itineraryIds)
        .order('sort_order', { ascending: true })
      allPayments = data || []
    }

    // Enrich with client and itinerary info
    type EnrichedPayment = Record<string, unknown> & {
      client_name: string
      itinerary_title: string
      itinerary_currency: string
      client_account_id: string | null
      itinerary_start_date: string | null
    }

    const enrichedPayments: EnrichedPayment[] = allPayments.map((p) => {
      const lookup = itineraryLookup[p.itinerary_id as string]
      return {
        ...p,
        client_name: lookup?.clientName || 'Unknown',
        itinerary_title: lookup?.title || 'Unknown',
        itinerary_currency: lookup?.currency || 'EUR',
        client_account_id: lookup?.clientAccountId || null,
        itinerary_start_date: lookup?.startDate || null,
      }
    })

    // ── 3. Apply filters ─────────────────────────────────────────
    const getAmt = (p: Record<string, unknown>) =>
      (p.client_amount as number) || (p.amount as number) || 0

    const status = (p: EnrichedPayment) => p.payment_status as string
    const svcName = (p: EnrichedPayment) => ((p.service_name as string) || '').toLowerCase()

    let filtered = enrichedPayments

    // Filter by status category
    if (filter === 'pipeline') {
      filtered = filtered.filter((p) => status(p) !== 'cancelled')
    } else if (filter === 'fees') {
      filtered = filtered.filter((p) => {
        const name = svcName(p)
        return (
          (name.includes('concierge') || name.includes('planning') || name.includes('fee')) &&
          (status(p) === 'pending' || status(p) === 'deposit_paid')
        )
      })
    } else if (filter === 'collected') {
      filtered = filtered.filter(
        (p) => status(p) === 'fully_paid' || status(p) === 'confirmed'
      )
    } else if (filter === 'outstanding') {
      filtered = filtered.filter(
        (p) =>
          status(p) !== 'cancelled' &&
          status(p) !== 'fully_paid' &&
          status(p) !== 'confirmed'
      )
    } else {
      // 'all' - exclude cancelled by default
      filtered = filtered.filter((p) => status(p) !== 'cancelled')
    }

    // Filter by client account ID
    if (clientId) {
      filtered = filtered.filter((p) => p.client_name === clientId)
    }

    // Filter by date range (using deposit_deadline or created_at)
    if (dateFrom) {
      filtered = filtered.filter((p) => {
        const date = (p.deposit_deadline as string) || (p.created_at as string) || ''
        return date >= dateFrom
      })
    }
    if (dateTo) {
      filtered = filtered.filter((p) => {
        const date = (p.deposit_deadline as string) || (p.created_at as string) || ''
        return date <= dateTo
      })
    }

    // ── 4. Compute summary totals (always from all non-cancelled) ─
    const nonCancelled = enrichedPayments.filter((p) => status(p) !== 'cancelled')
    const paidPayments = nonCancelled.filter(
      (p) => status(p) === 'fully_paid' || status(p) === 'confirmed'
    )

    const pipelineTotal = nonCancelled.reduce((s, p) => s + getAmt(p), 0)
    const collected = paidPayments.reduce((s, p) => s + getAmt(p), 0)
    const outstanding = pipelineTotal - collected

    const feesPending = nonCancelled
      .filter((p) => {
        const name = svcName(p)
        return (
          (name.includes('concierge') || name.includes('planning') || name.includes('fee')) &&
          (status(p) === 'pending' || status(p) === 'deposit_paid')
        )
      })
      .reduce((s, p) => s + getAmt(p), 0)

    // Primary currency
    const currencyCounts: Record<string, number> = {}
    for (const it of itList) {
      const c = it.currency || 'EUR'
      currencyCounts[c] = (currencyCounts[c] || 0) + 1
    }
    const primaryCurrency =
      Object.entries(currencyCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'EUR'

    // ── 5. Breakdowns ────────────────────────────────────────────
    // Revenue by client
    const byClient: Record<string, { pipeline: number; collected: number }> = {}
    for (const p of nonCancelled) {
      const name = p.client_name
      if (!byClient[name]) byClient[name] = { pipeline: 0, collected: 0 }
      byClient[name].pipeline += getAmt(p)
      if (status(p) === 'fully_paid' || status(p) === 'confirmed') {
        byClient[name].collected += getAmt(p)
      }
    }

    // Revenue by status
    const byStatus: Record<string, { count: number; total: number }> = {}
    for (const p of nonCancelled) {
      const st = status(p)
      if (!byStatus[st]) byStatus[st] = { count: 0, total: 0 }
      byStatus[st].count++
      byStatus[st].total += getAmt(p)
    }

    // Revenue by month (using deposit_deadline or created_at)
    const byMonth: Record<string, number> = {}
    for (const p of nonCancelled) {
      const dateStr =
        (p.deposit_deadline as string) || (p.created_at as string) || ''
      if (dateStr) {
        const month = dateStr.substring(0, 7) // YYYY-MM
        byMonth[month] = (byMonth[month] || 0) + getAmt(p)
      }
    }

    // Commission summary
    const commissionablePayments = nonCancelled.filter((p) => {
      const name = svcName(p)
      return !name.includes('flight') && !name.includes('restaurant')
    })
    const totalCommissionable = commissionablePayments.reduce(
      (s, p) => s + getAmt(p),
      0
    )
    const estimatedCommission = commissionablePayments.reduce((s, p) => {
      const commVal = (p.commission_value as number) || 0
      const commType = (p.commission_type as string) || ''
      if (commType === 'percentage' && commVal > 0) {
        return s + getAmt(p) * (commVal / 100)
      } else if (commType === 'fixed' && commVal > 0) {
        return s + commVal
      }
      return s
    }, 0)

    // ── 6. Project financials (try, may not exist) ───────────────
    let projectFinancials: Array<Record<string, unknown>> = []
    try {
      const { data } = await sb
        .from('project_financials')
        .select('*')
        .order('date', { ascending: false })
      projectFinancials = data || []
    } catch {
      // Table may not exist
    }

    const projectSummary = {
      totalIncome: projectFinancials
        .filter((f) => f.type === 'income')
        .reduce((s, f) => s + ((f.amount as number) || 0), 0),
      totalExpenses: projectFinancials
        .filter((f) => f.type === 'expense')
        .reduce((s, f) => s + ((f.amount as number) || 0), 0),
      retainers: projectFinancials
        .filter((f) => f.type === 'retainer')
        .reduce((s, f) => s + ((f.amount as number) || 0), 0),
      adminFees: projectFinancials
        .filter((f) => f.type === 'admin_fee')
        .reduce((s, f) => s + ((f.amount as number) || 0), 0),
      items: projectFinancials,
    }

    // ── 7. Marketplace orders (try, may not exist) ───────────────
    let marketplaceOrders: Array<Record<string, unknown>> = []
    try {
      const { data } = await sb
        .from('marketplace_orders')
        .select('*')
        .order('created_at', { ascending: false })
      marketplaceOrders = data || []
    } catch {
      // Table may not exist
    }

    const marketplaceSummary = {
      totalOrders: marketplaceOrders.length,
      totalRevenue: marketplaceOrders.reduce(
        (s, o) => s + ((o.total_amount as number) || (o.amount as number) || 0),
        0
      ),
      totalCommission: marketplaceOrders.reduce(
        (s, o) => s + ((o.commission_amount as number) || 0),
        0
      ),
      items: marketplaceOrders,
    }

    // ── 8. Client list for filter dropdown ───────────────────────
    const clientNames = Array.from(
      new Set(nonCancelled.map((p) => p.client_name as string).filter(Boolean))
    ).sort()

    return NextResponse.json({
      payments: filtered,
      summary: {
        pipelineTotal,
        feesPending,
        collected,
        outstanding,
        currency: primaryCurrency,
      },
      breakdowns: {
        byClient,
        byStatus,
        byMonth,
        commission: {
          totalCommissionable,
          estimatedCommission,
        },
      },
      projectFinancials: projectSummary,
      marketplaceSummary,
      clientNames,
    })
  } catch (error) {
    console.error('Revenue API error:', error)
    return NextResponse.json({ error: 'Failed to load revenue data' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const sb = getSupabaseAdmin()
    const body = await request.json()
    const { paymentId, itineraryId, changes, previousValues } = body

    if (!paymentId || !itineraryId) {
      return NextResponse.json({ error: 'Missing paymentId or itineraryId' }, { status: 400 })
    }

    // Build adjustment log note
    const adjustmentNote = Object.entries(changes)
      .map(([key, newVal]) => {
        const oldVal = previousValues?.[key]
        return `[${new Date().toISOString().substring(0, 16)}] ${key}: ${oldVal} -> ${newVal}`
      })
      .join('\n')

    // Get current notes to append log
    const { data: current } = await sb
      .from('payment_items')
      .select('notes')
      .eq('id', paymentId)
      .single()

    const existingNotes = (current?.notes as string) || ''
    const updatedNotes = existingNotes
      ? `${existingNotes}\n--- Adjustment ---\n${adjustmentNote}`
      : `--- Adjustment ---\n${adjustmentNote}`

    const { data, error } = await sb
      .from('payment_items')
      .update({
        ...changes,
        notes: updatedNotes,
        updated_at: new Date().toISOString(),
      })
      .eq('id', paymentId)
      .eq('itinerary_id', itineraryId)
      .select()
      .single()

    if (error) throw error
    return NextResponse.json(data)
  } catch (error) {
    console.error('Revenue PATCH error:', error)
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 })
  }
}
