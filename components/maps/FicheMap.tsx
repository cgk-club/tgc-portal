'use client'

import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { createGreenIcon } from './mapUtils'

interface FicheMapProps {
  lat: number
  lng: number
  name: string
}

export default function FicheMap({ lat, lng, name }: FicheMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstance = useRef<L.Map | null>(null)

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return

    const map = L.map(mapRef.current, {
      scrollWheelZoom: false,
      zoomControl: true,
    }).setView([lat, lng], 13)

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map)

    L.marker([lat, lng], { icon: createGreenIcon() })
      .bindPopup(name)
      .addTo(map)

    mapInstance.current = map

    return () => {
      map.remove()
      mapInstance.current = null
    }
  }, [lat, lng, name])

  return (
    <div
      ref={mapRef}
      className="w-full rounded-[8px] overflow-hidden"
      style={{ height: 300 }}
    />
  )
}
