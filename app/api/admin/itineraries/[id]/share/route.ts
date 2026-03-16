import { NextRequest, NextResponse } from 'next/server'
import { generateShareToken, getItinerary } from '@/lib/itineraries'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const itinerary = await getItinerary(id)
  if (!itinerary) {
    return NextResponse.json({ error: 'Itinerary not found' }, { status: 404 })
  }

  // If already has a share token, return it
  if (itinerary.share_token) {
    return NextResponse.json({ share_token: itinerary.share_token })
  }

  try {
    const token = await generateShareToken(id)
    return NextResponse.json({ share_token: token })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
