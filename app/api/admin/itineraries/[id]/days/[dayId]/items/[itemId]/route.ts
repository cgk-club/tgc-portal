import { NextRequest, NextResponse } from 'next/server'
import { updateItem, deleteItem } from '@/lib/itineraries'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; dayId: string; itemId: string }> }
) {
  const { itemId } = await params
  const body = await request.json()

  try {
    const item = await updateItem(itemId, body)
    return NextResponse.json(item)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; dayId: string; itemId: string }> }
) {
  const { itemId } = await params

  try {
    await deleteItem(itemId)
    return NextResponse.json({ success: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
