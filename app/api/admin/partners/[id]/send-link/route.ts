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

  // Check partner account exists and is not suspended
  const { data: partner } = await sb
    .from('partner_accounts')
    .select('id, org_name, status')
    .eq('id', id)
    .single()

  if (!partner) {
    return NextResponse.json({ error: 'Partner not found' }, { status: 404 })
  }

  if (partner.status === 'suspended') {
    return NextResponse.json({ error: 'Cannot send link to suspended partner' }, { status: 400 })
  }

  // Check if a specific user_id was provided in the body
  let body: { user_id?: string } = {}
  try {
    body = await request.json()
  } catch {
    // No body is fine, send to all users
  }

  let users: { id: string; email: string; name: string | null }[] = []

  if (body.user_id) {
    // Send to a specific user
    const { data: user } = await sb
      .from('partner_users')
      .select('id, email, name')
      .eq('id', body.user_id)
      .eq('partner_id', id)
      .single()

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    users = [user]
  } else {
    // Send to all users for this org
    const { data } = await sb
      .from('partner_users')
      .select('id, email, name')
      .eq('partner_id', id)

    users = data || []
  }

  if (users.length === 0) {
    return NextResponse.json({ error: 'No users found for this partner' }, { status: 404 })
  }

  const errors: string[] = []

  for (const user of users) {
    const token = randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()

    await sb.from('partner_magic_tokens').insert({
      partner_id: partner.id,
      user_id: user.id,
      token,
      expires_at: expiresAt,
    })

    try {
      await sendPartnerMagicLink(user.email, user.name || 'there', token)
    } catch (err) {
      console.error(`Failed to send partner magic link to ${user.email}:`, err)
      errors.push(user.email)
    }
  }

  if (errors.length > 0) {
    return NextResponse.json({ error: `Failed to send email to: ${errors.join(', ')}` }, { status: 500 })
  }

  return NextResponse.json({ ok: true, sent_to: users.length })
}
