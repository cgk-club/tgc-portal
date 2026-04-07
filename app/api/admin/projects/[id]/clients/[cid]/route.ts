import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; cid: string }> }
) {
  const { cid } = await params
  const body = await request.json()
  const sb = getSupabaseAdmin()

  const allowed = ['role', 'status', 'notes', 'visibility_settings']
  const updates: Record<string, unknown> = {}
  for (const key of allowed) {
    if (key in body) {
      updates[key] = body[key]
    }
  }

  const { data, error } = await sb
    .from('project_clients')
    .update(updates)
    .eq('id', cid)
    .select('*, client:client_accounts!client_id(id, name, email)')
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; cid: string }> }
) {
  const { cid } = await params
  const sb = getSupabaseAdmin()

  const { error } = await sb
    .from('project_clients')
    .delete()
    .eq('id', cid)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
