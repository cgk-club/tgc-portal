import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const sb = getSupabaseAdmin()
  const url = new URL(request.url)
  const view = url.searchParams.get('view')

  // Full notifications list for admin panel
  if (view === 'all') {
    const limitParam = url.searchParams.get('limit')
    const typeFilter = url.searchParams.get('type')
    const userTypeFilter = url.searchParams.get('user_type')
    const limit = limitParam ? parseInt(limitParam) : 50

    let query = sb
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (typeFilter) query = query.eq('type', typeFilter)
    if (userTypeFilter) query = query.eq('user_type', userTypeFilter)

    const { data, error } = await query
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data || [])
  }

  // Weekly partner count stat
  if (view === 'weekly-partners') {
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

    const { count, error } = await sb
      .from('partner_accounts')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', oneWeekAgo.toISOString())

    if (error) return NextResponse.json({ count: 0 })
    return NextResponse.json({ count: count || 0 })
  }

  // Default: badge counts for sidebar
  try {
    const [
      { count: ficheEdits },
      { count: partnerOffers },
      { count: partnerEvents },
      { count: partnerContent },
      { count: requests },
      { count: feedback },
      { count: marketplaceReview },
    ] = await Promise.all([
      sb.from('fiche_edit_requests').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      sb.from('partner_offers').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      sb.from('partner_events').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      sb.from('partner_content').select('*', { count: 'exact', head: true }).eq('status', 'submitted'),
      sb.from('client_requests').select('*', { count: 'exact', head: true }).eq('status', 'new'),
      sb.from('portal_feedback').select('*', { count: 'exact', head: true }).eq('status', 'new'),
      sb.from('listings').select('*', { count: 'exact', head: true }).eq('status', 'review'),
    ])

    return NextResponse.json({
      approvals: (ficheEdits || 0) + (partnerOffers || 0) + (partnerEvents || 0) + (partnerContent || 0),
      requests: requests || 0,
      feedback: feedback || 0,
      marketplace_review: marketplaceReview || 0,
    })
  } catch (err) {
    console.error('Notifications fetch error:', err)
    return NextResponse.json({
      approvals: 0,
      requests: 0,
      feedback: 0,
      marketplace_review: 0,
    })
  }
}
