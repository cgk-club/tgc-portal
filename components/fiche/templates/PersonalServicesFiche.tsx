import { Fiche, Highlight } from '@/types'
import { AirtableOrg } from '@/types'
import { PersonalServicesFields } from '@/lib/ficheTemplates'
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

  // ── Stats ribbon ──────────────────────────────────────────────
  const stats: { label: string; value: string }[] = []
  if (tf.service_type) stats.push({ label: 'Service', value: tf.service_type })
  if (tf.base_city) stats.push({ label: 'Based In', value: tf.base_city })
  if (tf.experience_years) stats.push({ label: 'Experience', value: `${tf.experience_years} years` })
  if (tf.languages) stats.push({ label: 'Languages', value: tf.languages })
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
  if (tf.service_type) autoHighlights.push({ icon: '', label: 'Service', value: tf.service_type })
  if (tf.specialisation) autoHighlights.push({ icon: '', label: 'Specialisation', value: tf.specialisation })
  if (tf.languages) autoHighlights.push({ icon: '', label: 'Languages', value: tf.languages })
  if (tf.availability) autoHighlights.push({ icon: '', label: 'Availability', value: tf.availability })
  if (tf.certifications) autoHighlights.push({ icon: '', label: 'Certifications', value: tf.certifications })
  if (tf.group_size) autoHighlights.push({ icon: '', label: 'Group Size', value: tf.group_size })

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
  if (tf.service_type) amenities.push({ label: 'Service', value: tf.service_type })
  if (tf.specialisation) amenities.push({ label: 'Specialisation', value: tf.specialisation })
  if (tf.languages) amenities.push({ label: 'Languages', value: tf.languages })
  if (tf.certifications) amenities.push({ label: 'Certifications', value: tf.certifications })
  if (tf.equipment_provided) amenities.push({ label: 'Equipment', value: tf.equipment_provided })
  for (const h of highlights) {
    const lbl = h.label.toLowerCase()
    if (!amenities.some(a => a.label.toLowerCase() === lbl)) {
      amenities.push({ label: h.label, value: h.value })
    }
  }

  // ── Service details ───────────────────────────────────────────
  const hasDetails = tf.specialisation || tf.travel_radius || tf.rate_structure ||
    tf.booking_lead_time || tf.equipment_provided || (fiche.show_price && fiche.price_display)

  return (
    <>
      {/* 1. Cinematic Hero */}
      <FicheHero
        name={name}
        category={org?.category || ''}
        categorySub="Personal Services"
        location={location}
        heroImageUrl={fiche.hero_image_url}
        variant="cinematic"
      />

      {/* 2. Stats Ribbon + Service Details */}
      {stats.length > 0 && <FicheStatsRibbon stats={stats} />}

      {hasDetails && (
        <div className="py-6 px-8 md:px-12 lg:px-16">
          <div className="max-w-3xl mx-auto">
            <dl className="grid grid-cols-2 sm:grid-cols-4 gap-x-8 gap-y-3 text-sm font-body text-center">
              {tf.specialisation && (
                <div>
                  <dt className="text-[11px] text-gray-400 uppercase tracking-widest mb-1">Specialisation</dt>
                  <dd className="text-gray-800 font-medium">{tf.specialisation}</dd>
                </div>
              )}
              {tf.travel_radius && (
                <div>
                  <dt className="text-[11px] text-gray-400 uppercase tracking-widest mb-1">Travel radius</dt>
                  <dd className="text-gray-800 font-medium">{tf.travel_radius}</dd>
                </div>
              )}
              {tf.rate_structure && (
                <div>
                  <dt className="text-[11px] text-gray-400 uppercase tracking-widest mb-1">Rates</dt>
                  <dd className="text-gray-800 font-medium">{tf.rate_structure}</dd>
                </div>
              )}
              {tf.booking_lead_time && (
                <div>
                  <dt className="text-[11px] text-gray-400 uppercase tracking-widest mb-1">Lead time</dt>
                  <dd className="text-gray-800 font-medium">{tf.booking_lead_time}</dd>
                </div>
              )}
              {tf.equipment_provided && (
                <div>
                  <dt className="text-[11px] text-gray-400 uppercase tracking-widest mb-1">Equipment</dt>
                  <dd className="text-gray-800 font-medium">{tf.equipment_provided}</dd>
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
          <FicheAmenityIcons amenities={amenities} title="Service Profile" />
        </ScrollReveal>
      )}

      {/* 5. Split Section — paragraph 1 */}
      {splitParagraph1 && splitImage1 ? (
        <ScrollReveal>
          <FicheSplitSection
            imageUrl={splitImage1}
            imageAlt={`${name} — The Service`}
            label="The Service"
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
            imageAlt={`${name} — The Approach`}
            label="The Approach"
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
