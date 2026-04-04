import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { createClientSession, CLIENT_COOKIE_NAME } from '@/lib/client-auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params
  const sb = getSupabaseAdmin()

  // Find valid token
  const { data: magicToken } = await sb
    .from('magic_tokens')
    .select('*, client:client_accounts(*)')
    .eq('token', token)
    .is('used_at', null)
    .gt('expires_at', new Date().toISOString())
    .single()

  if (!magicToken || !magicToken.client) {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || ''
    return NextResponse.redirect(new URL('/client/login?error=invalid', appUrl || request.url))
  }

  // Mark token as used
  await sb.from('magic_tokens').update({ used_at: new Date().toISOString() }).eq('id', magicToken.id)

  // Update last_login
  await sb.from('client_accounts').update({ last_login: new Date().toISOString() }).eq('id', magicToken.client_id)

  // Create session
  const sessionToken = await createClientSession(magicToken.client_id, magicToken.client.email)

  // Redirect to password setup if no password set yet
  const needsPassword = !magicToken.client.password_hash
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || ''
  const response = NextResponse.redirect(new URL(needsPassword ? '/client/setup-password' : '/client', appUrl || request.url))
  response.cookies.set(CLIENT_COOKIE_NAME, sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 30 * 24 * 60 * 60,
    path: '/',
  })

  return response
}
