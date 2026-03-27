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
    .from('project_financials')
    .select('*')
    .eq('project_id', id)
    .order('date', { ascending: false, nullsFirst: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data || [])
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await request.json()
  const sb = getSupabaseAdmin()

  const entry = {
    project_id: id,
    type: body.type,
    description: body.description,
    amount: body.amount,
    currency: body.currency || 'EUR',
    date: body.date || new Date().toISOString().split('T')[0],
    document_url: body.document_url || null,
    status: body.status || 'pending',
    notes: body.notes || null,
  }

  const { data, error } = await sb
    .from('project_financials')
    .insert(entry)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}
