import { NextRequest, NextResponse } from 'next/server'
import { requireAdminAuth } from '@/lib/auth'
import { getSupabaseAdmin } from '@/lib/supabase'
import { loadEvent, readSettings } from '@/lib/events'

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

// The whole event for the admin: run of show with logistics, guests, team, changes.
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAdminAuth(request)
  if (denied) return denied
  const { id } = await params
  const event = await loadEvent(id)
  if (!event) return NextResponse.json({ error: 'Itinerary not found' }, { status: 404 })
  return NextResponse.json(event)
}

// Shape and switches: kind (trip, event, programme) and the event settings.
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAdminAuth(request)
  if (denied) return denied
  const { id } = await params
  const body = await request.json().catch(() => ({}))
  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (['trip', 'event', 'programme'].includes(body.kind)) patch.kind = body.kind
  if (body.event_settings && typeof body.event_settings === 'object') {
    const { data: current } = await getSupabaseAdmin().from('itineraries').select('event_settings').eq('id', id).single()
    patch.event_settings = readSettings({ ...readSettings(current?.event_settings), ...body.event_settings })
  }
  const { error } = await getSupabaseAdmin().from('itineraries').update(patch).eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  const event = await loadEvent(id)
  return NextResponse.json(event)
}
