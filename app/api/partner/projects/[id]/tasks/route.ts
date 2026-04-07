import { NextRequest, NextResponse } from 'next/server'
import { verifyPartnerSession, PARTNER_COOKIE_NAME } from '@/lib/partner-auth'
import { getSupabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: projectId } = await params

  const token = request.cookies.get(PARTNER_COOKIE_NAME)?.value
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const session = await verifyPartnerSession(token)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const sb = getSupabaseAdmin()

  // Verify partner is assigned to this project
  const { data: assignment } = await sb
    .from('project_partners')
    .select('id')
    .eq('project_id', projectId)
    .eq('partner_id', session.partnerId)
    .in('status', ['active', 'completed'])
    .single()

  if (!assignment) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  // Fetch tasks assigned to this partner
  const { data: tasks, error } = await sb
    .from('project_tasks')
    .select('*')
    .eq('project_id', projectId)
    .contains('assigned_to', [session.partnerId])
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(tasks || [], {
    headers: { 'Cache-Control': 'no-store, max-age=0' },
  })
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: projectId } = await params

  const token = request.cookies.get(PARTNER_COOKIE_NAME)?.value
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const session = await verifyPartnerSession(token)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const sb = getSupabaseAdmin()

  // Verify partner is active on this project
  const { data: assignment } = await sb
    .from('project_partners')
    .select('id, role')
    .eq('project_id', projectId)
    .eq('partner_id', session.partnerId)
    .eq('status', 'active')
    .single()

  if (!assignment) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const body = await request.json()

  if (!body.title || !body.title.trim()) {
    return NextResponse.json({ error: 'Title is required' }, { status: 400 })
  }

  // Get partner org name for created_by
  const { data: partner } = await sb
    .from('partner_accounts')
    .select('org_name')
    .eq('id', session.partnerId)
    .single()

  const creatorName = partner?.org_name || 'Partner'

  const { data: task, error } = await sb
    .from('project_tasks')
    .insert({
      project_id: projectId,
      title: body.title.trim(),
      description: body.description?.trim() || null,
      priority: body.priority || 'medium',
      due_date: body.due_date || null,
      assigned_to: body.assigned_to || [],
      status: 'pending',
      created_by: `${creatorName} (${assignment.role})`,
      created_by_type: 'partner',
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(task, { status: 201 })
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: projectId } = await params

  const token = request.cookies.get(PARTNER_COOKIE_NAME)?.value
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const session = await verifyPartnerSession(token)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const sb = getSupabaseAdmin()

  // Verify partner is assigned to this project
  const { data: assignment } = await sb
    .from('project_partners')
    .select('id, role')
    .eq('project_id', projectId)
    .eq('partner_id', session.partnerId)
    .eq('status', 'active')
    .single()

  if (!assignment) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const body = await request.json()
  const { taskId, status } = body

  if (!taskId || !status) {
    return NextResponse.json({ error: 'taskId and status required' }, { status: 400 })
  }

  if (!['pending', 'in_progress', 'completed'].includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
  }

  // Verify the task belongs to this project and partner can access it
  const { data: task } = await sb
    .from('project_tasks')
    .select('id, assigned_to')
    .eq('id', taskId)
    .eq('project_id', projectId)
    .single()

  if (!task) {
    return NextResponse.json({ error: 'Task not found' }, { status: 404 })
  }

  // Partners can update tasks assigned to them or unassigned tasks
  const assignees = task.assigned_to as string[] | null
  const isAssigned = assignees && assignees.includes(session.partnerId)
  const isUnassigned = !assignees || assignees.length === 0
  if (!isAssigned && !isUnassigned) {
    return NextResponse.json({ error: 'Not authorised to update this task' }, { status: 403 })
  }

  const updates: Record<string, unknown> = {
    status,
    updated_at: new Date().toISOString(),
  }

  if (status === 'completed') {
    updates.completed_date = new Date().toISOString().split('T')[0]
  } else {
    updates.completed_date = null
  }

  const { data: updated, error } = await sb
    .from('project_tasks')
    .update(updates)
    .eq('id', taskId)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(updated)
}
