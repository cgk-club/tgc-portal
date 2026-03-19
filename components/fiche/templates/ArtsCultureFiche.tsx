import { Fiche, Highlight } from '@/types'
import { AirtableOrg } from '@/types'
import { ArtsCultureFields } from '@/lib/ficheTemplates'
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

export default function ArtsCultureFiche({
  fiche,
  org,
  name,
  location,
  highlights,
  galleryUrls,
  tags,
}: Props) {
  const tf = (fiche.template_fields || {}) as ArtsCultureFields

  const autoHighlights: Highlight[] = []
  if (tf.specialisation) autoHighlights.push({ icon: '\u{1F3A8}', label: 'Specialisation', value: tf.specialisation })
  if (tf.founded) autoHighlights.push({ icon: '\u{1F4C5}', label: 'Established', value: String(tf.founded) })
  if (tf.permanent_collection !== undefined) autoHighlights.push({ icon: '\u{1F5BC}', label: 'Permanent collection', value: tf.permanent_collection ? 'Yes' : 'No' })
  if (tf.private_views) autoHighlights.push({ icon: '\u{1F514}', label: 'Private views', value: 'Available' })

  const displayHighlights = highlights.length > 0 ? highlights : autoHighlights

  const displayCategorySub = tf.institution_type || org?.categorySub || ''

  const hasDetails = tf.institution_type || tf.specialisation || tf.current_programme ||
    tf.private_views || tf.art_advisory || tf.visiting_hours || tf.admission ||
    (fiche.show_price && fiche.price_display)

  const mailtoSubject = encodeURIComponent(`Gallery/Culture Enquiry: ${name}`)

  return (
    <>
      <FicheHero
        name={name}
        headline={fiche.headline}
        category={org?.category || ''}
        categorySub={displayCategorySub}
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
              <h3 className="font-heading text-lg font-semibold text-green mb-4">At a Glance</h3>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 text-sm font-body">
                {tf.institution_type && (
                  <div className="flex justify-between sm:block">
                    <dt className="text-gray-400">Type</dt>
                    <dd className="text-gray-900 font-medium">{tf.institution_type}</dd>
                  </div>
                )}
                {tf.specialisation && (
                  <div className="flex justify-between sm:block">
                    <dt className="text-gray-400">Specialisation</dt>
                    <dd className="text-gray-900 font-medium">{tf.specialisation}</dd>
                  </div>
                )}
                {tf.current_programme && (
                  <div className="flex justify-between sm:block">
                    <dt className="text-gray-400">Programme</dt>
                    <dd className="text-gray-900 font-medium">{tf.current_programme}</dd>
                  </div>
                )}
                {tf.private_views && (
                  <div className="flex justify-between sm:block">
                    <dt className="text-gray-400">Private views</dt>
                    <dd className="text-gray-900 font-medium">Invitation available via TGC</dd>
                  </div>
                )}
                {tf.art_advisory && (
                  <div className="flex justify-between sm:block">
                    <dt className="text-gray-400">Art advisory</dt>
                    <dd className="text-gray-900 font-medium">Yes</dd>
                  </div>
                )}
                {tf.visiting_hours && (
                  <div className="flex justify-between sm:block">
                    <dt className="text-gray-400">Hours</dt>
                    <dd className="text-gray-900 font-medium">{tf.visiting_hours}</dd>
                  </div>
                )}
                {tf.admission && (
                  <div className="flex justify-between sm:block">
                    <dt className="text-gray-400">Admission</dt>
                    <dd className="text-gray-900 font-medium">{tf.admission}</dd>
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

      <div className="py-12 px-8 md:px-12 lg:px-16 bg-green-muted">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="font-heading text-2xl font-semibold text-green mb-3">
            Interested in {name}?
          </h2>
          <p className="text-gray-600 font-body mb-6">
            Get in touch and we will arrange a private visit.
          </p>
          <a
            href={`mailto:hello@thegatekeepers.club?subject=${mailtoSubject}`}
            className="inline-flex items-center justify-center rounded-[4px] bg-green text-white px-8 py-3 font-body font-medium hover:bg-green-light transition-colors w-full sm:w-auto"
          >
            Arrange a private visit
          </a>
        </div>
      </div>
    </>
  )
}
