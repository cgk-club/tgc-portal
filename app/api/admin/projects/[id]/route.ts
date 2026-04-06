import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const sb = getSupabaseAdmin()

  const { data: project, error } = await sb
    .from('client_projects')
    .select('*, client:client_accounts!client_id(id, name, email)')
    .eq('id', id)
    .single()

  if (error || !project) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 })
  }

  // Fetch related data in parallel
  const [
    { data: milestones },
    { data: documents },
    { data: financials },
    { data: partners },
    { data: updates },
    { data: tasks },
  ] = await Promise.all([
    sb.from('project_milestones')
      .select('*')
      .eq('project_id', id)
      .order('sort_order', { ascending: true }),
    sb.from('project_documents')
      .select('*')
      .eq('project_id', id)
      .order('created_at', { ascending: false }),
    sb.from('project_financials')
      .select('*')
      .eq('project_id', id)
      .order('date', { ascending: false, nullsFirst: false }),
    sb.from('project_partners')
      .select('*, partner:partner_accounts!partner_id(id, org_name, email)')
      .eq('project_id', id)
      .order('created_at', { ascending: false }),
    sb.from('project_updates')
      .select('*')
      .eq('project_id', id)
      .order('created_at', { ascending: false }),
    sb.from('project_tasks')
      .select('*')
      .eq('project_id', id)
      .order('created_at', { ascending: false }),
  ])

  // Resolve partner names for task assigned_to IDs
  const allTaskPartnerIds = new Set<string>()
  for (const task of tasks || []) {
    if (task.assigned_to && Array.isArray(task.assigned_to)) {
      for (const pid of task.assigned_to) {
        allTaskPartnerIds.add(pid)
      }
    }
  }

  let taskPartnerMap: Record<string, string> = {}
  if (allTaskPartnerIds.size > 0) {
    const { data: taskPartners } = await sb
      .from('partner_accounts')
      .select('id, org_name, email')
      .in('id', Array.from(allTaskPartnerIds))

    if (taskPartners) {
      for (const p of taskPartners) {
        taskPartnerMap[p.id] = p.org_name || p.email || 'Partner'
      }
    }
  }

  const enrichedTasks = (tasks || []).map((t) => ({
    ...t,
    assigned_partner_names: (t.assigned_to || []).map(
      (pid: string) => taskPartnerMap[pid] || 'Unknown'
    ),
  }))

  // Calculate progress from milestones
  const allMilestones = milestones || []
  const completedMilestones = allMilestones.filter(m => m.status === 'completed')
  const progress = allMilestones.length > 0
    ? Math.round((completedMilestones.length / allMilestones.length) * 100)
    : 0

  return NextResponse.json({
    ...project,
    milestones: milestones || [],
    documents: documents || [],
    financials: financials || [],
    partners: partners || [],
    updates: updates || [],
    tasks: enrichedTasks,
    progress,
  })
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await request.json()
  const sb = getSupabaseAdmin()

  const allowed = [
    'title', 'type', 'status', 'property_address', 'property_city',
    'property_country', 'property_details', 'property_images',
    'budget', 'currency', 'monthly_retainer', 'admin_fee',
    'start_date', 'target_date', 'completed_date', 'notes',
  ]

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
  for (const key of allowed) {
    if (key in body) {
      updates[key] = body[key]
    }
  }

  // If status changed to completed, set completed_date
  if (body.status === 'completed' && !body.completed_date) {
    updates.completed_date = new Date().toISOString().split('T')[0]
  }

  const { data, error } = await sb
    .from('client_projects')
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
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const sb = getSupabaseAdmin()

  const { error } = await sb
    .from('client_projects')
    .delete()
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
