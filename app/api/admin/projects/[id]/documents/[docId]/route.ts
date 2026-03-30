import { NextRequest, NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/auth'
import { getSupabaseAdmin } from '@/lib/supabase'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; docId: string }> }
) {
  const authed = await isAuthenticated()
  if (!authed) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id: projectId, docId } = await params
  const sb = getSupabaseAdmin()

  // Get document record
  const { data: doc, error: fetchErr } = await sb
    .from('project_documents')
    .select('id, file_url, project_id')
    .eq('id', docId)
    .eq('project_id', projectId)
    .single()

  if (fetchErr || !doc) {
    return NextResponse.json({ error: 'Document not found' }, { status: 404 })
  }

  // Delete from storage if it's a Supabase storage URL
  if (doc.file_url && !doc.file_url.startsWith('local://')) {
    // Extract storage path from the public URL
    // URL format: https://<project>.supabase.co/storage/v1/object/public/<bucket>/<path>
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
