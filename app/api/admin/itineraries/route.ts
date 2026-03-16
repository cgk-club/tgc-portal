import { NextRequest, NextResponse } from 'next/server'
import { createItinerary, createDay, listItineraries } from '@/lib/itineraries'
import { slugify } from '@/lib/utils'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status') || undefined
  const search = searchParams.get('search') || undefined

  try {
    const itineraries = await listItineraries({ status, search })
    return NextResponse.json(itineraries)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { client_name, title, start_date, num_days = 3 } = body

  if (!client_name || !title) {
    return NextResponse.json({ error: 'Client name and title are required' }, { status: 400 })
  }

  try {
    let slug = slugify(`${client_name}-${title}`)
    const suffix = Date.now().toString(36).slice(-4)
    slug = `${slug}-${suffix}`

    const itinerary = await createItinerary({
      client_name,
      title,
      slug,
      start_date,
    })

    // Create the specified number of days
    const dayCount = Math.min(Math.max(1, num_days), 30)
    for (let i = 1; i <= dayCount; i++) {
      let dayDate: string | undefined
      if (start_date) {
        const d = new Date(start_date)
        d.setDate(d.getDate() + i - 1)
        dayDate = d.toISOString().split('T')[0]
      }
      await createDay(itinerary.id, i, dayDate)
    }

    return NextResponse.json(itinerary, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
