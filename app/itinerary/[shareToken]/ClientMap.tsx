'use client'

import dynamic from 'next/dynamic'

const ItineraryMap = dynamic(() => import('@/components/maps/ItineraryMap'), { ssr: false })

interface MapStop {
  lat: number
  lng: number
  name: string
  dayNumber: number
}

export default function ClientMap({ stops }: { stops: MapStop[] }) {
  if (stops.length === 0) return null

  return (
    <section className="mb-12">
      <h2 className="font-heading text-lg font-semibold text-green mb-4">Your Journey</h2>
      <ItineraryMap stops={stops} />
    </section>
  )
}
