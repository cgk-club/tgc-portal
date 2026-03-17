import { Itinerary } from '@/types'

interface ClientItineraryCoverProps {
  itinerary: Itinerary
}

export default function ClientItineraryCover({ itinerary }: ClientItineraryCoverProps) {
  const days = itinerary.days || []
  const destinations = new Set<string>()
  for (const day of days) {
    for (const item of day.items || []) {
      if (item.item_type === 'fiche') {
        destinations.add(item.custom_title || '')
      }
    }
  }

  let dateRange = ''
  if (itinerary.start_date && days.length > 0) {
    const start = new Date(itinerary.start_date + 'T00:00:00')
    const end = new Date(start)
    end.setDate(end.getDate() + days.length - 1)
    const fmt = (d: Date) => d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
    dateRange = `${fmt(start)} \u2013 ${fmt(end)}`
  }

  return (
    <section className="py-10 sm:py-16 md:py-24 text-center">
      <p className="text-sm text-gray-400 font-body mb-2">A journey curated for</p>
      <h1 className="font-heading text-2xl sm:text-3xl md:text-4xl font-semibold text-green mb-3">
        {itinerary.client_name}
      </h1>
      <p className="font-heading text-lg text-gold mb-4">{itinerary.title}</p>
      {dateRange && (
        <p className="text-sm text-gray-400 font-body mb-2">{dateRange}</p>
      )}
      <p className="text-sm text-gray-400 font-body">
        {days.length} days
        {destinations.size > 0 && ` \u00B7 ${destinations.size} destinations`}
      </p>
    </section>
  )
}
