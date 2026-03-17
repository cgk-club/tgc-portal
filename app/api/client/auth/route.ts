import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { sendMagicLink } from '@/lib/email'
import { randomBytes } from 'crypto'

export async function POST(request: NextRequest) {
  const { email } = await request.json()
  if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 })

  const sb = getSupabaseAdmin()

  // Check if client account exists
  const { data: client } = await sb
    .from('client_accounts')
    .select('*')
    .eq('email', email.toLowerCase().trim())
    .single()

  if (!client) {
    // Don't reveal whether the email exists
    return NextResponse.json({ ok: true })
  }

  // Generate magic token
  const token = randomBytes(32).toString('hex')
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()

  await sb.from('magic_tokens').insert({
    client_id: client.id,
    token,
    expires_at: expiresAt,
  })

  // Send email
  try {
    await sendMagicLink(client.email, client.name || 'there', token)
  } catch (err) {
    console.error('Failed to send magic link:', err)
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
