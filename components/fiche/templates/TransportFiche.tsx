import { Fiche, Highlight } from '@/types'
import { AirtableOrg } from '@/types'
import { TransportFields, isAirSeaTransport } from '@/lib/ficheTemplates'
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

  // ── Stats ribbon ──────────────────────────────────────────────
  const stats: { label: string; value: string }[] = []
  if (tf.capacity_passengers) stats.push({ label: 'Capacity', value: `${tf.capacity_passengers} pax` })
  if (tf.base_location) stats.push({ label: 'Base', value: tf.base_location })
  if (tf.operating_area) stats.push({ label: 'Operating Area', value: tf.operating_area })
  if (tf.vehicle_type) stats.push({ label: airSea ? 'Vessel / Aircraft' : 'Vehicle', value: tf.vehicle_type })
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
  if (tf.capacity_passengers) autoHighlights.push({ icon: '', label: 'Capacity', value: `${tf.capacity_passengers} passengers` })
  if (tf.base_location) autoHighlights.push({ icon: '', label: 'Base', value: tf.base_location })
  if (tf.operating_area) autoHighlights.push({ icon: '', label: 'Operating Area', value: tf.operating_area })
  if (tf.fleet_size) autoHighlights.push({ icon: '', label: 'Fleet', value: tf.fleet_size })
  if (tf.range_coverage) autoHighlights.push({ icon: '', label: airSea ? 'Range' : 'Coverage', value: tf.range_coverage })
  if (tf.certifications) autoHighlights.push({ icon: '', label: 'Certifications', value: tf.certifications })

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
  if (tf.vehicle_type) amenities.push({ label: airSea ? 'Vessel / Aircraft' : 'Vehicle', value: tf.vehicle_type })
  if (tf.fleet_size) amenities.push({ label: 'Fleet', value: tf.fleet_size })
  if (tf.capacity_passengers) amenities.push({ label: 'Capacity', value: `${tf.capacity_passengers} passengers` })
  if (airSea && tf.capacity_crew) amenities.push({ label: 'Crew', value: String(tf.capacity_crew) })
  if (tf.range_coverage) amenities.push({ label: airSea ? 'Range' : 'Coverage', value: tf.range_coverage })
  if (tf.certifications) amenities.push({ label: 'Certifications', value: tf.certifications })
  for (const h of highlights) {
    const lbl = h.label.toLowerCase()
    if (!amenities.some(a => a.label.toLowerCase() === lbl)) {
      amenities.push({ label: h.label, value: h.value })
    }
  }

  // ── Specifications details ────────────────────────────────────
  const hasDetails = tf.lead_time || (airSea && tf.catering) || tf.certifications || (fiche.show_price && fiche.price_display)

  return (
    <>
      {/* 1. Cinematic Hero */}
      <FicheHero
        name={name}
        category={org?.category || ''}
        categorySub={org?.categorySub || ''}
        location={location}
        heroImageUrl={fiche.hero_image_url}
        variant="cinematic"
      />

      {/* 2. Stats Ribbon + Specifications */}
      {stats.length > 0 && <FicheStatsRibbon stats={stats} />}

      {hasDetails && (
        <div className="py-6 px-8 md:px-12 lg:px-16">
          <div className="max-w-3xl mx-auto">
            <dl className="grid grid-cols-2 sm:grid-cols-4 gap-x-8 gap-y-3 text-sm font-body text-center">
              {tf.lead_time && (
                <div>
                  <dt className="text-[11px] text-gray-400 uppercase tracking-widest mb-1">Lead time</dt>
                  <dd className="text-gray-800 font-medium">{tf.lead_time}</dd>
                </div>
              )}
              {airSea && tf.catering && (
                <div>
                  <dt className="text-[11px] text-gray-400 uppercase tracking-widest mb-1">Catering</dt>
                  <dd className="text-gray-800 font-medium">{tf.catering}</dd>
                </div>
              )}
              {tf.certifications && (
                <div>
                  <dt className="text-[11px] text-gray-400 uppercase tracking-widest mb-1">Certifications</dt>
                  <dd className="text-gray-800 font-medium">{tf.certifications}</dd>
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
          <FicheAmenityIcons amenities={amenities} title="Specifications" />
        </ScrollReveal>
      )}

      {/* 5. Split Section — paragraph 1 */}
      {splitParagraph1 && splitImage1 ? (
        <ScrollReveal>
          <FicheSplitSection
            imageUrl={splitImage1}
            imageAlt={`${name} — The Fleet`}
            label="The Fleet"
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
            imageAlt={`${name} — The Service`}
            label="The Service"
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
