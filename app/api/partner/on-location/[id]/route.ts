import { NextRequest, NextResponse } from 'next/server'
import { assignedCaller } from '@/lib/partner-event-auth'
import { forTeam, loadEvent } from '@/lib/events'

export const dynamic = 'force-dynamic'
// Supabase queries are fetch() calls, which Next.js 14 caches in GET handlers.
export const fetchCache = 'force-no-store'

// One event as the team's phone sees it. Only for accounts assigned to it.
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { caller, assignment } = await assignedCaller(request, id)
  if (!caller) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!assignment) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  const event = await loadEvent(id)
  if (!event || event.kind !== 'event' || event.status === 'archived') return NextResponse.json({ error: 'Not found' }, { status: 404 })
  const view = forTeam(event, assignment.can_see_guest_contacts, caller.userId)
  return NextResponse.json({ ...view, user: { name: caller.userName, account_type: caller.accountType } }, { headers: { 'Cache-Control': 'no-store' } })
}
