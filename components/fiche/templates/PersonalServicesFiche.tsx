import { Fiche, Highlight } from '@/types'
import { AirtableOrg } from '@/types'
import { PersonalServicesFields } from '@/lib/ficheTemplates'
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

export default function PersonalServicesFiche({
  fiche,
  org,
  name,
  location,
  highlights,
  galleryUrls,
  tags,
}: Props) {
  const tf = (fiche.template_fields || {}) as PersonalServicesFields

  const autoHighlights: Highlight[] = []
  if (tf.service_type) autoHighlights.push({ icon: '\u2726', label: 'Service', value: tf.service_type })
  if (tf.languages) autoHighlights.push({ icon: '\u{1F310}', label: 'Languages', value: tf.languages })
  if (tf.availability) autoHighlights.push({ icon: '\u{1F4C5}', label: 'Availability', value: tf.availability })
  if (tf.group_size) autoHighlights.push({ icon: '\u{1F464}', label: 'Group size', value: tf.group_size })

  const displayHighlights = highlights.length > 0 ? highlights : autoHighlights

  const hasDetails = tf.specialisation || tf.base_city || tf.travel_radius ||
    tf.experience_years || tf.certifications || tf.rate_structure ||
    tf.booking_lead_time || tf.equipment_provided ||
    (fiche.show_price && fiche.price_display)

  return (
    <>
      <FicheHero
        name={name}
        headline={fiche.headline}
        category={org?.category || ''}
        categorySub="Personal Services"
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

      {hasDetails && (
        <div className="py-8 px-8 md:px-12 lg:px-16">
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-[8px] border border-gray-200 p-6">
              <h3 className="font-heading text-lg font-semibold text-green mb-4">Service Details</h3>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 text-sm font-body">
                {tf.specialisation && (
                  <div className="flex justify-between sm:block">
                    <dt className="text-gray-400">Specialisation</dt>
                    <dd className="text-gray-900 font-medium">{tf.specialisation}</dd>
                  </div>
                )}
                {tf.base_city && (
                  <div className="flex justify-between sm:block">
                    <dt className="text-gray-400">Based in</dt>
                    <dd className="text-gray-900 font-medium">{tf.base_city}</dd>
                  </div>
                )}
                {tf.travel_radius && (
                  <div className="flex justify-between sm:block">
                    <dt className="text-gray-400">Travel radius</dt>
                    <dd className="text-gray-900 font-medium">{tf.travel_radius}</dd>
                  </div>
                )}
                {tf.experience_years && (
                  <div className="flex justify-between sm:block">
                    <dt className="text-gray-400">Experience</dt>
                    <dd className="text-gray-900 font-medium">{tf.experience_years} years</dd>
                  </div>
                )}
                {tf.certifications && (
                  <div className="flex justify-between sm:block">
                    <dt className="text-gray-400">Certifications</dt>
                    <dd className="text-gray-900 font-medium">{tf.certifications}</dd>
                  </div>
                )}
                {tf.rate_structure && (
                  <div className="flex justify-between sm:block">
                    <dt className="text-gray-400">Rates</dt>
                    <dd className="text-gray-900 font-medium">{tf.rate_structure}</dd>
                  </div>
                )}
                {tf.booking_lead_time && (
                  <div className="flex justify-between sm:block">
                    <dt className="text-gray-400">Booking lead time</dt>
                    <dd className="text-gray-900 font-medium">{tf.booking_lead_time}</dd>
                  </div>
                )}
                {tf.equipment_provided && (
                  <div className="flex justify-between sm:block">
                    <dt className="text-gray-400">Equipment</dt>
                    <dd className="text-gray-900 font-medium">{tf.equipment_provided}</dd>
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
