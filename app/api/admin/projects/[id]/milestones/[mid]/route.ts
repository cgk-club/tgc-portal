import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; mid: string }> }
) {
  const { mid } = await params
  const body = await request.json()
  const sb = getSupabaseAdmin()

  const allowed = ['title', 'description', 'status', 'due_date', 'completed_date', 'sort_order']
  const updates: Record<string, unknown> = {}
  for (const key of allowed) {
    if (key in body) {
      updates[key] = body[key]
    }
  }

  // Auto-set completed_date when status changes to completed
  if (body.status === 'completed' && !body.completed_date) {
    updates.completed_date = new Date().toISOString().split('T')[0]
  }

  const { data, error } = await sb
    .from('project_milestones')
    .update(updates)
    .eq('id', mid)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; mid: string }> }
) {
  const { mid } = await params
  const sb = getSupabaseAdmin()

  const { error } = await sb
    .from('project_milestones')
    .delete()
    .eq('id', mid)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
