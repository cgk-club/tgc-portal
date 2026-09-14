import { NextRequest, NextResponse } from 'next/server'
import { assignedCaller } from '@/lib/partner-event-auth'
import { getSupabaseAdmin } from '@/lib/supabase'
import { recordChange, updateEventItem, type EventGuest, type ItemInput } from '@/lib/events'

export const dynamic = 'force-dynamic'

// What the team may change from a phone on the day: status, times, place.
// Titles, visibility, guests and logistics stay with the admin.
const ALLOWED: (keyof ItemInput)[] = ['status', 'exact_time', 'end_time', 'location', 'location_confirmed']

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string; itemId: string }> }) {
  const { id, itemId } = await params
  const { caller, assignment } = await assignedCaller(request, id)
  if (!caller) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!assignment) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const sb = getSupabaseAdmin()
  const { data: row } = await sb
    .from('itinerary_items')
    .select('id, day:itinerary_days!inner(date, itinerary_id, itinerary:itineraries!inner(kind, status))')
    .eq('id', itemId)
    .eq('day.itinerary_id', id)
    .maybeSingle()
  const day = row?.day as unknown as { date: string | null; itinerary: { kind: string; status: string } } | undefined
  if (!row || !day || day.itinerary.kind !== 'event' || day.itinerary.status === 'archived') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const body = await request.json().catch(() => ({}))
  const input: ItemInput = {}
  for (const k of ALLOWED) if (k in body) (input as Record<string, unknown>)[k] = body[k]
  if (!Object.keys(input).length) return NextResponse.json({ error: 'Nothing to change' }, { status: 400 })

  try {
    const { before, after } = await updateEventItem(itemId, input)
    const { data: guests } = await sb.from('itinerary_guests').select('*').eq('itinerary_id', id)
    const change = await recordChange({
      itineraryId: id,
      before,
      after,
      date: day.date,
      actorType: 'partner',
      actorName: caller.userName,
      actorUserId: caller.userId,
      guests: (guests || []) as EventGuest[],
    })
    return NextResponse.json({ item: after, change: change ? { id: change.id, summary: change.summary } : null })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Could not save' }, { status: 500 })
  }
}
