import { NextRequest, NextResponse } from 'next/server'
import { verifyClientSession, CLIENT_COOKIE_NAME } from '@/lib/client-auth'
import { getSupabaseAdmin } from '@/lib/supabase'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; docId: string }> }
) {
  const { id: projectId, docId } = await params

  const token = request.cookies.get(CLIENT_COOKIE_NAME)?.value
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const session = await verifyClientSession(token)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const sb = getSupabaseAdmin()

  // Verify client owns this project
  const { data: client } = await sb
    .from('client_accounts')
    .select('id')
    .eq('id', session.clientId)
    .single()

  if (!client) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: project } = await sb
    .from('client_projects')
    .select('id')
    .eq('id', projectId)
    .eq('client_id', client.id)
    .single()

  if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Get document — must belong to this project and be uploaded by client
  const { data: doc, error: fetchErr } = await sb
    .from('project_documents')
    .select('id, file_url, uploaded_by_type')
    .eq('id', docId)
    .eq('project_id', projectId)
    .single()

  if (fetchErr || !doc) {
    return NextResponse.json({ error: 'Document not found' }, { status: 404 })
  }

  // Clients can only delete their own uploads
  if (doc.uploaded_by_type !== 'client') {
    return NextResponse.json({ error: 'You can only delete documents you uploaded' }, { status: 403 })
  }

  // Delete from storage
  if (doc.file_url && !doc.file_url.startsWith('local://')) {
    const buckets = ['project-documents', 'fiche-images']
    for (const bucket of buckets) {
      const marker = `/storage/v1/object/public/${bucket}/`
      const idx = doc.file_url.indexOf(marker)
      if (idx !== -1) {
        const storagePath = decodeURIComponent(doc.file_url.slice(idx + marker.length))
        await sb.storage.from(bucket).remove([storagePath])
        break
      }
    }
  }

  // Delete the database record
  const { error: deleteErr } = await sb
    .from('project_documents')
    .delete()
    .eq('id', docId)

  if (deleteErr) {
    return NextResponse.json({ error: deleteErr.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
