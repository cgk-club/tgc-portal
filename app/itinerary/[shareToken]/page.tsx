export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import { getItineraryByToken } from '@/lib/itineraries'
import { getOrgById } from '@/lib/airtable'
import ClientItineraryCover from '@/components/client/ClientItineraryCover'
import ClientDaySection from '@/components/client/ClientDaySection'
import ClientItineraryPDF from './ClientPDF'
import ClientMap from './ClientMap'

interface PageProps {
  params: Promise<{ shareToken: string }>
  searchParams: Promise<{ preview?: string }>
}

export default async function ItineraryPage({ params, searchParams }: PageProps) {
  const { shareToken } = await params
  const { preview } = await searchParams
  const itinerary = await getItineraryByToken(shareToken)

  if (!itinerary) {
    notFound()
  }

  const isPreview = preview === 'true'

  // Archived
  if (itinerary.status === 'archived' && !isPreview) {
    return (
      <div className="min-h-screen bg-pearl flex items-center justify-center">
        <div className="text-center max-w-md">
          <span className="font-heading text-sm font-semibold tracking-wider text-gold">
            THE GATEKEEPERS CLUB
          </span>
          <p className="text-gray-500 font-body mt-4">
            This itinerary is no longer available. Please contact us if you believe this is an error.
          </p>
        </div>
      </div>
    )
  }

  // Draft - block public access but allow preview
  if (itinerary.status === 'draft' && !isPreview) {
    return (
      <div className="min-h-screen bg-pearl flex items-center justify-center">
        <div className="text-center max-w-md">
          <span className="font-heading text-sm font-semibold tracking-wider text-gold">
            THE GATEKEEPERS CLUB
          </span>
          <p className="text-gray-500 font-body mt-4">
            This itinerary is being prepared. Please check back soon.
          </p>
        </div>
      </div>
    )
  }

  // Enrich fiche items with org data
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

  const days = itinerary.days || []

  // Collect map stops from geocoded fiche items, deduplicated by location
  // Group nearby fiches (within ~0.05 degrees / ~5km) into a single stop using the day title
  const rawStops: { lat: number; lng: number; name: string; dayNumber: number }[] = []
  for (const day of days) {
    for (const item of day.items || []) {
      if (item.item_type === 'fiche' && item.fiche?.latitude && item.fiche?.longitude) {
        rawStops.push({
          lat: item.fiche.latitude,
          lng: item.fiche.longitude,
          name: day.title || item.custom_title || item.fiche.headline || 'Untitled',
          dayNumber: day.day_number,
        })
      }
    }
  }
  // Deduplicate: keep one stop per location cluster per day group
  const mapStops: { lat: number; lng: number; name: string; dayNumber: number }[] = []
  for (const stop of rawStops) {
    const isDuplicate = mapStops.some(
      existing => Math.abs(existing.lat - stop.lat) < 0.05 && Math.abs(existing.lng - stop.lng) < 0.05
    )
    if (!isDuplicate) {
      mapStops.push(stop)
    }
  }

  return (
    <div className="min-h-screen bg-pearl">
      {/* Preview banner */}
      {isPreview && (
        <div className="bg-gold text-white text-center text-xs font-body py-1.5 tracking-wide">
          PREVIEW MODE — This is how the client will see this itinerary
        </div>
      )}
      {/* Header */}
      <header className="flex items-center justify-between px-4 sm:px-6 md:px-12 py-4 border-b border-gray-100">
        <span className="font-heading text-sm font-semibold tracking-wider text-gold">
          THE GATEKEEPERS CLUB
        </span>
        <ClientItineraryPDF itinerary={itinerary} />
      </header>

      {/* Cover Image Hero */}
      {itinerary.cover_image_url && (
        <div className="relative w-full h-[40vh] sm:h-[50vh] min-h-[280px] overflow-hidden">
          <img
            src={itinerary.cover_image_url}
            alt={itinerary.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-8 md:p-12">
            <p className="text-white/70 font-body text-sm mb-2">A journey curated for</p>
            <h1 className="text-white font-heading text-2xl sm:text-3xl md:text-4xl font-semibold mb-2">
              {itinerary.client_name}
            </h1>
            <p className="text-white/80 font-heading text-base sm:text-lg">{itinerary.title}</p>
          </div>
        </div>
      )}

      {/* Cover */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        {!itinerary.cover_image_url && <ClientItineraryCover itinerary={itinerary} />}

        {/* Map */}
        {mapStops.length > 0 && <ClientMap stops={mapStops} />}

        {/* Days */}
        {days.map((day) => (
          <ClientDaySection key={day.id} day={day} />
        ))}
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-12 text-center mt-12">
        <span className="font-heading text-sm font-semibold tracking-wider text-gold">
          THE GATEKEEPERS CLUB
        </span>
        <p className="text-sm text-gray-400 font-body mt-2">
          Curated travel, crafted personally
        </p>
        <p className="text-xs text-gray-300 font-body mt-4">
          &copy; {new Date().getFullYear()} The Gatekeepers Club
        </p>
      </footer>
    </div>
  )
}
