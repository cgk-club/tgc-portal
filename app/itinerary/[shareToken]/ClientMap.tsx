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
    <section className="my-10">
      <div className="flex items-center gap-3 mb-5">
        <div className="h-px flex-1 bg-gray-200" />
        <h2 className="font-heading text-sm font-semibold tracking-widest text-gold uppercase">
          Your Journey
        </h2>
        <div className="h-px flex-1 bg-gray-200" />
      </div>
      <ItineraryMap stops={stops} />
    </section>
  )
}
