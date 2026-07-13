'use client'

import dynamic from 'next/dynamic'
import { Itinerary } from '@/types'

// @react-pdf/renderer must never be evaluated during server render: in the RSC/server
// bundle it resolves to undefined and throws "Element type is invalid", which 500s the
// entire itinerary route. Load it client-only, the same pattern used for Leaflet maps.
const PDFExport = dynamic(() => import('@/components/itinerary/PDFExport'), {
  ssr: false,
})

export default function ClientItineraryPDF({ itinerary }: { itinerary: Itinerary }) {
  return <PDFExport itinerary={itinerary} />
}
