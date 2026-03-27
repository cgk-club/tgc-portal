import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await request.json()
  const { status, admin_note } = body

  const validStatuses = ['new', 'in_progress', 'resolved', 'closed']

  const updates: Record<string, string> = {}
  if (status && validStatuses.includes(status)) {
    updates.status = status
  }
  if (admin_note !== undefined) {
    updates.admin_note = admin_note
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
  }

  const sb = getSupabaseAdmin()

  const { data, error } = await sb
    .from('portal_feedback')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}
