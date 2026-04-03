import { Fiche, Highlight } from '@/types'
import { AirtableOrg } from '@/types'
import { WineEstateFields } from '@/lib/ficheTemplates'
import FicheHero from '@/components/fiche/FicheHero'
import FicheStatsRibbon from '@/components/fiche/FicheStatsRibbon'
import FicheStatement from '@/components/fiche/FicheStatement'
import FicheSplitSection from '@/components/fiche/FicheSplitSection'
import FicheHighlightsEditorial from '@/components/fiche/FicheHighlightsEditorial'
import FicheGallery from '@/components/fiche/FicheGallery'
import FicheAmenityIcons from '@/components/fiche/FicheAmenityIcons'
import FicheTags from '@/components/fiche/FicheTags'
import FicheContact from '@/components/fiche/FicheContact'
import ScrollReveal from '@/components/fiche/ScrollReveal'

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

  // ── Stats ribbon ──────────────────────────────────────────────
  const stats: { label: string; value: string }[] = []
  if (tf.appellation) stats.push({ label: 'Appellation', value: tf.appellation })
  if (tf.hectares) stats.push({ label: 'Hectares', value: `${tf.hectares}ha` })
  if (tf.established) stats.push({ label: 'Established', value: String(tf.established) })
  if (tf.accommodation) stats.push({ label: 'Accommodation', value: tf.room_count ? `${tf.room_count} rooms` : 'Yes' })
  if (fiche.show_price && fiche.price_display) stats.push({ label: 'From', value: fiche.price_display })

  // ── Description splitting ─────────────────────────────────────
  const paragraphs = (fiche.description || '').split('\n\n').filter(Boolean)
  const splitParagraph1 = paragraphs[0] || ''
  const splitParagraph2 = paragraphs[1] || ''

  // ── Image allocation ──────────────────────────────────────────
  const statementImage = galleryUrls[0] || null
  const splitImage1 = galleryUrls[1] || null
  const splitImage2 = galleryUrls[2] || null
  const highlightImages = galleryUrls.slice(3, 9)
  const galleryImages = galleryUrls.slice(Math.min(9, galleryUrls.length))

  // ── Highlights for editorial cards ────────────────────────────
  const autoHighlights: Highlight[] = []
  if (tf.appellation) autoHighlights.push({ icon: '', label: 'Appellation', value: tf.appellation })
  if (tf.grape_varieties) autoHighlights.push({ icon: '', label: 'Varieties', value: tf.grape_varieties })
  if (tf.winemaker) autoHighlights.push({ icon: '', label: 'Winemaker', value: tf.winemaker })
  if (tf.certifications) autoHighlights.push({ icon: '', label: 'Certification', value: tf.certifications })
  if (tf.cellar_visits) autoHighlights.push({ icon: '', label: 'Cellar Visits', value: tf.cellar_visits })
  if (tf.tasting_format) autoHighlights.push({ icon: '', label: 'Tasting', value: tf.tasting_format })

  const displayHighlights = highlights.length > 0 ? highlights : autoHighlights

  const highlightCards = displayHighlights
    .slice(0, 6)
    .map((h, i) => ({
      imageUrl: highlightImages[i] || galleryUrls[i % Math.max(galleryUrls.length, 1)] || '',
      heading: h.label,
      description: h.value,
    }))
    .filter(card => card.imageUrl)

  // ── Amenities (luxury icon grid) ────────────────────────────
  const amenities: { label: string; value: string }[] = []
  if (tf.appellation) amenities.push({ label: 'Appellation', value: tf.appellation })
  if (tf.hectares) amenities.push({ label: 'Vineyard', value: `${tf.hectares}ha` })
  if (tf.grape_varieties) amenities.push({ label: 'Varieties', value: tf.grape_varieties })
  if (tf.cellar_visits) amenities.push({ label: 'Cellar Visits', value: tf.cellar_visits })
  if (tf.tasting_format) amenities.push({ label: 'Tasting', value: tf.tasting_format })
  if (tf.restaurant_bistro) amenities.push({ label: 'Restaurant', value: 'On-site' })
  if (tf.accommodation) amenities.push({ label: 'Accommodation', value: tf.accommodation_details || 'Available' })
  if (tf.shipping) amenities.push({ label: 'Shipping', value: tf.shipping })
  for (const h of highlights) {
    const lbl = h.label.toLowerCase()
    if (!amenities.some(a => a.label.toLowerCase() === lbl)) {
      amenities.push({ label: h.label, value: h.value })
    }
  }

  // ── Wine & visiting details ───────────────────────────────────
  const hasDetails = tf.annual_production || tf.winemaker || tf.certifications ||
    (tf.accommodation && (tf.checkin_time || tf.checkout_time)) ||
    tf.shipping || (fiche.show_price && fiche.price_display)

  return (
    <>
      {/* 1. Cinematic Hero */}
      <FicheHero
        name={name}
        category={org?.category || ''}
        categorySub="Wine Estate"
        location={location}
        heroImageUrl={fiche.hero_image_url}
        variant="cinematic"
      />

      {/* 2. Stats Ribbon + Details */}
      {stats.length > 0 && <FicheStatsRibbon stats={stats} />}

      {hasDetails && (
        <div className="py-6 px-8 md:px-12 lg:px-16">
          <div className="max-w-3xl mx-auto">
            <dl className="grid grid-cols-2 sm:grid-cols-4 gap-x-8 gap-y-3 text-sm font-body text-center">
              {tf.annual_production && (
                <div>
                  <dt className="text-[11px] text-gray-400 uppercase tracking-widest mb-1">Production</dt>
                  <dd className="text-gray-800 font-medium">{tf.annual_production}</dd>
                </div>
              )}
              {tf.winemaker && (
                <div>
                  <dt className="text-[11px] text-gray-400 uppercase tracking-widest mb-1">Winemaker</dt>
                  <dd className="text-gray-800 font-medium">{tf.winemaker}</dd>
                </div>
              )}
              {tf.certifications && (
                <div>
                  <dt className="text-[11px] text-gray-400 uppercase tracking-widest mb-1">Certification</dt>
                  <dd className="text-gray-800 font-medium">{tf.certifications}</dd>
                </div>
              )}
              {tf.accommodation && (tf.checkin_time || tf.checkout_time) && (
                <div>
                  <dt className="text-[11px] text-gray-400 uppercase tracking-widest mb-1">Check-in / out</dt>
                  <dd className="text-gray-800 font-medium">
                    {[tf.checkin_time, tf.checkout_time].filter(Boolean).join(' / ')}
                  </dd>
                </div>
              )}
              {tf.shipping && (
                <div>
                  <dt className="text-[11px] text-gray-400 uppercase tracking-widest mb-1">Shipping</dt>
                  <dd className="text-gray-800 font-medium">{tf.shipping}</dd>
                </div>
              )}
              {fiche.show_price && fiche.price_display && (
                <div>
                  <dt className="text-[11px] text-gray-400 uppercase tracking-widest mb-1">Rate</dt>
                  <dd className="text-gray-800 font-medium">{fiche.price_display}</dd>
                </div>
              )}
            </dl>
          </div>
        </div>
      )}

      {/* 3. Pull Quote / Tagline Statement */}
      {fiche.headline && (
        <ScrollReveal>
          <FicheStatement
            statement={fiche.headline}
            backgroundImageUrl={statementImage}
            variant={statementImage ? 'image' : 'dark'}
          />
        </ScrollReveal>
      )}

      {/* 4. Amenities & Services */}
      {amenities.length > 0 && (
        <ScrollReveal>
          <FicheAmenityIcons amenities={amenities} title="The Estate" />
        </ScrollReveal>
      )}

      {/* 5. Split Section — paragraph 1 */}
      {splitParagraph1 && splitImage1 ? (
        <ScrollReveal>
          <FicheSplitSection
            imageUrl={splitImage1}
            imageAlt={`${name} — The Terroir`}
            label="The Terroir"
            content={splitParagraph1}
            imagePosition="right"
          />
        </ScrollReveal>
      ) : splitParagraph1 && !splitImage1 ? (
        <ScrollReveal>
          <div className="py-10 px-8 md:px-12 lg:px-16">
            <div className="max-w-3xl mx-auto">
              <div className="prose prose-lg font-body text-gray-700 leading-relaxed whitespace-pre-line max-w-[65ch]">
                {fiche.description}
              </div>
            </div>
          </div>
        </ScrollReveal>
      ) : null}

      {/* 6. Split Section — paragraph 2 */}
      {splitParagraph2 && splitImage2 && (
        <ScrollReveal>
          <FicheSplitSection
            imageUrl={splitImage2}
            imageAlt={`${name} — The Wines`}
            label="The Wines"
            content={splitParagraph2}
            imagePosition="left"
          />
        </ScrollReveal>
      )}

      {/* 7. Editorial Highlights */}
      {highlightCards.length > 0 && (
        <ScrollReveal>
          <FicheHighlightsEditorial cards={highlightCards} />
        </ScrollReveal>
      )}

      {/* 8. Gallery */}
      {galleryImages.length > 0 && <FicheGallery images={galleryImages} name={name} />}

      {/* 9. Tags */}
      <FicheTags tags={tags} />

      {/* 10. CTA */}
      <FicheContact name={name} variant="editorial" />
    </>
  )
}
