'use client'

import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { calculateBounds } from './mapUtils'

interface MapStop {
  lat: number
  lng: number
  name: string
  dayNumber: number
}

interface ItineraryMapProps {
  stops: MapStop[]
}

const GREEN = '#0e4f51'
const GOLD = '#c8aa4a'
const PEARL = '#F9F8F5'

function createStopIcon(number: number): L.DivIcon {
  return L.divIcon({
    className: '',
    html: `<div style="
      position: relative;
      width: 32px;
      height: 32px;
    ">
      <div style="
        background: ${GREEN};
        color: ${PEARL};
        width: 32px;
        height: 32px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 13px;
        font-weight: 600;
        font-family: 'Poppins', sans-serif;
        letter-spacing: 0.5px;
        border: 2.5px solid ${PEARL};
        box-shadow: 0 2px 8px rgba(14,79,81,0.3), 0 0 0 1px rgba(14,79,81,0.1);
      ">${number}</div>
    </div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -20],
  })
}

function createPopupContent(stop: MapStop): string {
  return `<div style="
    font-family: 'Poppins', sans-serif;
    padding: 4px 2px;
    min-width: 120px;
  ">
    <div style="
      font-size: 10px;
      letter-spacing: 2px;
      color: ${GOLD};
      text-transform: uppercase;
      margin-bottom: 4px;
    ">Day ${stop.dayNumber}</div>
    <div style="
      font-size: 14px;
      font-weight: 600;
      color: ${GREEN};
      line-height: 1.3;
    ">${stop.name}</div>
  </div>`
}

export default function ItineraryMap({ stops }: ItineraryMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstance = useRef<L.Map | null>(null)

  useEffect(() => {
    if (!mapRef.current || mapInstance.current || stops.length === 0) return

    const map = L.map(mapRef.current, {
      scrollWheelZoom: false,
      zoomControl: false,
      attributionControl: false,
    })

    // Add zoom control to bottom-right
    L.control.zoom({ position: 'bottomright' }).addTo(map)

    // Attribution in bottom-left, minimal
    L.control.attribution({ position: 'bottomleft', prefix: false })
      .addAttribution('&copy; <a href="https://carto.com" style="color:#999">CARTO</a>')
      .addTo(map)

    // CartoDB Positron - elegant, minimal, muted
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      subdomains: 'abcd',
      maxZoom: 19,
    }).addTo(map)

    const points = stops.map(s => ({ lat: s.lat, lng: s.lng }))
    map.fitBounds(calculateBounds(points))

    // Draw route line - subtle curved feel with gold
    if (stops.length > 1) {
      const latlngs: L.LatLngExpression[] = stops.map(s => [s.lat, s.lng])

      // Shadow line
      L.polyline(latlngs, {
        color: GREEN,
        weight: 5,
        opacity: 0.1,
        lineCap: 'round',
        lineJoin: 'round',
      }).addTo(map)

      // Main route line
      L.polyline(latlngs, {
        color: GOLD,
        weight: 2.5,
        opacity: 0.7,
        dashArray: '8, 6',
        lineCap: 'round',
        lineJoin: 'round',
      }).addTo(map)
    }

    // Add markers on top of lines
    stops.forEach((stop, index) => {
      L.marker([stop.lat, stop.lng], {
        icon: createStopIcon(index + 1),
      })
        .bindPopup(createPopupContent(stop), {
          closeButton: false,
          className: 'tgc-popup',
          offset: [0, -4],
        })
        .addTo(map)
    })

    mapInstance.current = map

    return () => {
      map.remove()
      mapInstance.current = null
    }
  }, [stops])

  if (stops.length === 0) return null

  return (
    <>
      <style>{`
        .tgc-popup .leaflet-popup-content-wrapper {
          border-radius: 8px;
          box-shadow: 0 4px 20px rgba(14,79,81,0.15);
          border: 1px solid rgba(14,79,81,0.08);
          padding: 0;
        }
        .tgc-popup .leaflet-popup-content {
          margin: 10px 14px;
        }
        .tgc-popup .leaflet-popup-tip {
          box-shadow: 0 4px 20px rgba(14,79,81,0.15);
        }
      `}</style>
      <div
        ref={mapRef}
        className="w-full rounded-[12px] overflow-hidden border border-gray-100"
        style={{ height: 420 }}
      />
    </>
  )
}
