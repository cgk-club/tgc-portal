import { NextRequest, NextResponse } from 'next/server'
import { partnerCaller } from '@/lib/partner-event-auth'
import { listPartnerEvents } from '@/lib/events'

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

// The events this partner or staff account is on.
export async function GET(request: NextRequest) {
  const caller = await partnerCaller(request)
  if (!caller) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const events = await listPartnerEvents(caller.partnerId)
  return NextResponse.json({ events, user: { name: caller.userName, account_type: caller.accountType } })
}
