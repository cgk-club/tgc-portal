import { NextRequest, NextResponse } from 'next/server'
import { createDay } from '@/lib/itineraries'
import { getSupabaseAdmin } from '@/lib/supabase'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await request.json()

  // Get current max day number
  const { data: days } = await getSupabaseAdmin()
    .from('itinerary_days')
    .select('day_number')
    .eq('itinerary_id', id)
    .order('day_number', { ascending: false })
    .limit(1)

  const nextDayNumber = days && days.length > 0 ? days[0].day_number + 1 : 1

  try {
    const day = await createDay(id, nextDayNumber, body.date, body.title)
    return NextResponse.json(day, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
