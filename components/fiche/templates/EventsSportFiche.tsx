import { Fiche, Highlight } from '@/types'
import { AirtableOrg } from '@/types'
import { EventsSportFields, isVenueEvent } from '@/lib/ficheTemplates'
import FicheHero from '@/components/fiche/FicheHero'
import FicheGallery from '@/components/fiche/FicheGallery'
import FicheTags from '@/components/fiche/FicheTags'

interface Props {
  fiche: Fiche
  org: AirtableOrg | null
  name: string
  location: string
  highlights: Highlight[]
  galleryUrls: string[]
  tags: string[]
}

export default function EventsSportFiche({
  fiche,
  org,
  name,
  location,
  highlights,
  galleryUrls,
  tags,
}: Props) {
  const tf = (fiche.template_fields || {}) as EventsSportFields
  const isVenue = isVenueEvent(org?.categorySub)

  const autoHighlights: Highlight[] = []
  if (isVenue) {
    if (tf.capacity_seated) autoHighlights.push({ icon: '\u{1F465}', label: 'Seated', value: String(tf.capacity_seated) })
    if (tf.indoor_outdoor) autoHighlights.push({ icon: '\u{1F3DB}', label: 'Setting', value: tf.indoor_outdoor })
    if (tf.av_equipment) autoHighlights.push({ icon: '\u{1F3A4}', label: 'AV', value: tf.av_equipment })
    if (tf.exclusive_hire) autoHighlights.push({ icon: '\u{1F512}', label: 'Exclusive hire', value: tf.exclusive_hire })
  } else {
    if (tf.season) autoHighlights.push({ icon: '\u{1F4C5}', label: 'Season', value: tf.season })
    if (tf.skill_level) autoHighlights.push({ icon: '\u{1F3AF}', label: 'Level', value: tf.skill_level })
    if (tf.instruction_available) autoHighlights.push({ icon: '\u{1F393}', label: 'Instruction', value: 'Available' })
    if (tf.membership_required !== undefined) autoHighlights.push({ icon: '\u{1F3C7}', label: 'Membership', value: tf.membership_required ? 'Required' : 'Not required' })
  }

  const displayHighlights = highlights.length > 0 ? highlights : autoHighlights

  const mailtoSubject = encodeURIComponent(
    isVenue ? `Event Enquiry: ${name}` : `Sport/Activity Enquiry: ${name}`
  )

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

      <div className="py-8 px-8 md:px-12 lg:px-16">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-[8px] border border-gray-200 p-6">
            <h3 className="font-heading text-lg font-semibold text-green mb-4">
              {isVenue ? 'Venue Details' : 'Playing Details'}
            </h3>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 text-sm font-body">
              {isVenue ? (
                <>
                  {tf.exclusive_hire && (
                    <div className="flex justify-between sm:block">
                      <dt className="text-gray-400">Exclusive hire</dt>
                      <dd className="text-gray-900 font-medium">{tf.exclusive_hire}</dd>
                    </div>
                  )}
                  {tf.catering_inhouse !== undefined && (
                    <div className="flex justify-between sm:block">
                      <dt className="text-gray-400">Catering</dt>
                      <dd className="text-gray-900 font-medium">{tf.catering_inhouse ? 'In-house' : 'External'}</dd>
                    </div>
                  )}
                  {tf.av_equipment && (
                    <div className="flex justify-between sm:block">
                      <dt className="text-gray-400">AV</dt>
                      <dd className="text-gray-900 font-medium">{tf.av_equipment === 'Yes' ? 'Full production available' : tf.av_equipment}</dd>
                    </div>
                  )}
                  {tf.accommodation_onsite !== undefined && (
                    <div className="flex justify-between sm:block">
                      <dt className="text-gray-400">Accommodation</dt>
                      <dd className="text-gray-900 font-medium">{tf.accommodation_onsite ? 'On site' : 'Not on site'}</dd>
                    </div>
                  )}
                  {tf.accessibility && (
                    <div className="flex justify-between sm:block">
                      <dt className="text-gray-400">Accessibility</dt>
                      <dd className="text-gray-900 font-medium">{tf.accessibility}</dd>
                    </div>
                  )}
                </>
              ) : (
                <>
                  {tf.season && (
                    <div className="flex justify-between sm:block">
                      <dt className="text-gray-400">Season</dt>
                      <dd className="text-gray-900 font-medium">{tf.season}</dd>
                    </div>
                  )}
                  {tf.skill_level && (
                    <div className="flex justify-between sm:block">
                      <dt className="text-gray-400">Level</dt>
                      <dd className="text-gray-900 font-medium">{tf.skill_level}</dd>
                    </div>
                  )}
                  {tf.instruction_available !== undefined && (
                    <div className="flex justify-between sm:block">
                      <dt className="text-gray-400">Instruction</dt>
                      <dd className="text-gray-900 font-medium">{tf.instruction_available ? 'Available' : 'Not available'}</dd>
                    </div>
                  )}
                  {tf.equipment_hire !== undefined && (
                    <div className="flex justify-between sm:block">
                      <dt className="text-gray-400">Equipment hire</dt>
                      <dd className="text-gray-900 font-medium">{tf.equipment_hire ? 'Available' : 'Not available'}</dd>
                    </div>
                  )}
                  {tf.guest_policy && (
                    <div className="flex justify-between sm:block">
                      <dt className="text-gray-400">Guest policy</dt>
                      <dd className="text-gray-900 font-medium">{tf.guest_policy}</dd>
                    </div>
                  )}
                </>
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

      <FicheGallery images={galleryUrls} name={name} />

      <FicheTags tags={tags} />

      <div className="py-12 px-8 md:px-12 lg:px-16 bg-green-muted">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="font-heading text-2xl font-semibold text-green mb-3">
            Interested in {name}?
          </h2>
          <p className="text-gray-600 font-body mb-6">
            Get in touch and we will tailor this to your plans.
          </p>
          <a
            href={`mailto:hello@thegatekeepers.club?subject=${mailtoSubject}`}
            className="inline-flex items-center justify-center rounded-[4px] bg-green text-white px-8 py-3 font-body font-medium hover:bg-green-light transition-colors w-full sm:w-auto"
          >
            {isVenue ? 'Check availability' : 'Enquire about access'}
          </a>
        </div>
      </div>
    </>
  )
}
