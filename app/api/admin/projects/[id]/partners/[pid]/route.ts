import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; pid: string }> }
) {
  const { pid } = await params
  const body = await request.json()
  const sb = getSupabaseAdmin()

  const allowed = ['role', 'status', 'notes']
  const updates: Record<string, unknown> = {}
  for (const key of allowed) {
    if (key in body) {
      updates[key] = body[key]
    }
  }

  const { data, error } = await sb
    .from('project_partners')
    .update(updates)
    .eq('id', pid)
    .select('*, partner:partner_accounts!partner_id(id, org_name, email)')
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; pid: string }> }
) {
  const { pid } = await params
  const sb = getSupabaseAdmin()

  const { error } = await sb
    .from('project_partners')
    .delete()
    .eq('id', pid)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
