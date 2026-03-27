import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await request.json()
  const sb = getSupabaseAdmin()

  const updates: Record<string, unknown> = {}
  if ('title' in body) updates.title = body.title
  if ('completed' in body) {
    updates.completed = body.completed
    updates.completed_at = body.completed ? new Date().toISOString() : null
  }
  if ('due_date' in body) updates.due_date = body.due_date
  if ('priority' in body) updates.priority = body.priority
  if ('category' in body) updates.category = body.category
  if ('scheduled_date' in body) updates.scheduled_date = body.scheduled_date
  if ('scheduled_time' in body) updates.scheduled_time = body.scheduled_time
  if ('is_recurring' in body) updates.is_recurring = body.is_recurring
  if ('recurrence' in body) updates.recurrence = body.recurrence

  const { data, error } = await sb
    .from('dashboard_tasks')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json(data)
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const sb = getSupabaseAdmin()

  const { error } = await sb
    .from('dashboard_tasks')
    .delete()
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ success: true })
}
