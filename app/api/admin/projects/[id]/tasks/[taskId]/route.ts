import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; taskId: string }> }
) {
  const { taskId } = await params
  const body = await request.json()
  const sb = getSupabaseAdmin()

  const allowed = ['title', 'description', 'status', 'priority', 'due_date', 'completed_date', 'assigned_to', 'notes']
  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
  for (const key of allowed) {
    if (key in body) {
      updates[key] = body[key]
    }
  }

  // Auto-set completed_date when status changes to completed
  if (body.status === 'completed' && !body.completed_date) {
    updates.completed_date = new Date().toISOString().split('T')[0]
  }

  // Clear completed_date if moving back from completed
  if (body.status && body.status !== 'completed') {
    updates.completed_date = null
  }

  const { data, error } = await sb
    .from('project_tasks')
    .update(updates)
    .eq('id', taskId)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; taskId: string }> }
) {
  const { taskId } = await params
  const sb = getSupabaseAdmin()

  const { error } = await sb
    .from('project_tasks')
    .delete()
    .eq('id', taskId)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
