import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { verifyClientSession, CLIENT_COOKIE_NAME } from '@/lib/client-auth'
import { verifyPartnerSession, PARTNER_COOKIE_NAME } from '@/lib/partner-auth'

export async function POST(request: NextRequest) {
  const sb = getSupabaseAdmin()

  // Determine which user is making the request
  let userType: 'client' | 'partner' | null = null
  let userId: string | null = null

  const clientToken = request.cookies.get(CLIENT_COOKIE_NAME)?.value
  if (clientToken) {
    const session = await verifyClientSession(clientToken)
    if (session) {
      userType = 'client'
      userId = session.clientId
    }
  }

  if (!userId) {
    const partnerToken = request.cookies.get(PARTNER_COOKIE_NAME)?.value
    if (partnerToken) {
      const session = await verifyPartnerSession(partnerToken)
      if (session) {
        userType = 'partner'
        userId = session.userId
      }
    }
  }

  if (!userType || !userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { error } = await sb
    .from('notifications')
    .update({ read: true })
    .eq('user_type', userType)
    .eq('user_id', userId)
    .eq('read', false)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
