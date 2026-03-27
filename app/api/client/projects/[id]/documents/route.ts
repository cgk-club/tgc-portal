import { NextRequest, NextResponse } from 'next/server'
import { verifyClientSession, CLIENT_COOKIE_NAME } from '@/lib/client-auth'
import { getSupabaseAdmin } from '@/lib/supabase'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const token = request.cookies.get(CLIENT_COOKIE_NAME)?.value
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const session = await verifyClientSession(token)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const sb = getSupabaseAdmin()

  // Verify client owns this project
  const { data: client } = await sb
    .from('client_accounts')
    .select('id, name')
    .eq('id', session.clientId)
    .single()

  if (!client) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: project } = await sb
    .from('client_projects')
    .select('id')
    .eq('id', id)
    .eq('client_id', client.id)
    .single()

  if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Handle file upload via FormData
  const formData = await request.formData()
  const file = formData.get('file') as File | null
  const title = (formData.get('title') as string) || ''
  const notes = (formData.get('notes') as string) || ''

  if (!file) {
    return NextResponse.json({ error: 'File is required' }, { status: 400 })
  }

  // Upload to Supabase Storage
  const fileExt = file.name.split('.').pop() || 'file'
  const fileName = `projects/${id}/${Date.now()}-${file.name}`

  const arrayBuffer = await file.arrayBuffer()
  const { error: uploadError } = await sb.storage
    .from('fiche-images')
    .upload(fileName, arrayBuffer, {
      contentType: file.type,
      upsert: false,
    })

  if (uploadError) {
    return NextResponse.json({ error: 'Upload failed: ' + uploadError.message }, { status: 500 })
  }

  const { data: publicUrl } = sb.storage
    .from('fiche-images')
    .getPublicUrl(fileName)

  // Create document record
  const { data: doc, error: docError } = await sb
    .from('project_documents')
    .insert({
      project_id: id,
      title: title || file.name,
      file_url: publicUrl.publicUrl,
      file_type: fileExt,
      uploaded_by: client.name || session.email,
      uploaded_by_type: 'client',
      notes,
    })
    .select()
    .single()

  if (docError) return NextResponse.json({ error: docError.message }, { status: 500 })

  return NextResponse.json(doc)
}
