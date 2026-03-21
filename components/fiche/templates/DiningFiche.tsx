import { Fiche, Highlight } from '@/types'
import { AirtableOrg } from '@/types'
import { DiningFields } from '@/lib/ficheTemplates'
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

const DRESS_LABELS: Record<string, string> = {
  'casual': 'Casual',
  'smart-casual': 'Smart casual',
  'smart': 'Smart',
  'black-tie': 'Black tie',
}

export default function DiningFiche({
  fiche,
  org,
  name,
  location,
  highlights,
  galleryUrls,
  tags,
}: Props) {
  const tf = (fiche.template_fields || {}) as DiningFields

  const autoHighlights: Highlight[] = []
  if (tf.cuisine) autoHighlights.push({ icon: '\u{1F374}', label: 'Cuisine', value: tf.cuisine })
  if (tf.chef_name) autoHighlights.push({ icon: '\u{1F468}\u200D\u{1F373}', label: 'Chef', value: tf.chef_name })
  if (tf.recognition) autoHighlights.push({ icon: '\u2B50', label: 'Recognition', value: tf.recognition })
  if (tf.covers) autoHighlights.push({ icon: '\u{1F465}', label: 'Covers', value: String(tf.covers) })

  const displayHighlights = highlights.length > 0 ? highlights : autoHighlights

  const hasReservation = tf.signature_dish || tf.dress_code || tf.reservation_lead || tf.private_dining !== undefined || (fiche.show_price && fiche.price_display)

  const mailtoSubject = encodeURIComponent(`Reservation Request: ${name}`)

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

      {fiche.description && (
        <div className="py-10 px-8 md:px-12 lg:px-16">
          <div className="max-w-3xl mx-auto">
            <div className="prose prose-lg font-body text-gray-700 leading-relaxed whitespace-pre-line max-w-[65ch]">
              {fiche.description}
            </div>
          </div>
        </div>
      )}

      {hasReservation && (
        <div className="py-8 px-8 md:px-12 lg:px-16">
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-[8px] border border-gray-200 p-6">
              <h3 className="font-heading text-lg font-semibold text-green mb-4">Reservation</h3>
              <dl className="space-y-3 text-sm font-body">
                {tf.signature_dish && (
                  <div className="flex justify-between">
                    <dt className="text-gray-400">Signature</dt>
                    <dd className="text-gray-900 font-medium text-right">{tf.signature_dish}</dd>
                  </div>
                )}
                {tf.dress_code && (
                  <div className="flex justify-between">
                    <dt className="text-gray-400">Dress code</dt>
                    <dd className="text-gray-900 font-medium">{DRESS_LABELS[tf.dress_code] || tf.dress_code}</dd>
                  </div>
                )}
                {tf.reservation_lead && (
                  <div className="flex justify-between">
                    <dt className="text-gray-400">Book ahead</dt>
                    <dd className="text-gray-900 font-medium">{tf.reservation_lead}</dd>
                  </div>
                )}
                {tf.private_dining !== undefined && (
                  <div className="flex justify-between">
                    <dt className="text-gray-400">Private dining</dt>
                    <dd className="text-gray-900 font-medium">
                      {tf.private_dining ? (tf.private_dining_details || 'Available') : 'Not available'}
                    </dd>
                  </div>
                )}
                {fiche.show_price && fiche.price_display && (
                  <div className="flex justify-between">
                    <dt className="text-gray-400">Per person</dt>
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
