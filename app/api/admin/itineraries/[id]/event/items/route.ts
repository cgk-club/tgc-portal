import { NextRequest, NextResponse } from 'next/server'
import { requireAdminAuth } from '@/lib/auth'
import { getSupabaseAdmin } from '@/lib/supabase'
import { createEventItem, getItemWithLogistics } from '@/lib/events'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAdminAuth(request)
  if (denied) return denied
  const { id } = await params
  const body = await request.json().catch(() => ({}))
  if (!body.day_id) return NextResponse.json({ error: 'Choose a day for this line' }, { status: 400 })

  // The day must belong to this itinerary.
  const { data: day } = await getSupabaseAdmin().from('itinerary_days').select('id').eq('id', body.day_id).eq('itinerary_id', id).maybeSingle()
  if (!day) return NextResponse.json({ error: 'That day is not part of this itinerary' }, { status: 400 })

  try {
    const itemId = await createEventItem(body.day_id, body)
    return NextResponse.json(await getItemWithLogistics(itemId), { status: 201 })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Could not add the line' }, { status: 500 })
  }
}
