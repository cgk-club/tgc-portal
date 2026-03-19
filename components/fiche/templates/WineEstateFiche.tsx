import { Fiche, Highlight } from '@/types'
import { AirtableOrg } from '@/types'
import { WineEstateFields } from '@/lib/ficheTemplates'
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

export default function WineEstateFiche({
  fiche,
  org,
  name,
  location,
  highlights,
  galleryUrls,
  tags,
}: Props) {
  const tf = (fiche.template_fields || {}) as WineEstateFields

  const autoHighlights: Highlight[] = []
  if (tf.appellation) autoHighlights.push({ icon: '\u{1F347}', label: 'Appellation', value: tf.appellation })
  if (tf.certifications) autoHighlights.push({ icon: '\u{1F33F}', label: 'Certification', value: tf.certifications })
  if (tf.established) autoHighlights.push({ icon: '\u{1F4C5}', label: 'Established', value: String(tf.established) })
  autoHighlights.push({ icon: '\u{1F3E0}', label: 'Accommodation', value: tf.accommodation ? 'Yes' : 'No' })

  const displayHighlights = highlights.length > 0 ? highlights : autoHighlights

  const hasWineDetails = tf.appellation || tf.hectares || tf.grape_varieties ||
    tf.annual_production || tf.winemaker

  const hasVisitDetails = tf.cellar_visits || tf.tasting_format ||
    tf.restaurant_bistro !== undefined || tf.accommodation !== undefined ||
    tf.shipping || (fiche.show_price && fiche.price_display)

  const mailtoSubject = encodeURIComponent(`Visit Enquiry: ${name}`)

  return (
    <>
      <FicheHero
        name={name}
        headline={fiche.headline}
        category={org?.category || ''}
        categorySub="Wine Estate"
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

      {(hasWineDetails || hasVisitDetails) && (
        <div className="py-8 px-8 md:px-12 lg:px-16">
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
            {hasWineDetails && (
              <div className="bg-white rounded-[8px] border border-gray-200 p-6">
                <h3 className="font-heading text-lg font-semibold text-green mb-4">The Wines</h3>
                <dl className="space-y-3 text-sm font-body">
                  {tf.appellation && (
                    <div className="flex justify-between">
                      <dt className="text-gray-400">Appellation</dt>
                      <dd className="text-gray-900 font-medium text-right">{tf.appellation}</dd>
                    </div>
                  )}
                  {tf.hectares && (
                    <div className="flex justify-between">
                      <dt className="text-gray-400">Hectares</dt>
                      <dd className="text-gray-900 font-medium">{tf.hectares}ha</dd>
                    </div>
                  )}
                  {tf.grape_varieties && (
                    <div className="flex justify-between">
                      <dt className="text-gray-400">Varieties</dt>
                      <dd className="text-gray-900 font-medium text-right">{tf.grape_varieties}</dd>
                    </div>
                  )}
                  {tf.annual_production && (
                    <div className="flex justify-between">
                      <dt className="text-gray-400">Production</dt>
                      <dd className="text-gray-900 font-medium">{tf.annual_production}</dd>
                    </div>
                  )}
                  {tf.winemaker && (
                    <div className="flex justify-between">
                      <dt className="text-gray-400">Winemaker</dt>
                      <dd className="text-gray-900 font-medium">{tf.winemaker}</dd>
                    </div>
                  )}
                </dl>
              </div>
            )}

            {hasVisitDetails && (
              <div className="bg-white rounded-[8px] border border-gray-200 p-6">
                <h3 className="font-heading text-lg font-semibold text-green mb-4">Visiting</h3>
                <dl className="space-y-3 text-sm font-body">
                  {tf.cellar_visits && (
                    <div className="flex justify-between">
                      <dt className="text-gray-400">Cellar visits</dt>
                      <dd className="text-gray-900 font-medium text-right">{tf.cellar_visits}</dd>
                    </div>
                  )}
                  {tf.tasting_format && (
                    <div className="flex justify-between">
                      <dt className="text-gray-400">Tasting</dt>
                      <dd className="text-gray-900 font-medium text-right">{tf.tasting_format}</dd>
                    </div>
                  )}
                  {tf.restaurant_bistro !== undefined && (
                    <div className="flex justify-between">
                      <dt className="text-gray-400">Restaurant</dt>
                      <dd className="text-gray-900 font-medium">{tf.restaurant_bistro ? 'Yes' : 'No'}</dd>
                    </div>
                  )}
                  {tf.accommodation && tf.accommodation_details && (
                    <div className="flex justify-between">
                      <dt className="text-gray-400">Accommodation</dt>
                      <dd className="text-gray-900 font-medium text-right">{tf.accommodation_details}</dd>
                    </div>
                  )}
                  {tf.shipping && (
                    <div className="flex justify-between">
                      <dt className="text-gray-400">Shipping</dt>
                      <dd className="text-gray-900 font-medium text-right">{tf.shipping}</dd>
                    </div>
                  )}
                  {fiche.show_price && fiche.price_display && (
                    <div className="flex justify-between">
                      <dt className="text-gray-400">Rate</dt>
                      <dd className="text-gray-900 font-medium">{fiche.price_display}</dd>
                    </div>
                  )}
                </dl>
              </div>
            )}
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
            Get in touch and we will arrange your visit.
          </p>
          <a
            href={`mailto:hello@thegatekeepers.club?subject=${mailtoSubject}`}
            className="inline-flex items-center justify-center rounded-[4px] bg-green text-white px-8 py-3 font-body font-medium hover:bg-green-light transition-colors w-full sm:w-auto"
          >
            Plan your visit
          </a>
        </div>
      </div>
    </>
  )
}
