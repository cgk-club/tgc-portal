'use client'

import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { createNumberedIcon, calculateBounds } from './mapUtils'

interface MapStop {
  lat: number
  lng: number
  name: string
  dayNumber: number
}

interface ItineraryMapProps {
  stops: MapStop[]
}

const GOLD = '#c8aa4a'

export default function ItineraryMap({ stops }: ItineraryMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstance = useRef<L.Map | null>(null)

  useEffect(() => {
    if (!mapRef.current || mapInstance.current || stops.length === 0) return

    const map = L.map(mapRef.current, {
      scrollWheelZoom: false,
      zoomControl: true,
    })

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map)

    const points = stops.map(s => ({ lat: s.lat, lng: s.lng }))
    map.fitBounds(calculateBounds(points))

    // Add numbered markers
    stops.forEach((stop, index) => {
      L.marker([stop.lat, stop.lng], {
        icon: createNumberedIcon(index + 1),
      })
        .bindPopup(`<strong>${stop.name}</strong><br/>Day ${stop.dayNumber}`)
        .addTo(map)
    })

    // Draw polyline connecting stops
    if (stops.length > 1) {
      const latlngs: L.LatLngExpression[] = stops.map(s => [s.lat, s.lng])
      L.polyline(latlngs, {
        color: GOLD,
        weight: 3,
        opacity: 0.8,
        dashArray: '8, 8',
      }).addTo(map)
    }

    mapInstance.current = map

    return () => {
      map.remove()
      mapInstance.current = null
    }
  }, [stops])

  if (stops.length === 0) return null

  return (
    <div
      ref={mapRef}
      className="w-full rounded-[8px] overflow-hidden"
      style={{ height: 450 }}
    />
  )
}
