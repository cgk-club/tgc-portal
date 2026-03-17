import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { sendMagicLink } from '@/lib/email'
import { randomBytes } from 'crypto'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const sb = getSupabaseAdmin()

  const { data: client } = await sb
    .from('client_accounts')
    .select('*')
    .eq('id', id)
    .single()

  if (!client) {
    return NextResponse.json({ error: 'Client not found' }, { status: 404 })
  }

  const token = randomBytes(32).toString('hex')
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()

  await sb.from('magic_tokens').insert({
    client_id: client.id,
    token,
    expires_at: expiresAt,
  })

  try {
    await sendMagicLink(client.email, client.name || 'there', token)
  } catch (err) {
    console.error('Failed to send magic link:', err)
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
