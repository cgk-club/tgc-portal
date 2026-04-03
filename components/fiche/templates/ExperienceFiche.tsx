import { Fiche, Highlight } from '@/types'
import { AirtableOrg } from '@/types'
import { ExperienceFields } from '@/lib/ficheTemplates'
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

  // ── Stats ribbon ──────────────────────────────────────────────
  const stats: { label: string; value: string }[] = []
  if (tf.duration) stats.push({ label: 'Duration', value: tf.duration })
  if (tf.group_size) stats.push({ label: 'Group Size', value: tf.group_size })
  if (tf.physical_level) stats.push({ label: 'Level', value: tf.physical_level })
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
  if (tf.duration) autoHighlights.push({ icon: '', label: 'Duration', value: tf.duration })
  if (tf.group_size) autoHighlights.push({ icon: '', label: 'Group Size', value: tf.group_size })
  if (tf.languages) autoHighlights.push({ icon: '', label: 'Languages', value: tf.languages })
  if (tf.seasonal) autoHighlights.push({ icon: '', label: 'Season', value: tf.seasonal })
  if (tf.whats_included) autoHighlights.push({ icon: '', label: 'Included', value: tf.whats_included })
  if (tf.physical_level) autoHighlights.push({ icon: '', label: 'Physical Level', value: tf.physical_level })

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
  if (tf.duration) amenities.push({ label: 'Duration', value: tf.duration })
  if (tf.group_size) amenities.push({ label: 'Group Size', value: tf.group_size })
  if (tf.languages) amenities.push({ label: 'Languages', value: tf.languages })
  if (tf.physical_level) amenities.push({ label: 'Physical Level', value: tf.physical_level })
  if (tf.whats_included) amenities.push({ label: 'Included', value: tf.whats_included })
  for (const h of highlights) {
    const lbl = h.label.toLowerCase()
    if (!amenities.some(a => a.label.toLowerCase() === lbl)) {
      amenities.push({ label: h.label, value: h.value })
    }
  }

  // ── Experience details ────────────────────────────────────────
  const hasDetails = tf.minimum_age || tf.booking_lead_time || tf.whats_not_included || tf.seasonal || (fiche.show_price && fiche.price_display)

  return (
    <>
      {/* 1. Cinematic Hero */}
      <FicheHero
        name={name}
        category={org?.category || ''}
        categorySub={tf.experience_type || org?.categorySub || ''}
        location={location}
        heroImageUrl={fiche.hero_image_url}
        variant="cinematic"
      />

      {/* 2. Stats Ribbon + Experience Details */}
      {stats.length > 0 && <FicheStatsRibbon stats={stats} />}

      {hasDetails && (
        <div className="py-6 px-8 md:px-12 lg:px-16">
          <div className="max-w-3xl mx-auto">
            <dl className="grid grid-cols-2 sm:grid-cols-4 gap-x-8 gap-y-3 text-sm font-body text-center">
              {tf.minimum_age && (
                <div>
                  <dt className="text-[11px] text-gray-400 uppercase tracking-widest mb-1">Minimum age</dt>
                  <dd className="text-gray-800 font-medium">{tf.minimum_age}</dd>
                </div>
              )}
              {tf.booking_lead_time && (
                <div>
                  <dt className="text-[11px] text-gray-400 uppercase tracking-widest mb-1">Booking</dt>
                  <dd className="text-gray-800 font-medium">{tf.booking_lead_time}</dd>
                </div>
              )}
              {tf.seasonal && (
                <div>
                  <dt className="text-[11px] text-gray-400 uppercase tracking-widest mb-1">Season</dt>
                  <dd className="text-gray-800 font-medium">{tf.seasonal}</dd>
                </div>
              )}
              {tf.whats_not_included && (
                <div>
                  <dt className="text-[11px] text-gray-400 uppercase tracking-widest mb-1">Not included</dt>
                  <dd className="text-gray-800 font-medium">{tf.whats_not_included}</dd>
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
          <FicheAmenityIcons amenities={amenities} title="What to Expect" />
        </ScrollReveal>
      )}

      {/* 5. Split Section — paragraph 1 */}
      {splitParagraph1 && splitImage1 ? (
        <ScrollReveal>
          <FicheSplitSection
            imageUrl={splitImage1}
            imageAlt={`${name} — The Experience`}
            label="The Experience"
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
            imageAlt={`${name} — The Journey`}
            label="The Journey"
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
