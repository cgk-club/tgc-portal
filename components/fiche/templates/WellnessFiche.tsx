import { Fiche, Highlight } from '@/types'
import { AirtableOrg } from '@/types'
import { WellnessFields } from '@/lib/ficheTemplates'
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

  // ── Stats ribbon ──────────────────────────────────────────────
  const stats: { label: string; value: string }[] = []
  if (tf.wellness_focus) stats.push({ label: 'Focus', value: tf.wellness_focus })
  if (tf.minimum_stay) stats.push({ label: 'Min. Stay', value: tf.minimum_stay })
  if (tf.suitable_for) stats.push({ label: 'Suitable For', value: tf.suitable_for })
  if (tf.accommodation) stats.push({ label: 'Accommodation', value: 'On-site' })
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
  if (tf.wellness_focus) autoHighlights.push({ icon: '', label: 'Focus', value: tf.wellness_focus })
  if (tf.treatment_philosophy) autoHighlights.push({ icon: '', label: 'Philosophy', value: tf.treatment_philosophy })
  if (tf.signature_treatment) autoHighlights.push({ icon: '', label: 'Signature Treatment', value: tf.signature_treatment })
  if (tf.facilities) autoHighlights.push({ icon: '', label: 'Facilities', value: tf.facilities })
  if (tf.practitioners) autoHighlights.push({ icon: '', label: 'Practitioners', value: tf.practitioners })
  if (tf.programmes_available) autoHighlights.push({ icon: '', label: 'Programmes', value: tf.programmes_available })

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
  if (tf.wellness_focus) amenities.push({ label: 'Wellness', value: tf.wellness_focus })
  if (tf.signature_treatment) amenities.push({ label: 'Spa', value: tf.signature_treatment })
  if (tf.facilities) amenities.push({ label: 'Facilities', value: tf.facilities })
  if (tf.practitioners) amenities.push({ label: 'Practitioners', value: tf.practitioners })
  if (tf.programmes_available) amenities.push({ label: 'Programmes', value: tf.programmes_available })
  if (tf.medical_consultations) amenities.push({ label: 'Medical', value: 'Consultations available' })
  for (const h of highlights) {
    const lbl = h.label.toLowerCase()
    if (!amenities.some(a => a.label.toLowerCase() === lbl)) {
      amenities.push({ label: h.label, value: h.value })
    }
  }

  // ── Visit details ─────────────────────────────────────────────
  const hasDetails = tf.signature_treatment || tf.minimum_stay || tf.suitable_for ||
    tf.medical_consultations || (fiche.show_price && fiche.price_display)

  return (
    <>
      {/* 1. Cinematic Hero */}
      <FicheHero
        name={name}
        category={org?.category || ''}
        categorySub="Wellness"
        location={location}
        heroImageUrl={fiche.hero_image_url}
        variant="cinematic"
      />

      {/* 2. Stats Ribbon + Visit Details */}
      {stats.length > 0 && <FicheStatsRibbon stats={stats} />}

      {hasDetails && (
        <div className="py-6 px-8 md:px-12 lg:px-16">
          <div className="max-w-3xl mx-auto">
            <dl className="grid grid-cols-2 sm:grid-cols-4 gap-x-8 gap-y-3 text-sm font-body text-center">
              {tf.signature_treatment && (
                <div>
                  <dt className="text-[11px] text-gray-400 uppercase tracking-widest mb-1">Signature</dt>
                  <dd className="text-gray-800 font-medium">{tf.signature_treatment}</dd>
                </div>
              )}
              {tf.minimum_stay && (
                <div>
                  <dt className="text-[11px] text-gray-400 uppercase tracking-widest mb-1">Minimum stay</dt>
                  <dd className="text-gray-800 font-medium">{tf.minimum_stay}</dd>
                </div>
              )}
              {tf.suitable_for && (
                <div>
                  <dt className="text-[11px] text-gray-400 uppercase tracking-widest mb-1">Suitable for</dt>
                  <dd className="text-gray-800 font-medium">{tf.suitable_for}</dd>
                </div>
              )}
              {tf.medical_consultations && (
                <div>
                  <dt className="text-[11px] text-gray-400 uppercase tracking-widest mb-1">Medical</dt>
                  <dd className="text-gray-800 font-medium">Consultations available</dd>
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
          <FicheAmenityIcons amenities={amenities} title="Your Wellness Journey" />
        </ScrollReveal>
      )}

      {/* 5. Split Section — paragraph 1 */}
      {splitParagraph1 && splitImage1 ? (
        <ScrollReveal>
          <FicheSplitSection
            imageUrl={splitImage1}
            imageAlt={`${name} — The Philosophy`}
            label="The Philosophy"
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
            imageAlt={`${name} — The Retreat`}
            label="The Retreat"
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
