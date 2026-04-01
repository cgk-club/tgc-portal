import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { verifyClientSession, CLIENT_COOKIE_NAME } from '@/lib/client-auth'
import { verifyPartnerSession, PARTNER_COOKIE_NAME } from '@/lib/partner-auth'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  // Try client session first
  const clientToken = request.cookies.get(CLIENT_COOKIE_NAME)?.value
  if (clientToken) {
    const session = await verifyClientSession(clientToken)
    if (session) {
      return fetchNotifications(request, 'client', session.clientId)
    }
  }

  // Try partner session
  const partnerToken = request.cookies.get(PARTNER_COOKIE_NAME)?.value
  if (partnerToken) {
    const session = await verifyPartnerSession(partnerToken)
    if (session) {
      return fetchNotifications(request, 'partner', session.userId)
    }
  }

  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}

async function fetchNotifications(
  request: NextRequest,
  userType: 'client' | 'partner',
  userId: string
) {
  const sb = getSupabaseAdmin()
  const url = new URL(request.url)
  const limitParam = url.searchParams.get('limit')
  const unreadOnly = url.searchParams.get('unread_only') === 'true'
  const limit = limitParam ? parseInt(limitParam) : 20

  let query = sb
    .from('notifications')
    .select('*')
    .eq('user_type', userType)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (unreadOnly) {
    query = query.eq('read', false)
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Also get unread count
  const { count: unreadCount } = await sb
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_type', userType)
    .eq('user_id', userId)
    .eq('read', false)

  return NextResponse.json({
    notifications: data || [],
    unread_count: unreadCount || 0,
  })
}
