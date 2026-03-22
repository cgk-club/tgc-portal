import { NextRequest, NextResponse } from 'next/server'
import { getItineraryByToken } from '@/lib/itineraries'
import { getOrgById } from '@/lib/airtable'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ shareToken: string }> }
) {
  const { shareToken } = await params
  const itinerary = await getItineraryByToken(shareToken)

  if (!itinerary) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  // Enrich fiche items with Airtable org data
  if (itinerary.days) {
    for (const day of itinerary.days) {
      if (day.items) {
        for (const item of day.items) {
          if (item.fiche?.airtable_record_id) {
            const org = await getOrgById(item.fiche.airtable_record_id)
            if (org) {
              ;(item.fiche as unknown as Record<string, unknown>).org = org
            }
          }
        }
      }
    }
  }

  return NextResponse.json(itinerary)
}
