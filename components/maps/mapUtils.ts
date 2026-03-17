import L from 'leaflet'

const GREEN = '#0e4f51'

export function createGreenIcon(): L.Icon {
  return L.icon({
    iconUrl: createMarkerSvgUrl(GREEN),
    iconSize: [28, 42],
    iconAnchor: [14, 42],
    popupAnchor: [0, -42],
  })
}

export function createNumberedIcon(number: number): L.DivIcon {
  return L.divIcon({
    className: '',
    html: `<div style="
      background: ${GREEN};
      color: white;
      width: 28px;
      height: 28px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: 600;
      font-family: sans-serif;
      border: 2px solid white;
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
    ">${number}</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14],
  })
}

function createMarkerSvgUrl(color: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="42" viewBox="0 0 28 42">
    <path d="M14 0C6.268 0 0 6.268 0 14c0 10.5 14 28 14 28s14-17.5 14-28C28 6.268 21.732 0 14 0z" fill="${color}"/>
    <circle cx="14" cy="14" r="6" fill="white"/>
  </svg>`
  return `data:image/svg+xml;base64,${typeof btoa !== 'undefined' ? btoa(svg) : Buffer.from(svg).toString('base64')}`
}

export function calculateBounds(
  points: { lat: number; lng: number }[]
): L.LatLngBoundsExpression {
  if (points.length === 0) return [[0, 0], [0, 0]]
  if (points.length === 1) {
    return [
      [points[0].lat - 0.5, points[0].lng - 0.5],
      [points[0].lat + 0.5, points[0].lng + 0.5],
    ]
  }
  const lats = points.map(p => p.lat)
  const lngs = points.map(p => p.lng)
  const padding = 0.1
  return [
    [Math.min(...lats) - padding, Math.min(...lngs) - padding],
    [Math.max(...lats) + padding, Math.max(...lngs) + padding],
  ]
}
