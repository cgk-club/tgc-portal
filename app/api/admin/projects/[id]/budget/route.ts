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
    .from('event_budget_items')
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
    .from('event_budget_items')
    .insert({
      project_id: id,
      category: body.category,
      label: body.label,
      description: body.description || null,
      budgeted: body.budgeted || 0,
      committed: body.committed || 0,
      paid: body.paid || 0,
      currency: body.currency || 'EUR',
      status: body.status || 'planned',
      owner: body.owner || null,
      owner_partner_id: body.owner_partner_id || null,
      reimbursable: body.reimbursable || false,
      sort_order: body.sort_order || 0,
      notes: body.notes || null,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
