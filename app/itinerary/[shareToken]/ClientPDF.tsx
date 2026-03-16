'use client'

import PDFExport from '@/components/itinerary/PDFExport'
import { Itinerary } from '@/types'

export default function ClientItineraryPDF({ itinerary }: { itinerary: Itinerary }) {
  return <PDFExport itinerary={itinerary} />
}
