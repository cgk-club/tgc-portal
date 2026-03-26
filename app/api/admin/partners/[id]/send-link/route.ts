import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { sendPartnerMagicLink } from '@/lib/email'
import { randomBytes } from 'crypto'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const sb = getSupabaseAdmin()

  const { data: partner } = await sb
    .from('partner_accounts')
    .select('*')
    .eq('id', id)
    .single()

  if (!partner) {
    return NextResponse.json({ error: 'Partner not found' }, { status: 404 })
  }

  if (partner.status === 'suspended') {
    return NextResponse.json({ error: 'Cannot send link to suspended partner' }, { status: 400 })
  }

  const token = randomBytes(32).toString('hex')
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()

  await sb.from('partner_magic_tokens').insert({
    partner_id: partner.id,
    token,
    expires_at: expiresAt,
  })

  try {
    await sendPartnerMagicLink(partner.email, partner.name || 'there', token)
  } catch (err) {
    console.error('Failed to send partner magic link:', err)
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
