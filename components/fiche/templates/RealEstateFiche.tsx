import { Fiche, Highlight } from '@/types'
import { AirtableOrg } from '@/types'
import { RealEstateFields } from '@/lib/ficheTemplates'
import FicheHero from '@/components/fiche/FicheHero'
import FicheGallery from '@/components/fiche/FicheGallery'
import FicheTags from '@/components/fiche/FicheTags'
import FicheContact from '@/components/fiche/FicheContact'

interface Props {
  fiche: Fiche
  org: AirtableOrg | null
  name: string
  location: string
  highlights: Highlight[]
  galleryUrls: string[]
  tags: string[]
  mapSlot?: React.ReactNode
}

const CATERING_LABELS: Record<string, string> = {
  'self-catered': 'Self-catered',
  'chef-available': 'Chef available',
  'full-board': 'Full board',
}

const EVENTS_LABELS: Record<string, string> = {
  'yes': 'Yes',
  'no': 'No',
  'on-request': 'On request',
}

export default function RealEstateFiche({
  fiche,
  org,
  name,
  location,
  highlights,
  galleryUrls,
  tags,
  mapSlot,
}: Props) {
  const tf = (fiche.template_fields || {}) as RealEstateFields

  const totalSleeps = (tf.sleeps_adults || 0) + (tf.sleeps_children || 0)
  const autoHighlights: Highlight[] = []
  if (totalSleeps > 0) autoHighlights.push({ icon: '\u{1F465}', label: 'Sleeps', value: String(totalSleeps) })
  if (tf.bedrooms) autoHighlights.push({ icon: '\u{1F6CF}', label: 'Bedrooms', value: String(tf.bedrooms) })
  if (tf.pool && tf.pool !== 'none') autoHighlights.push({ icon: '\u{1F3CA}', label: 'Pool', value: tf.pool.charAt(0).toUpperCase() + tf.pool.slice(1) })
  if (tf.nearest_airport) {
    const airportLabel = tf.transfer_time ? `${tf.nearest_airport}, ${tf.transfer_time}` : tf.nearest_airport
    autoHighlights.push({ icon: '\u2708', label: 'Airport', value: airportLabel })
  }

  const displayHighlights = highlights.length > 0 ? highlights : autoHighlights

  const hasDetails = tf.sleeps_adults || tf.bedrooms || tf.bathrooms || tf.pool || tf.nearest_airport ||
    tf.catering || tf.events_permitted || tf.minimum_stay || (fiche.show_price && fiche.price_display)

  return (
    <>
      <FicheHero
        name={name}
        headline={fiche.headline}
        category={org?.category || ''}
        categorySub={org?.categorySub || ''}
        location={location}
        heroImageUrl={fiche.hero_image_url}
      />

      {displayHighlights.length > 0 && (
        <div className="bg-green-muted py-8 px-8 md:px-12 lg:px-16">
          <div className="max-w-5xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-6">
            {displayHighlights.map((h, i) => (
              <div key={i} className="text-center">
                <div className="text-2xl mb-1">{h.icon}</div>
                <div className="text-xs text-gray-500 uppercase tracking-wide font-body">{h.label}</div>
                <div className="text-sm font-medium text-green font-body mt-0.5">{h.value}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {mapSlot}

      {fiche.description && (
        <div className="py-10 px-8 md:px-12 lg:px-16">
          <div className="max-w-3xl mx-auto">
            <div className="prose prose-lg font-body text-gray-700 leading-relaxed whitespace-pre-line max-w-[65ch]">
              {fiche.description}
            </div>
          </div>
        </div>
      )}

      {hasDetails && (
        <div className="py-8 px-8 md:px-12 lg:px-16">
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-[8px] border border-gray-200 p-6">
              <h3 className="font-heading text-lg font-semibold text-green mb-4">Property Details</h3>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 text-sm font-body">
                {tf.sleeps_adults && (
                  <div className="flex justify-between sm:block">
                    <dt className="text-gray-400">Sleeps</dt>
                    <dd className="text-gray-900 font-medium">
                      {tf.sleeps_adults} adults{tf.sleeps_children ? `, ${tf.sleeps_children} children` : ''}
                    </dd>
                  </div>
                )}
                {tf.bedrooms && (
                  <div className="flex justify-between sm:block">
                    <dt className="text-gray-400">Bedrooms</dt>
                    <dd className="text-gray-900 font-medium">{tf.bedrooms}</dd>
                  </div>
                )}
                {tf.bathrooms && (
                  <div className="flex justify-between sm:block">
                    <dt className="text-gray-400">Bathrooms</dt>
                    <dd className="text-gray-900 font-medium">{tf.bathrooms}</dd>
                  </div>
                )}
                {tf.pool && tf.pool !== 'none' && (
                  <div className="flex justify-between sm:block">
                    <dt className="text-gray-400">Pool</dt>
                    <dd className="text-gray-900 font-medium">
                      {tf.pool.charAt(0).toUpperCase() + tf.pool.slice(1)}{tf.pool_size ? `, ${tf.pool_size}` : ''}
                    </dd>
                  </div>
                )}
                {tf.nearest_airport && (
                  <div className="flex justify-between sm:block">
                    <dt className="text-gray-400">Nearest airport</dt>
                    <dd className="text-gray-900 font-medium">{tf.nearest_airport}</dd>
                  </div>
                )}
                {tf.transfer_time && (
                  <div className="flex justify-between sm:block">
                    <dt className="text-gray-400">Transfer</dt>
                    <dd className="text-gray-900 font-medium">{tf.transfer_time}</dd>
                  </div>
                )}
                {tf.catering && (
                  <div className="flex justify-between sm:block">
                    <dt className="text-gray-400">Catering</dt>
                    <dd className="text-gray-900 font-medium">{CATERING_LABELS[tf.catering] || tf.catering}</dd>
                  </div>
                )}
                {tf.events_permitted && (
                  <div className="flex justify-between sm:block">
                    <dt className="text-gray-400">Events</dt>
                    <dd className="text-gray-900 font-medium">{EVENTS_LABELS[tf.events_permitted] || tf.events_permitted}</dd>
                  </div>
                )}
                {tf.exclusive_hire && (
                  <div className="flex justify-between sm:block">
                    <dt className="text-gray-400">Hire</dt>
                    <dd className="text-gray-900 font-medium">Exclusive hire only</dd>
                  </div>
                )}
                {tf.minimum_stay && (
                  <div className="flex justify-between sm:block">
                    <dt className="text-gray-400">Minimum stay</dt>
                    <dd className="text-gray-900 font-medium">{tf.minimum_stay}</dd>
                  </div>
                )}
                {fiche.show_price && fiche.price_display && (
                  <div className="flex justify-between sm:block">
                    <dt className="text-gray-400">Rate</dt>
                    <dd className="text-gray-900 font-medium">{fiche.price_display}</dd>
                  </div>
                )}
              </dl>
            </div>
          </div>
        </div>
      )}

      <FicheGallery images={galleryUrls} name={name} />

      <FicheTags tags={tags} />

      <FicheContact name={name} />
    </>
  )
}
