import { Fiche, Highlight } from '@/types'
import { AirtableOrg } from '@/types'
import { DiningFields } from '@/lib/ficheTemplates'
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

const DRESS_LABELS: Record<string, string> = {
  'casual': 'Casual',
  'smart-casual': 'Smart casual',
  'smart': 'Smart',
  'black-tie': 'Black tie',
}

export default function DiningFiche({
  fiche,
  org,
  name,
  location,
  highlights,
  galleryUrls,
  tags,
}: Props) {
  const tf = (fiche.template_fields || {}) as DiningFields

  // ── Stats ribbon ──────────────────────────────────────────────
  const stats: { label: string; value: string }[] = []
  if (tf.cuisine) stats.push({ label: 'Cuisine', value: tf.cuisine })
  if (tf.chef_name) stats.push({ label: 'Chef', value: tf.chef_name })
  if (tf.recognition) stats.push({ label: 'Recognition', value: tf.recognition })
  if (tf.covers) stats.push({ label: 'Covers', value: String(tf.covers) })
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
  if (tf.cuisine) autoHighlights.push({ icon: '', label: 'Cuisine', value: tf.cuisine })
  if (tf.chef_name) autoHighlights.push({ icon: '', label: 'Chef', value: tf.chef_name })
  if (tf.recognition) autoHighlights.push({ icon: '', label: 'Recognition', value: tf.recognition })
  if (tf.covers) autoHighlights.push({ icon: '', label: 'Covers', value: `${tf.covers} covers` })
  if (tf.signature_dish) autoHighlights.push({ icon: '', label: 'Signature', value: tf.signature_dish })
  if (tf.private_dining) autoHighlights.push({ icon: '', label: 'Private Dining', value: tf.private_dining_details || 'Available' })

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
  if (tf.cuisine) amenities.push({ label: 'Cuisine', value: tf.cuisine })
  if (tf.covers) amenities.push({ label: 'Covers', value: `${tf.covers}` })
  if (tf.private_dining) amenities.push({ label: 'Private Dining', value: tf.private_dining_details || 'Available' })
  if (tf.dress_code) amenities.push({ label: 'Dress Code', value: DRESS_LABELS[tf.dress_code] || tf.dress_code })
  for (const h of highlights) {
    const lbl = h.label.toLowerCase()
    if (!amenities.some(a => a.label.toLowerCase() === lbl)) {
      amenities.push({ label: h.label, value: h.value })
    }
  }

  // ── Reservation details ───────────────────────────────────────
  const hasDetails = tf.signature_dish || tf.dress_code || tf.reservation_lead || tf.private_dining !== undefined || (fiche.show_price && fiche.price_display)

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

      {/* 2. Stats Ribbon + Reservation Details */}
      {stats.length > 0 && <FicheStatsRibbon stats={stats} />}

      {hasDetails && (
        <div className="py-6 px-8 md:px-12 lg:px-16">
          <div className="max-w-3xl mx-auto">
            <dl className="grid grid-cols-2 sm:grid-cols-4 gap-x-8 gap-y-3 text-sm font-body text-center">
              {tf.signature_dish && (
                <div>
                  <dt className="text-[11px] text-gray-400 uppercase tracking-widest mb-1">Signature</dt>
                  <dd className="text-gray-800 font-medium">{tf.signature_dish}</dd>
                </div>
              )}
              {tf.dress_code && (
                <div>
                  <dt className="text-[11px] text-gray-400 uppercase tracking-widest mb-1">Dress code</dt>
                  <dd className="text-gray-800 font-medium">{DRESS_LABELS[tf.dress_code] || tf.dress_code}</dd>
                </div>
              )}
              {tf.reservation_lead && (
                <div>
                  <dt className="text-[11px] text-gray-400 uppercase tracking-widest mb-1">Book ahead</dt>
                  <dd className="text-gray-800 font-medium">{tf.reservation_lead}</dd>
                </div>
              )}
              {tf.private_dining !== undefined && (
                <div>
                  <dt className="text-[11px] text-gray-400 uppercase tracking-widest mb-1">Private dining</dt>
                  <dd className="text-gray-800 font-medium">
                    {tf.private_dining ? (tf.private_dining_details || 'Available') : 'Not available'}
                  </dd>
                </div>
              )}
              {fiche.show_price && fiche.price_display && (
                <div>
                  <dt className="text-[11px] text-gray-400 uppercase tracking-widest mb-1">Per person</dt>
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
          <FicheAmenityIcons amenities={amenities} title="The Table" />
        </ScrollReveal>
      )}

      {/* 5. Split Section — paragraph 1 */}
      {splitParagraph1 && splitImage1 ? (
        <ScrollReveal>
          <FicheSplitSection
            imageUrl={splitImage1}
            imageAlt={`${name} — The Cuisine`}
            label="The Cuisine"
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
            imageAlt={`${name} — The Experience`}
            label="The Experience"
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
