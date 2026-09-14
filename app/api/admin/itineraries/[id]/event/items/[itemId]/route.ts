import { NextRequest, NextResponse } from 'next/server'
import { requireAdminAuth } from '@/lib/auth'
import { getSupabaseAdmin } from '@/lib/supabase'
import { deleteEventItem, recordChange, updateEventItem, type EventGuest } from '@/lib/events'

export const dynamic = 'force-dynamic'

async function itemInItinerary(itemId: string, itineraryId: string) {
  const { data } = await getSupabaseAdmin()
    .from('itinerary_items')
    .select('id, day:itinerary_days!inner(id, date, itinerary_id, itinerary:itineraries!inner(status))')
    .eq('id', itemId)
    .eq('day.itinerary_id', itineraryId)
    .maybeSingle()
  if (!data) return null
  const day = data.day as unknown as { id: string; date: string | null; itinerary_id: string; itinerary: { status: string } }
  return { date: day.date, status: day.itinerary.status }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string; itemId: string }> }) {
  const denied = await requireAdminAuth(request)
  if (denied) return denied
  const { id, itemId } = await params
  const ctx = await itemInItinerary(itemId, id)
  if (!ctx) return NextResponse.json({ error: 'Line not found' }, { status: 404 })
  const body = await request.json().catch(() => ({}))

  try {
    const { before, after } = await updateEventItem(itemId, body)
    // While an itinerary is still a draft it is being built, not run: no change log.
    let change = null
    if (ctx.status === 'shared' && body.broadcast !== false) {
      const { data: guests } = await getSupabaseAdmin().from('itinerary_guests').select('*').eq('itinerary_id', id)
      change = await recordChange({
        itineraryId: id,
        before,
        after,
        date: ctx.date,
        actorType: 'admin',
        actorName: 'Christian',
        guests: (guests || []) as EventGuest[],
      })
    }
    return NextResponse.json({ item: after, change })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Could not save the line' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string; itemId: string }> }) {
  const denied = await requireAdminAuth(request)
  if (denied) return denied
  const { id, itemId } = await params
  if (!(await itemInItinerary(itemId, id))) return NextResponse.json({ error: 'Line not found' }, { status: 404 })
  try {
    await deleteEventItem(itemId)
    return NextResponse.json({ success: true })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Could not delete the line' }, { status: 500 })
  }
}
