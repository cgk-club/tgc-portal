import { ItineraryDay } from '@/types'
import ClientFicheCard from './ClientFicheCard'
import ClientNoteCard from './ClientNoteCard'

interface ClientDaySectionProps {
  day: ItineraryDay
}

export default function ClientDaySection({ day }: ClientDaySectionProps) {
  const dateLabel = day.date
    ? new Date(day.date + 'T00:00:00').toLocaleDateString('en-GB', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      })
    : null

  const items = day.items || []

  return (
    <section className="mb-12">
      <div className="border-b-2 border-green pb-2 mb-6">
        <h3 className="font-heading text-lg font-semibold text-green">
          Day {day.day_number}
          {day.title && ` \u2014 ${day.title}`}
        </h3>
        {dateLabel && (
          <p className="text-sm text-gray-400 font-body mt-1">{dateLabel}</p>
        )}
      </div>

      <div className="space-y-4">
        {items.map((item) =>
          item.item_type === 'note' ? (
            <ClientNoteCard key={item.id} item={item} />
          ) : (
            <ClientFicheCard key={item.id} item={item} />
          )
        )}
        {items.length === 0 && (
          <p className="text-sm text-gray-400 font-body italic">No items for this day.</p>
        )}
      </div>
    </section>
  )
}
