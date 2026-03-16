import { NextRequest, NextResponse } from 'next/server'
import { getItinerary, updateItinerary } from '@/lib/itineraries'
import { getSupabaseAdmin } from '@/lib/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const itinerary = await getItinerary(id)

  if (!itinerary) {
    return NextResponse.json({ error: 'Itinerary not found' }, { status: 404 })
  }

  return NextResponse.json(itinerary)
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await request.json()

  try {
    const itinerary = await updateItinerary(id, body)
    return NextResponse.json(itinerary)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    await updateItinerary(id, { status: 'archived' } as never)
    return NextResponse.json({ success: true })
  } catch {
    // If update fails, try direct delete
    const { error } = await getSupabaseAdmin()
      .from('itineraries')
      .delete()
      .eq('id', id)
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ success: true })
  }
}
