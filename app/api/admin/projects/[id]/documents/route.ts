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
    .from('project_documents')
    .select('*')
    .eq('project_id', id)
    .order('created_at', { ascending: false })

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

  const doc = {
    project_id: id,
    title: body.title,
    file_url: body.file_url,
    file_type: body.file_type || null,
    uploaded_by: body.uploaded_by || 'Christian',
    uploaded_by_type: body.uploaded_by_type || 'admin',
    version: body.version || 1,
    notes: body.notes || null,
  }

  const { data, error } = await sb
    .from('project_documents')
    .insert(doc)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}
