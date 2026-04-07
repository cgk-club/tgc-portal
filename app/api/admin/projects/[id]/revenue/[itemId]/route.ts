import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  const { itemId } = await params
  const body = await request.json()
  const sb = getSupabaseAdmin()

  const allowed = ['type', 'label', 'description', 'package_type', 'booking_type', 'unit_price', 'quantity', 'sponsor_name', 'sponsor_tier', 'included_pax', 'projected', 'confirmed', 'invoiced', 'received', 'currency', 'status', 'added_by', 'sort_order', 'notes']
  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
  for (const key of allowed) {
    if (key in body) updates[key] = body[key]
  }

  const { data, error } = await sb
    .from('event_revenue_items')
    .update(updates)
    .eq('id', itemId)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  const { itemId } = await params
  const sb = getSupabaseAdmin()

  const { error } = await sb.from('event_revenue_items').delete().eq('id', itemId)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
