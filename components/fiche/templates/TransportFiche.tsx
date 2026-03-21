import { Fiche, Highlight } from '@/types'
import { AirtableOrg } from '@/types'
import { TransportFields, isAirSeaTransport } from '@/lib/ficheTemplates'
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

export default function TransportFiche({
  fiche,
  org,
  name,
  location,
  highlights,
  galleryUrls,
  tags,
}: Props) {
  const tf = (fiche.template_fields || {}) as TransportFields
  const airSea = isAirSeaTransport(org?.categorySub)

  const autoHighlights: Highlight[] = []
  if (tf.capacity_passengers) autoHighlights.push({ icon: '\u{1F464}', label: 'Capacity', value: `${tf.capacity_passengers} pax` })
  if (tf.base_location) autoHighlights.push({ icon: '\u{1F4CD}', label: 'Base', value: tf.base_location })
  if (tf.operating_area) autoHighlights.push({ icon: '\u{1F30D}', label: 'Operating area', value: tf.operating_area })
  if (tf.lead_time) autoHighlights.push({ icon: '\u23F1', label: 'Lead time', value: tf.lead_time })

  const displayHighlights = highlights.length > 0 ? highlights : autoHighlights

  const mailtoSubject = encodeURIComponent(`Availability Request: ${name}`)

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
            <h3 className="font-heading text-lg font-semibold text-green mb-4">Specifications</h3>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 text-sm font-body">
              {tf.vehicle_type && (
                <div className="flex justify-between sm:block">
                  <dt className="text-gray-400">{airSea ? 'Vessel / Aircraft' : 'Vehicle'}</dt>
                  <dd className="text-gray-900 font-medium">{tf.vehicle_type}</dd>
                </div>
              )}
              {tf.fleet_size && (
                <div className="flex justify-between sm:block">
                  <dt className="text-gray-400">Fleet</dt>
                  <dd className="text-gray-900 font-medium">{tf.fleet_size}</dd>
                </div>
              )}
              {tf.capacity_passengers && (
                <div className="flex justify-between sm:block">
                  <dt className="text-gray-400">Capacity</dt>
                  <dd className="text-gray-900 font-medium">{tf.capacity_passengers} passengers</dd>
                </div>
              )}
              {airSea && tf.capacity_crew && (
                <div className="flex justify-between sm:block">
                  <dt className="text-gray-400">Crew</dt>
                  <dd className="text-gray-900 font-medium">{tf.capacity_crew}</dd>
                </div>
              )}
              {tf.range_coverage && (
                <div className="flex justify-between sm:block">
                  <dt className="text-gray-400">{airSea ? 'Range' : 'Coverage'}</dt>
                  <dd className="text-gray-900 font-medium">{tf.range_coverage}</dd>
                </div>
              )}
              {tf.certifications && (
                <div className="flex justify-between sm:block">
                  <dt className="text-gray-400">Certifications</dt>
                  <dd className="text-gray-900 font-medium">{tf.certifications}</dd>
                </div>
              )}
              {airSea && tf.catering && (
                <div className="flex justify-between sm:block">
                  <dt className="text-gray-400">Catering</dt>
                  <dd className="text-gray-900 font-medium">{tf.catering}</dd>
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

      <FicheGallery images={galleryUrls} name={name} />

      <FicheTags tags={tags} />

      <FicheContact name={name} />
    </>
  )
}
