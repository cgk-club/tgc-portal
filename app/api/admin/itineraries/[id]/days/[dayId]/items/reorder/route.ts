import { NextRequest, NextResponse } from 'next/server'
import { reorderItems } from '@/lib/itineraries'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; dayId: string }> }
) {
  const { dayId } = await params
  const body = await request.json()
  const { orderedIds } = body

  if (!Array.isArray(orderedIds)) {
    return NextResponse.json({ error: 'orderedIds must be an array' }, { status: 400 })
  }

  try {
    await reorderItems(dayId, orderedIds)
    return NextResponse.json({ success: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
