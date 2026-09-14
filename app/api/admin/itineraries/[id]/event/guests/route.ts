import { NextRequest, NextResponse } from 'next/server'
import { requireAdminAuth } from '@/lib/auth'
import { addGuests, MAX_GUESTS } from '@/lib/events'
import { guestsFromCsv } from '@/lib/csv'

export const dynamic = 'force-dynamic'

// Add one guest ({ guest }) or paste a list ({ csv }). Up to 50 per event.
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAdminAuth(request)
  if (denied) return denied
  const { id } = await params
  const body = await request.json().catch(() => ({}))

  let rows = [] as Parameters<typeof addGuests>[1]
  let unknownColumns: string[] = []
  if (typeof body.csv === 'string') {
    const parsed = guestsFromCsv(body.csv)
    rows = parsed.rows
    unknownColumns = parsed.unknownColumns
  } else if (body.guest && typeof body.guest === 'object') {
    rows = [body.guest]
  }
  if (!rows.length) return NextResponse.json({ error: 'No guests found. Each guest needs at least a name.' }, { status: 400 })

  try {
    const result = await addGuests(id, rows)
    return NextResponse.json({ ...result, max: MAX_GUESTS, unknownColumns }, { status: 201 })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Could not add guests' }, { status: 500 })
  }
}
