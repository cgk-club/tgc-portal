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
    .from('project_milestones')
    .select('*')
    .eq('project_id', id)
    .order('sort_order', { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data || [])
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await request.json()
  const sb = getSupabaseAdmin()

  // Support bulk creation (template milestones)
  if (Array.isArray(body)) {
    const milestones = body.map((m, i) => ({
      project_id: id,
      title: m.title,
      description: m.description || null,
      status: m.status || 'pending',
      due_date: m.due_date || null,
      sort_order: m.sort_order ?? i,
    }))

    const { data, error } = await sb
      .from('project_milestones')
      .insert(milestones)
      .select()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data, { status: 201 })
  }

  // Single milestone
  const milestone = {
    project_id: id,
    title: body.title,
    description: body.description || null,
    status: body.status || 'pending',
    due_date: body.due_date || null,
    sort_order: body.sort_order ?? 0,
  }

  const { data, error } = await sb
    .from('project_milestones')
    .insert(milestone)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}
