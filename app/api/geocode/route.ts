import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  const { location, ficheId } = await request.json()

  if (!location) {
    return NextResponse.json({ error: 'Location is required' }, { status: 400 })
  }

  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?${new URLSearchParams({
        q: location,
        format: 'json',
        limit: '1',
      })}`,
      {
        headers: {
          'User-Agent': 'TGCPortal/1.0 (christian@thegatekeepers.club)',
        },
      }
    )

    if (!res.ok) {
      return NextResponse.json({ error: 'Geocoding service error' }, { status: 502 })
    }

    const results = await res.json()

    if (!results.length) {
      return NextResponse.json({ error: 'Location not found' }, { status: 404 })
    }

    const lat = parseFloat(results[0].lat)
    const lng = parseFloat(results[0].lon)

    // If ficheId provided, cache the result in Supabase
    if (ficheId) {
      await getSupabaseAdmin()
        .from('fiches')
        .update({
          latitude: lat,
          longitude: lng,
          geocoded_at: new Date().toISOString(),
        })
        .eq('id', ficheId)
    }

    return NextResponse.json({ lat, lng })
  } catch {
    return NextResponse.json({ error: 'Geocoding failed' }, { status: 500 })
  }
}
