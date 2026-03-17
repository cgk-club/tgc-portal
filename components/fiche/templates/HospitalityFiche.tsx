import { Fiche, Highlight } from '@/types'
import { AirtableOrg } from '@/types'
import { HospitalityFields } from '@/lib/ficheTemplates'
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
}

export default function HospitalityFiche({
  fiche,
  org,
  name,
  location,
  highlights,
  galleryUrls,
  tags,
}: Props) {
  const tf = (fiche.template_fields || {}) as HospitalityFields

  // Build hospitality-specific highlights if template fields are populated
  const autoHighlights: Highlight[] = []
  if (tf.room_count) autoHighlights.push({ icon: '\u{1F6CF}', label: 'Rooms', value: String(tf.room_count) })
  if (tf.star_rating) autoHighlights.push({ icon: '\u2B50', label: 'Rating', value: `${tf.star_rating} star${tf.star_rating > 1 ? 's' : ''}` })
  if (tf.restaurants_onsite) autoHighlights.push({ icon: '\u{1F37D}', label: 'Restaurants', value: String(tf.restaurants_onsite) })
  if (tf.has_spa) autoHighlights.push({ icon: '\u{1F486}', label: 'Spa', value: 'Yes' })
  if (tf.pool && tf.pool !== 'none') autoHighlights.push({ icon: '\u{1F3CA}', label: 'Pool', value: tf.pool.charAt(0).toUpperCase() + tf.pool.slice(1) })

  const displayHighlights = highlights.length > 0 ? highlights : autoHighlights

  // Stay details
  const hasStayDetails = tf.checkin_time || tf.checkout_time || tf.minimum_stay || tf.pet_policy || (fiche.show_price && fiche.price_display)

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
          <div className="max-w-5xl mx-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
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

      {fiche.description && (
        <div className="py-10 px-8 md:px-12 lg:px-16">
          <div className="max-w-3xl mx-auto">
            <div className="prose prose-lg font-body text-gray-700 leading-relaxed whitespace-pre-line max-w-[65ch]">
              {fiche.description}
            </div>
          </div>
        </div>
      )}

      {hasStayDetails && (
        <div className="py-8 px-8 md:px-12 lg:px-16">
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-[8px] border border-gray-200 p-6">
              <h3 className="font-heading text-lg font-semibold text-green mb-4">Stay Details</h3>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 text-sm font-body">
                {tf.checkin_time && (
                  <div className="flex justify-between sm:block">
                    <dt className="text-gray-400">Check-in</dt>
                    <dd className="text-gray-900 font-medium">{tf.checkin_time}</dd>
                  </div>
                )}
                {tf.checkout_time && (
                  <div className="flex justify-between sm:block">
                    <dt className="text-gray-400">Check-out</dt>
                    <dd className="text-gray-900 font-medium">{tf.checkout_time}</dd>
                  </div>
                )}
                {tf.minimum_stay && (
                  <div className="flex justify-between sm:block">
                    <dt className="text-gray-400">Minimum stay</dt>
                    <dd className="text-gray-900 font-medium">{tf.minimum_stay}</dd>
                  </div>
                )}
                {tf.pet_policy && (
                  <div className="flex justify-between sm:block">
                    <dt className="text-gray-400">Pets</dt>
                    <dd className="text-gray-900 font-medium">{tf.pet_policy}</dd>
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
