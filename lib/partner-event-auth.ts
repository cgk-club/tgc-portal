// Who is asking, for the on-location routes: a signed-in partner user whose
// account is active, and (when an event is named) assigned to that event.
import { NextRequest } from 'next/server'
import { unstable_noStore as noStore } from 'next/cache'
import { verifyPartnerSession, PARTNER_COOKIE_NAME } from '@/lib/partner-auth'
import { getSupabaseAdmin } from '@/lib/supabase'
import { getAssignment } from '@/lib/events'

export interface OnLocationCaller {
  partnerId: string
  userId: string
  userName: string
  accountType: 'partner' | 'staff'
}

export async function partnerCaller(request: NextRequest): Promise<OnLocationCaller | null> {
  noStore() // account status and team membership change; never serve them from the fetch cache
  const token = request.cookies.get(PARTNER_COOKIE_NAME)?.value
  if (!token) return null
  const session = await verifyPartnerSession(token)
  if (!session) return null
  const sb = getSupabaseAdmin()
  const [{ data: user }, { data: account }] = await Promise.all([
    sb.from('partner_users').select('id, name, email, partner_id').eq('id', session.userId).maybeSingle(),
    sb.from('partner_accounts').select('id, status, account_type, org_name').eq('id', session.partnerId).maybeSingle(),
  ])
  if (!user || !account || account.status !== 'active' || user.partner_id !== account.id) return null
  return {
    partnerId: account.id,
    userId: user.id,
    userName: user.name || account.org_name || user.email,
    accountType: account.account_type === 'staff' ? 'staff' : 'partner',
  }
}

export async function assignedCaller(request: NextRequest, itineraryId: string) {
  const caller = await partnerCaller(request)
  if (!caller) return { caller: null, assignment: null }
  const assignment = await getAssignment(itineraryId, caller.partnerId)
  return { caller, assignment }
}
