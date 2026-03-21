import { Fiche, Highlight } from '@/types'
import { AirtableOrg } from '@/types'
import { ExperienceFields } from '@/lib/ficheTemplates'
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

export default function ExperienceFiche({
  fiche,
  org,
  name,
  location,
  highlights,
  galleryUrls,
  tags,
}: Props) {
  const tf = (fiche.template_fields || {}) as ExperienceFields

  const autoHighlights: Highlight[] = []
  if (tf.duration) autoHighlights.push({ icon: '\u23F1', label: 'Duration', value: tf.duration })
  if (tf.group_size) autoHighlights.push({ icon: '\u{1F465}', label: 'Group size', value: tf.group_size })
  if (tf.languages) autoHighlights.push({ icon: '\u{1F5E3}', label: 'Languages', value: tf.languages })
  if (tf.seasonal) autoHighlights.push({ icon: '\u{1F4C5}', label: 'Season', value: tf.seasonal })

  const displayHighlights = highlights.length > 0 ? highlights : autoHighlights

  const hasDetails = tf.physical_level || tf.minimum_age || tf.booking_lead_time ||
    tf.whats_included || tf.whats_not_included || (fiche.show_price && fiche.price_display)

  const mailtoSubject = encodeURIComponent(`Experience Enquiry: ${name}`)

  return (
    <>
      <FicheHero
        name={name}
        headline={fiche.headline}
        category={org?.category || ''}
        categorySub={tf.experience_type || org?.categorySub || ''}
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
              <h3 className="font-heading text-lg font-semibold text-green mb-4">Experience Details</h3>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 text-sm font-body">
                {tf.physical_level && (
                  <div className="flex justify-between sm:block">
                    <dt className="text-gray-400">Physical level</dt>
                    <dd className="text-gray-900 font-medium">{tf.physical_level}</dd>
                  </div>
                )}
                {tf.minimum_age && (
                  <div className="flex justify-between sm:block">
                    <dt className="text-gray-400">Minimum age</dt>
                    <dd className="text-gray-900 font-medium">{tf.minimum_age}</dd>
                  </div>
                )}
                {tf.booking_lead_time && (
                  <div className="flex justify-between sm:block">
                    <dt className="text-gray-400">Booking</dt>
                    <dd className="text-gray-900 font-medium">{tf.booking_lead_time}</dd>
                  </div>
                )}
                {tf.whats_included && (
                  <div className="flex justify-between sm:block">
                    <dt className="text-gray-400">Included</dt>
                    <dd className="text-gray-900 font-medium">{tf.whats_included}</dd>
                  </div>
                )}
                {tf.whats_not_included && (
                  <div className="flex justify-between sm:block">
                    <dt className="text-gray-400">Not included</dt>
                    <dd className="text-gray-900 font-medium">{tf.whats_not_included}</dd>
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
