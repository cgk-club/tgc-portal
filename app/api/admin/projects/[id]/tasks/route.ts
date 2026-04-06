import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const sb = getSupabaseAdmin()

  const { data: tasks, error } = await sb
    .from('project_tasks')
    .select('*')
    .eq('project_id', id)
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Resolve partner names for assigned_to IDs
  const allPartnerIds = new Set<string>()
  for (const task of tasks || []) {
    if (task.assigned_to && Array.isArray(task.assigned_to)) {
      for (const pid of task.assigned_to) {
        allPartnerIds.add(pid)
      }
    }
  }

  let partnerMap: Record<string, string> = {}
  if (allPartnerIds.size > 0) {
    const { data: partners } = await sb
      .from('partner_accounts')
      .select('id, org_name, email')
      .in('id', Array.from(allPartnerIds))

    if (partners) {
      for (const p of partners) {
        partnerMap[p.id] = p.org_name || p.email || 'Partner'
      }
    }
  }

  const enriched = (tasks || []).map((t) => ({
    ...t,
    assigned_partner_names: (t.assigned_to || []).map(
      (pid: string) => partnerMap[pid] || 'Unknown'
    ),
  }))

  return NextResponse.json(enriched, {
    headers: { 'Cache-Control': 'no-store, max-age=0' },
  })
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await request.json()
  const sb = getSupabaseAdmin()

  const task = {
    project_id: id,
    title: body.title,
    description: body.description || null,
    assigned_to: body.assigned_to || [],
    priority: body.priority || 'medium',
    status: 'pending',
    due_date: body.due_date || null,
    created_by: 'Christian',
    created_by_type: 'admin',
    notes: body.notes || null,
  }

  const { data, error } = await sb
    .from('project_tasks')
    .insert(task)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}
