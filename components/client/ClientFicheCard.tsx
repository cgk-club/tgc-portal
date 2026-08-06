import { ItineraryItem, Fiche, AirtableOrg } from '@/types'

const TIME_LABELS: Record<string, string> = {
  breakfast: 'Breakfast',
  morning: 'Morning',
  lunch: 'Lunch',
  afternoon: 'Afternoon',
  evening: 'Evening',
  dinner: 'Dinner',
  late_night: 'Late Night',
}

interface ClientFicheCardProps {
  item: ItineraryItem
}

export default function ClientFicheCard({ item }: ClientFicheCardProps) {
  const fiche = item.fiche as (Fiche & { org?: AirtableOrg }) | undefined
  const name = item.custom_title || fiche?.org?.name || fiche?.name || fiche?.headline || 'Untitled'
  const heroUrl = fiche?.hero_image_url
  // The note written for THIS trip outranks the fiche's general description. Showing the
  // description instead dropped the per-trip detail (times, what is booked, why it is here)
  // from the client's view the moment an item was linked to a fiche.
  const isTripNote = Boolean(item.custom_note)
  const description = item.custom_note || fiche?.description
  const slug = fiche?.slug
  const org = fiche?.org
  const location =
    (org ? [org.city, org.country].filter(Boolean).join(', ') : '') || fiche?.location || ''

  const timeParts: string[] = []
  if (item.time_of_day) timeParts.push(TIME_LABELS[item.time_of_day] || item.time_of_day)
  if (item.exact_time) timeParts.push(item.exact_time)
  const timeLabel = timeParts.join(' \u00B7 ')

  return (
    <div className="bg-white rounded-[8px] shadow-sm border border-gray-100 overflow-hidden flex flex-col md:flex-row">
      {heroUrl && (
        <div className="md:w-2/5 h-48 md:h-auto flex-shrink-0">
          <img src={heroUrl} alt={name} className="w-full h-full object-cover" />
        </div>
      )}
      <div className="p-4 sm:p-5 flex-1">
        {timeLabel && (
          <span className="inline-block bg-gold-light text-gold text-xs font-medium px-2 py-0.5 rounded-full mb-2">
            {timeLabel}
          </span>
        )}
        <h4 className="font-heading text-base font-semibold text-green mb-1">{name}</h4>
        {location && (
          <p className="text-xs text-gray-400 font-body mb-2">{location}</p>
        )}
        {description && (
          <p className="text-sm text-gray-600 font-body mb-3 leading-relaxed whitespace-pre-line">
            {isTripNote
              ? description
              : `${description.slice(0, 200)}${description.length > 200 ? '…' : ''}`}
          </p>
        )}
        {slug && (
          <a
            href={fiche?.status === 'live' ? `/fiche/${slug}` : `/fiche/${slug}?preview=true`}
            className="text-sm text-green hover:text-green-light font-medium font-body"
          >
            View full details &rarr;
          </a>
        )}
      </div>
    </div>
  )
}
