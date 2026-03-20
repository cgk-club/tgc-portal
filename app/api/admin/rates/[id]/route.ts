import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params

  const { data, error } = await getSupabaseAdmin()
    .from('supplier_rates')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'Rate not found' }, { status: 404 })
  }

  return NextResponse.json(data)
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { id } = await params
  const body = await request.json()

  const allowedFields = [
    'supplier_name', 'service', 'rate', 'currency', 'unit', 'rate_type',
    'vat_rate', 'commission_pct', 'valid_from', 'valid_to', 'variant',
    'client_project', 'source_contact', 'source_date', 'source_note',
    'cancellation_terms', 'status', 'notes',
  ]

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
  for (const key of allowedFields) {
    if (key in body) updates[key] = body[key]
  }

  const { data, error } = await getSupabaseAdmin()
    .from('supplier_rates')
    .update(updates)
    .eq('id', id)
    .select('*')
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params

  const { error } = await getSupabaseAdmin()
    .from('supplier_rates')
    .delete()
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
