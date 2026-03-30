import { NextRequest, NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/auth'
import { getSupabaseAdmin } from '@/lib/supabase'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authed = await isAuthenticated()
  if (!authed) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id: projectId } = await params
  const formData = await request.formData()
  const file = formData.get('file') as File | null

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  }

  // Sanitise filename: keep extension, replace spaces/special chars
  const originalName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
  const timestamp = Date.now()
  const fileName = `${timestamp}-${originalName}`
  const filePath = `${projectId}/${fileName}`

  const buffer = Buffer.from(await file.arrayBuffer())
  const sb = getSupabaseAdmin()

  const { error } = await sb.storage
    .from('project-documents')
    .upload(filePath, buffer, {
      contentType: file.type,
      upsert: false,
    })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const { data: { publicUrl } } = sb.storage
    .from('project-documents')
    .getPublicUrl(filePath)

  return NextResponse.json({ url: publicUrl, fileName: originalName })
}
