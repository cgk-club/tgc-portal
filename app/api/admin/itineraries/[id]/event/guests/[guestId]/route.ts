import { NextRequest, NextResponse } from 'next/server'
import { requireAdminAuth } from '@/lib/auth'
import { getSupabaseAdmin } from '@/lib/supabase'
import { deleteGuest, ensureCallSheetToken, updateGuest } from '@/lib/events'

export const dynamic = 'force-dynamic'

async function guestInItinerary(guestId: string, itineraryId: string) {
  const { data } = await getSupabaseAdmin().from('itinerary_guests').select('id').eq('id', guestId).eq('itinerary_id', itineraryId).maybeSingle()
  return !!data
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string; guestId: string }> }) {
  const denied = await requireAdminAuth(request)
  if (denied) return denied
  const { id, guestId } = await params
  if (!(await guestInItinerary(guestId, id))) return NextResponse.json({ error: 'Guest not found' }, { status: 404 })
  try {
    await updateGuest(guestId, await request.json().catch(() => ({})))
    return NextResponse.json({ success: true })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Could not save the guest' }, { status: 400 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string; guestId: string }> }) {
  const denied = await requireAdminAuth(request)
  if (denied) return denied
  const { id, guestId } = await params
  if (!(await guestInItinerary(guestId, id))) return NextResponse.json({ error: 'Guest not found' }, { status: 404 })
  await deleteGuest(guestId)
  return NextResponse.json({ success: true })
}

// Mint (or return) the guest's private call-sheet link token.
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string; guestId: string }> }) {
  const denied = await requireAdminAuth(request)
  if (denied) return denied
  const { id, guestId } = await params
  if (!(await guestInItinerary(guestId, id))) return NextResponse.json({ error: 'Guest not found' }, { status: 404 })
  const token = await ensureCallSheetToken(guestId)
  return NextResponse.json({ token })
}
