import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const search = searchParams.get('search')
  const status = searchParams.get('status')
  const project = searchParams.get('project')
  const supplier = searchParams.get('supplier')

  let query = getSupabaseAdmin()
    .from('supplier_rates')
    .select('*')
    .order('updated_at', { ascending: false })

  if (status) query = query.eq('status', status)
  if (project) query = query.ilike('client_project', `%${project}%`)
  if (supplier) query = query.ilike('supplier_name', `%${supplier}%`)

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  let filtered = data || []
  if (search) {
    const q = search.toLowerCase()
    filtered = filtered.filter(
      (r) =>
        r.supplier_name.toLowerCase().includes(q) ||
        r.service.toLowerCase().includes(q) ||
        (r.variant && r.variant.toLowerCase().includes(q)) ||
        (r.client_project && r.client_project.toLowerCase().includes(q))
    )
  }

  return NextResponse.json(filtered)
}

export async function POST(request: NextRequest) {
  const body = await request.json()

  const { data, error } = await getSupabaseAdmin()
    .from('supplier_rates')
    .insert({
      supplier_name: body.supplier_name,
      service: body.service,
      rate: body.rate,
      currency: body.currency || 'EUR',
      unit: body.unit || 'per night',
      rate_type: body.rate_type || 'net',
      vat_rate: body.vat_rate ?? null,
      commission_pct: body.commission_pct ?? null,
      valid_from: body.valid_from || null,
      valid_to: body.valid_to || null,
      variant: body.variant || null,
      client_project: body.client_project || null,
      source_contact: body.source_contact || null,
      source_date: body.source_date || null,
      source_note: body.source_note || null,
      cancellation_terms: body.cancellation_terms || null,
      status: body.status || 'quoted',
      notes: body.notes || null,
    })
    .select('*')
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}
