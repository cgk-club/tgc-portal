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
    .from('project_clients')
    .select('*, client:client_accounts!client_id(id, name, email)')
    .eq('project_id', id)
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

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

  const entry = {
    project_id: id,
    client_id: body.client_id,
    role: body.role || 'attendee',
    status: body.status || 'active',
    notes: body.notes || null,
  }

  const { data, error } = await sb
    .from('project_clients')
    .insert(entry)
    .select('*, client:client_accounts!client_id(id, name, email)')
    .single()

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'Client already linked to this project' }, { status: 409 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}
