import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const sb = getSupabaseAdmin()
  const url = new URL(request.url)

  const status = url.searchParams.get('status')
  const type = url.searchParams.get('type')
  const clientId = url.searchParams.get('client_id')
  const search = url.searchParams.get('search')

  let query = sb
    .from('client_projects')
    .select('*, client:client_accounts!client_id(id, name, email)')
    .order('updated_at', { ascending: false })

  if (status && status !== 'all') {
    query = query.eq('status', status)
  }
  if (type && type !== 'all') {
    query = query.eq('type', type)
  }
  if (clientId) {
    query = query.eq('client_id', clientId)
  }
  if (search) {
    query = query.or(`title.ilike.%${search}%,property_address.ilike.%${search}%`)
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data || [])
}

export async function POST(request: NextRequest) {
  const sb = getSupabaseAdmin()
  const body = await request.json()

  const project = {
    client_id: body.client_id || null,
    type: body.type,
    title: body.title,
    property_address: body.property_address || null,
    property_city: body.property_city || null,
    property_country: body.property_country || null,
    status: 'planning',
    budget: body.budget || null,
    currency: body.currency || 'EUR',
    monthly_retainer: body.monthly_retainer || null,
    admin_fee: body.admin_fee || null,
    start_date: body.start_date || null,
    target_date: body.target_date || null,
    notes: body.notes || null,
  }

  const { data, error } = await sb
    .from('client_projects')
    .insert(project)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Auto-create first milestone
  await sb.from('project_milestones').insert({
    project_id: data.id,
    title: 'Project Setup',
    status: 'in_progress',
    sort_order: 0,
  })

  // Auto-create initial update
  await sb.from('project_updates').insert({
    project_id: data.id,
    author_type: 'admin',
    author_name: 'Christian',
    message: `Project created: ${data.title}`,
  })

  return NextResponse.json(data, { status: 201 })
}
