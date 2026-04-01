import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { verifyClientSession, CLIENT_COOKIE_NAME } from '@/lib/client-auth'
import { verifyPartnerSession, PARTNER_COOKIE_NAME } from '@/lib/partner-auth'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
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

  // Verify this notification belongs to the user
  const { data: notification } = await sb
    .from('notifications')
    .select('id, user_type, user_id')
    .eq('id', id)
    .single()

  if (!notification) {
    return NextResponse.json({ error: 'Notification not found' }, { status: 404 })
  }

  if (notification.user_type !== userType || notification.user_id !== userId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { error } = await sb
    .from('notifications')
    .update({ read: true })
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
