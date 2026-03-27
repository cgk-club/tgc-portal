import { NextRequest, NextResponse } from 'next/server'
import { verifyClientSession, CLIENT_COOKIE_NAME } from '@/lib/client-auth'
import { verifyPartnerSession, PARTNER_COOKIE_NAME } from '@/lib/partner-auth'
import { getSupabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { feedback_type, message, screenshot_url, page_url, browser_info } = body

  if (!message || !message.trim()) {
    return NextResponse.json({ error: 'Message is required' }, { status: 400 })
  }

  const validTypes = ['bug', 'question', 'suggestion', 'other']
  const type = validTypes.includes(feedback_type) ? feedback_type : 'bug'

  // Determine user type and identity from cookies
  let userType: 'client' | 'partner' = 'client'
  let userId: string | null = null
  let userName: string | null = null
  let userEmail: string | null = null

  const sb = getSupabaseAdmin()

  // Check partner session first
  const partnerToken = request.cookies.get(PARTNER_COOKIE_NAME)?.value
  if (partnerToken) {
    const partnerSession = await verifyPartnerSession(partnerToken)
    if (partnerSession) {
      userType = 'partner'
      userId = partnerSession.userId
      userEmail = partnerSession.email

      // Get partner user name
      const { data: partnerUser } = await sb
        .from('partner_users')
        .select('name, partner_id')
        .eq('id', partnerSession.userId)
        .single()

      if (partnerUser) {
        userName = partnerUser.name

        // Also get org name
        const { data: partner } = await sb
          .from('partner_accounts')
          .select('org_name')
          .eq('id', partnerUser.partner_id)
          .single()

        if (partner?.org_name) {
          userName = userName ? `${userName} (${partner.org_name})` : partner.org_name
        }
      }
    }
  }

  // Check client session if no partner found
  if (!userId) {
    const clientToken = request.cookies.get(CLIENT_COOKIE_NAME)?.value
    if (clientToken) {
      const clientSession = await verifyClientSession(clientToken)
      if (clientSession) {
        userType = 'client'
        userId = clientSession.clientId
        userEmail = clientSession.email

        const { data: client } = await sb
          .from('client_accounts')
          .select('name')
          .eq('id', clientSession.clientId)
          .single()

        if (client) {
          userName = client.name
        }
      }
    }
  }

  // Use the user_type from the body if provided (for cases where session detection might differ)
  if (body.user_type === 'partner' || body.user_type === 'client') {
    userType = body.user_type
  }

  const { error } = await sb.from('portal_feedback').insert({
    user_type: userType,
    user_id: userId,
    user_name: userName,
    user_email: userEmail,
    page_url: page_url || null,
    feedback_type: type,
    message: message.trim(),
    screenshot_url: screenshot_url || null,
    browser_info: browser_info || null,
    status: 'new',
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true }, { status: 201 })
}
