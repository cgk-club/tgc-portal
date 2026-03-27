import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET() {
  const sb = getSupabaseAdmin()
  const { data, error } = await sb
    .from('dashboard_tasks')
    .select('*')
    .order('completed', { ascending: true })
    .order('priority', { ascending: false })
    .order('due_date', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const body = await request.json()
  const {
    title,
    due_date,
    itinerary_id,
    priority,
    category,
    scheduled_date,
    scheduled_time,
    is_recurring,
    recurrence,
  } = body

  if (!title?.trim()) {
    return NextResponse.json({ error: 'Title required' }, { status: 400 })
  }

  const sb = getSupabaseAdmin()
  const { data, error } = await sb
    .from('dashboard_tasks')
    .insert({
      title: title.trim(),
      due_date: due_date || null,
      itinerary_id: itinerary_id || null,
      priority: priority || 0,
      category: category || 'admin',
      scheduled_date: scheduled_date || null,
      scheduled_time: scheduled_time || null,
      is_recurring: is_recurring || false,
      recurrence: recurrence || null,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json(data, { status: 201 })
}
