import { Fiche, Highlight } from '@/types'
import { AirtableOrg } from '@/types'
import { WellnessFields } from '@/lib/ficheTemplates'
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

export default function WellnessFiche({
  fiche,
  org,
  name,
  location,
  highlights,
  galleryUrls,
  tags,
}: Props) {
  const tf = (fiche.template_fields || {}) as WellnessFields

  const autoHighlights: Highlight[] = []
  if (tf.wellness_focus) autoHighlights.push({ icon: '\u2726', label: 'Focus', value: tf.wellness_focus })
  if (tf.treatment_philosophy) autoHighlights.push({ icon: '\u{1F33F}', label: 'Philosophy', value: tf.treatment_philosophy })
  if (tf.minimum_stay) autoHighlights.push({ icon: '\u{1F6CF}', label: 'Min. stay', value: tf.minimum_stay })
  if (tf.suitable_for) autoHighlights.push({ icon: '\u{1F464}', label: 'Suitable for', value: tf.suitable_for })

  const displayHighlights = highlights.length > 0 ? highlights : autoHighlights

  const hasDetails = tf.signature_treatment || tf.facilities || tf.practitioners ||
    tf.programmes_available || tf.medical_consultations || (fiche.show_price && fiche.price_display)

  const mailtoSubject = encodeURIComponent(`Wellness Enquiry: ${name}`)

  return (
    <>
      <FicheHero
        name={name}
        headline={fiche.headline}
        category={org?.category || ''}
        categorySub="Wellness"
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
              <h3 className="font-heading text-lg font-semibold text-green mb-4">Your Visit</h3>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 text-sm font-body">
                {tf.signature_treatment && (
                  <div className="flex justify-between sm:block">
                    <dt className="text-gray-400">Signature treatment</dt>
                    <dd className="text-gray-900 font-medium">{tf.signature_treatment}</dd>
                  </div>
                )}
                {tf.facilities && (
                  <div className="flex justify-between sm:block">
                    <dt className="text-gray-400">Facilities</dt>
                    <dd className="text-gray-900 font-medium">{tf.facilities}</dd>
                  </div>
                )}
                {tf.practitioners && (
                  <div className="flex justify-between sm:block">
                    <dt className="text-gray-400">Practitioners</dt>
                    <dd className="text-gray-900 font-medium">{tf.practitioners}</dd>
                  </div>
                )}
                {tf.programmes_available && (
                  <div className="flex justify-between sm:block">
                    <dt className="text-gray-400">Programmes</dt>
                    <dd className="text-gray-900 font-medium">{tf.programmes_available}</dd>
                  </div>
                )}
                {tf.medical_consultations && (
                  <div className="flex justify-between sm:block">
                    <dt className="text-gray-400">Medical</dt>
                    <dd className="text-gray-900 font-medium">Consultations available</dd>
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
