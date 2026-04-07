import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const sb = getSupabaseAdmin()

  const { data, error } = await sb
    .from('event_revenue_items')
    .select('*')
    .eq('project_id', id)
    .order('sort_order', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const response = NextResponse.json(data || [])
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate')
  return response
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await request.json()
  const sb = getSupabaseAdmin()

  const { data, error } = await sb
    .from('event_revenue_items')
    .insert({
      project_id: id,
      type: body.type,
      label: body.label,
      description: body.description || null,
      package_type: body.package_type || null,
      booking_type: body.booking_type || null,
      unit_price: body.unit_price || 0,
      quantity: body.quantity || 0,
      sponsor_name: body.sponsor_name || null,
      sponsor_tier: body.sponsor_tier || null,
      included_pax: body.included_pax || 0,
      projected: body.projected || 0,
      confirmed: body.confirmed || 0,
      invoiced: body.invoiced || 0,
      received: body.received || 0,
      currency: body.currency || 'EUR',
      status: body.status || 'projected',
      added_by: body.added_by || 'TGC',
      added_by_partner_id: body.added_by_partner_id || null,
      sort_order: body.sort_order || 0,
      notes: body.notes || null,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
