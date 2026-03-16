import { NextRequest, NextResponse } from 'next/server'
import { createItem, updateItem, deleteItem } from '@/lib/itineraries'
import { getSupabaseAdmin } from '@/lib/supabase'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; dayId: string }> }
) {
  const { dayId } = await params
  const body = await request.json()

  // Get current max sort_order for this day
  const { data: items } = await getSupabaseAdmin()
    .from('itinerary_items')
    .select('sort_order')
    .eq('day_id', dayId)
    .order('sort_order', { ascending: false })
    .limit(1)

  const nextOrder = items && items.length > 0 ? items[0].sort_order + 1 : 0

  try {
    const item = await createItem(dayId, {
      fiche_id: body.fiche_id,
      custom_title: body.custom_title,
      custom_note: body.custom_note,
      time_of_day: body.time_of_day,
      exact_time: body.exact_time,
      item_type: body.item_type || 'fiche',
      sort_order: nextOrder,
    })
    return NextResponse.json(item, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
