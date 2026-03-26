import { NextRequest, NextResponse } from 'next/server'
import { verifyPartnerSession, PARTNER_COOKIE_NAME } from '@/lib/partner-auth'
import { getSupabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  const token = request.cookies.get(PARTNER_COOKIE_NAME)?.value
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const session = await verifyPartnerSession(token)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await request.formData()
  const file = formData.get('file') as File | null

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  }

  const ext = file.name.split('.').pop() || 'jpg'
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
  const filePath = `partner/${session.partnerId}/${fileName}`

  const buffer = Buffer.from(await file.arrayBuffer())
  const sb = getSupabaseAdmin()

  const { error } = await sb.storage
    .from('fiche-images')
    .upload(filePath, buffer, {
      contentType: file.type,
      upsert: false,
    })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const { data: { publicUrl } } = sb.storage
    .from('fiche-images')
    .getPublicUrl(filePath)

  return NextResponse.json({ url: publicUrl })
}
