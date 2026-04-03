import { ReactNode } from 'react'

const icons: Record<string, ReactNode> = {
  spa: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.2} strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
      <path d="M12 22c-4-3-8-6-8-11a8 8 0 0116 0c0 5-4 8-8 11z" />
      <path d="M12 13a3 3 0 100-6 3 3 0 000 6z" />
    </svg>
  ),
  pool: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.2} strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
      <path d="M2 20c2-1 4-1 6 0s4 1 6 0 4-1 6 0" />
      <path d="M2 16c2-1 4-1 6 0s4 1 6 0 4-1 6 0" />
      <path d="M8 12V4m8 8V4" />
      <path d="M6 4h4m4 0h4" />
    </svg>
  ),
  restaurant: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.2} strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
      <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 002-2V2" />
      <path d="M7 2v20" />
      <path d="M21 15V2v0a5 5 0 00-5 5v6c0 1.1.9 2 2 2h3zm0 0v7" />
    </svg>
  ),
  wifi: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.2} strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
      <path d="M5 12.55a11 11 0 0114.08 0" />
      <path d="M1.42 9a16 16 0 0121.16 0" />
      <path d="M8.53 16.11a6 6 0 016.95 0" />
      <circle cx="12" cy="20" r="1" />
    </svg>
  ),
  concierge: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.2} strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
      <path d="M2 18h20" />
      <path d="M12 4v2" />
      <path d="M4 18v-4a8 8 0 0116 0v4" />
      <circle cx="12" cy="4" r="1" />
    </svg>
  ),
  star: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.2} strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  ),
  bed: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.2} strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
      <path d="M2 4v16" />
      <path d="M22 4v16" />
      <path d="M2 12h20" />
      <path d="M2 20h20" />
      <path d="M4 12V8a2 2 0 012-2h12a2 2 0 012 2v4" />
      <circle cx="8" cy="8.5" r="1.5" />
    </svg>
  ),
  gym: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.2} strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
      <path d="M6.5 6.5L17.5 17.5" />
      <path d="M4 9l-2 2 5 5 2-2" />
      <path d="M15 4l2 2 5 5-2 2" />
      <path d="M9 4l2-2" />
      <path d="M13 20l2-2" />
    </svg>
  ),
  parking: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.2} strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <path d="M9 17V7h4a3 3 0 010 6H9" />
    </svg>
  ),
  aircon: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.2} strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
      <path d="M12 2v8" />
      <path d="M4.93 10.93l2.83 2.83" />
      <path d="M2 18h2" />
      <path d="M20 18h2" />
      <path d="M19.07 10.93l-2.83 2.83" />
      <path d="M12 14a4 4 0 100 8 4 4 0 000-8z" />
    </svg>
  ),
  pet: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.2} strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
      <circle cx="11" cy="4" r="2" />
      <circle cx="18" cy="8" r="2" />
      <circle cx="4" cy="8" r="2" />
      <circle cx="7" cy="14" r="2" />
      <circle cx="15" cy="14" r="2" />
      <path d="M12 22c-2 0-4-2-4-4 0-3 4-5 4-5s4 2 4 5c0 2-2 4-4 4z" />
    </svg>
  ),
  garden: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.2} strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
      <path d="M12 22V12" />
      <path d="M12 12C12 8 8 4 4 4c0 4 4 8 8 8z" />
      <path d="M12 12c0-4 4-8 8-8-0 4-4 8-8 8z" />
      <path d="M7 22h10" />
    </svg>
  ),
  bar: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.2} strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
      <path d="M8 22h8" />
      <path d="M12 11v11" />
      <path d="M4 2l8 9 8-9" />
      <path d="M5.5 5.5h13" />
    </svg>
  ),
  beach: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.2} strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
      <path d="M17 21H7l5-12.5L17 21z" />
      <path d="M12 8.5V3" />
      <path d="M12 3c3 0 5.5 2 6.5 5" />
      <path d="M12 3c-3 0-5.5 2-6.5 5" />
      <path d="M2 21h20" />
    </svg>
  ),
  view: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.2} strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
  housekeeping: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.2} strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
      <path d="M3 22h18" />
      <path d="M12 2l9 10H3L12 2z" />
      <path d="M9 22v-6h6v6" />
    </svg>
  ),
  default: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.2} strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 8v4l3 3" />
    </svg>
  ),
}

// Map common highlight labels to icon keys
const labelToIcon: Record<string, string> = {
  spa: 'spa',
  'spa & wellness': 'spa',
  wellness: 'spa',
  pool: 'pool',
  swimming: 'pool',
  restaurant: 'restaurant',
  restaurants: 'restaurant',
  dining: 'restaurant',
  wifi: 'wifi',
  'wi-fi': 'wifi',
  concierge: 'concierge',
  rooms: 'bed',
  room: 'bed',
  suites: 'bed',
  rating: 'star',
  stars: 'star',
  gym: 'gym',
  fitness: 'gym',
  parking: 'parking',
  valet: 'parking',
  'air conditioning': 'aircon',
  'air-conditioning': 'aircon',
  pets: 'pet',
  'pet friendly': 'pet',
  garden: 'garden',
  gardens: 'garden',
  grounds: 'garden',
  bar: 'bar',
  lounge: 'bar',
  beach: 'beach',
  beachfront: 'beach',
  view: 'view',
  views: 'view',
  housekeeping: 'housekeeping',
}

function getIcon(label: string): ReactNode {
  const key = labelToIcon[label.toLowerCase()] || 'default'
  return icons[key] || icons.default
}

interface AmenityItem {
  label: string
  value: string
}

interface FicheAmenityIconsProps {
  amenities: AmenityItem[]
  title?: string
}

export default function FicheAmenityIcons({ amenities, title }: FicheAmenityIconsProps) {
  if (!amenities.length) return null

  return (
    <section className="py-12 md:py-16 px-8 md:px-12 lg:px-16">
      <div className="max-w-4xl mx-auto">
        {title && (
          <h2 className="font-display text-2xl md:text-3xl text-green font-semibold mb-10 text-center">
            {title}
          </h2>
        )}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-8 gap-y-8">
          {amenities.map((a, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="text-green/70 flex-shrink-0 mt-0.5">
                {getIcon(a.label)}
              </div>
              <div>
                <div className="text-sm font-body font-semibold text-gray-800">{a.label}</div>
                {a.value && a.value !== 'Yes' && (
                  <div className="text-xs font-body text-gray-400 mt-0.5">{a.value}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
