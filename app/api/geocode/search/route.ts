import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q')?.trim()
  if (!q || q.length < 2) return NextResponse.json([])

  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?${new URLSearchParams({
        q,
        format: 'json',
        addressdetails: '1',
        limit: '8',
        'accept-language': 'en',
        featuretype: 'city',
      })}`,
      { headers: { 'User-Agent': 'TGCPortal/1.0 (christian@thegatekeepers.club)' } }
    )
    if (!res.ok) return NextResponse.json([])

    const raw = await res.json()

    // Normalise to minimal City shape
    const seen = new Set<string>()
    const cities = raw
      .filter((r: any) => ['city','town','village','municipality','suburb','hamlet'].includes(r.type) || r.class === 'place')
      .map((r: any) => {
        const name = r.address?.city || r.address?.town || r.address?.village || r.address?.municipality || r.name
        const country = (r.address?.country_code || '').toUpperCase()
        return { id: `nm-${r.place_id}`, name, country, region: 'other', lat: parseFloat(r.lat), lng: parseFloat(r.lon) }
      })
      .filter((c: any) => {
        if (!c.name) return false
        const key = `${c.name.toLowerCase()}|${c.country}`
        if (seen.has(key)) return false
        seen.add(key)
        return true
      })
      .slice(0, 6)

    return NextResponse.json(cities)
  } catch {
    return NextResponse.json([])
  }
}
