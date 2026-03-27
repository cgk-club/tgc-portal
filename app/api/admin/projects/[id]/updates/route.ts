import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const sb = getSupabaseAdmin()
  const url = new URL(request.url)
  const authorType = url.searchParams.get('author_type')

  let query = sb
    .from('project_updates')
    .select('*')
    .eq('project_id', id)
    .order('created_at', { ascending: false })

  if (authorType) {
    query = query.eq('author_type', authorType)
  }

  const { data, error } = await query

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

  const update = {
    project_id: id,
    author_type: body.author_type || 'admin',
    author_name: body.author_name || 'Christian',
    author_id: body.author_id || null,
    message: body.message,
    attachments: body.attachments || [],
  }

  const { data, error } = await sb
    .from('project_updates')
    .insert(update)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Touch project updated_at
  await sb
    .from('client_projects')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', id)

  return NextResponse.json(data, { status: 201 })
}
