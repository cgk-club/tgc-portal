import { Fiche, Highlight } from '@/types'
import { AirtableOrg } from '@/types'
import { HospitalityFields } from '@/lib/ficheTemplates'
import FicheHero from '@/components/fiche/FicheHero'
import FicheStatsRibbon from '@/components/fiche/FicheStatsRibbon'
import FicheStatement from '@/components/fiche/FicheStatement'
import FicheSplitSection from '@/components/fiche/FicheSplitSection'
import FicheHighlightsEditorial from '@/components/fiche/FicheHighlightsEditorial'
import FicheHighlights from '@/components/fiche/FicheHighlights'
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

export default function HospitalityFiche({
  fiche,
  org,
  name,
  location,
  highlights,
  galleryUrls,
  tags,
}: Props) {
  const tf = (fiche.template_fields || {}) as HospitalityFields

  // ── Stats ribbon ──────────────────────────────────────────────
  const stats: { label: string; value: string }[] = []
  if (tf.room_count) stats.push({ label: 'Rooms', value: String(tf.room_count) })
  if (tf.star_rating) stats.push({ label: 'Rating', value: `${tf.star_rating} Stars` })
  if (tf.restaurants_onsite) stats.push({ label: 'Restaurants', value: String(tf.restaurants_onsite) })
  if (tf.has_spa) stats.push({ label: 'Spa', value: 'Yes' })
  if (tf.pool && tf.pool !== 'none') stats.push({ label: 'Pool', value: tf.pool.charAt(0).toUpperCase() + tf.pool.slice(1) })
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
  if (tf.room_count) autoHighlights.push({ icon: '', label: 'Rooms', value: `${tf.room_count} rooms` })
  if (tf.star_rating) autoHighlights.push({ icon: '', label: 'Rating', value: `${tf.star_rating} star${tf.star_rating > 1 ? 's' : ''}` })
  if (tf.restaurants_onsite) autoHighlights.push({ icon: '', label: 'Dining', value: `${tf.restaurants_onsite} restaurant${tf.restaurants_onsite > 1 ? 's' : ''}` })
  if (tf.has_spa) autoHighlights.push({ icon: '', label: 'Spa & Wellness', value: 'On-site spa' })
  if (tf.pool && tf.pool !== 'none') autoHighlights.push({ icon: '', label: 'Pool', value: `${tf.pool.charAt(0).toUpperCase() + tf.pool.slice(1)} pool` })
  if (tf.pet_policy) autoHighlights.push({ icon: '', label: 'Pets', value: tf.pet_policy })

  const displayHighlights = highlights.length > 0 ? highlights : autoHighlights

  // Photo grid: first 6 gallery images, no label overlay
  const photoGridCards = highlightImages
    .slice(0, 6)
    .map(url => ({ imageUrl: url, heading: '', description: '' }))

  // ── Amenities (luxury icon grid) ────────────────────────────
  const amenities: { label: string; value: string }[] = []
  if (tf.room_count) amenities.push({ label: 'Rooms', value: `${tf.room_count} rooms` })
  if (tf.restaurants_onsite) amenities.push({ label: 'Restaurant', value: `${tf.restaurants_onsite} on-site` })
  if (tf.has_spa) amenities.push({ label: 'Spa', value: 'Yes' })
  if (tf.pool && tf.pool !== 'none') amenities.push({ label: 'Pool', value: tf.pool.charAt(0).toUpperCase() + tf.pool.slice(1) })
  if (tf.pet_policy) amenities.push({ label: 'Pets', value: tf.pet_policy })
  // Add from manual highlights that aren't already covered
  for (const h of highlights) {
    const lbl = h.label.toLowerCase()
    if (!amenities.some(a => a.label.toLowerCase() === lbl)) {
      amenities.push({ label: h.label, value: h.value })
    }
  }

  // ── Stay details ──────────────────────────────────────────────
  const hasStayDetails = tf.checkin_time || tf.checkout_time || tf.minimum_stay || tf.pet_policy || (fiche.show_price && fiche.price_display)

  return (
    <>
      {/* 1. Cinematic Hero (centered title) */}
      <FicheHero
        name={name}
        category={org?.category || ''}
        categorySub={org?.categorySub || ''}
        location={location}
        heroImageUrl={fiche.hero_image_url}
        variant="cinematic"
      />

      {/* 2. Stats Ribbon + Stay Details (together, right after hero) */}
      {stats.length > 0 && <FicheStatsRibbon stats={stats} />}

      {hasStayDetails && (
        <div className="py-6 px-8 md:px-12 lg:px-16">
          <div className="max-w-3xl mx-auto">
            <dl className="grid grid-cols-2 sm:grid-cols-4 gap-x-8 gap-y-3 text-sm font-body text-center">
              {tf.checkin_time && (
                <div>
                  <dt className="text-[11px] text-gray-400 uppercase tracking-widest mb-1">Check-in</dt>
                  <dd className="text-gray-800 font-medium">{tf.checkin_time}</dd>
                </div>
              )}
              {tf.checkout_time && (
                <div>
                  <dt className="text-[11px] text-gray-400 uppercase tracking-widest mb-1">Check-out</dt>
                  <dd className="text-gray-800 font-medium">{tf.checkout_time}</dd>
                </div>
              )}
              {tf.minimum_stay && (
                <div>
                  <dt className="text-[11px] text-gray-400 uppercase tracking-widest mb-1">Minimum stay</dt>
                  <dd className="text-gray-800 font-medium">{tf.minimum_stay}</dd>
                </div>
              )}
              {tf.pet_policy && (
                <div>
                  <dt className="text-[11px] text-gray-400 uppercase tracking-widest mb-1">Pets</dt>
                  <dd className="text-gray-800 font-medium">{tf.pet_policy}</dd>
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

      {/* 4. Amenities & Services (after tagline, before splits) */}
      {amenities.length > 0 && (
        <ScrollReveal>
          <FicheAmenityIcons amenities={amenities} title="Amenities & Services" />
        </ScrollReveal>
      )}

      {/* 5. Split Section — paragraph 1 */}
      {splitParagraph1 && splitImage1 ? (
        <ScrollReveal>
          <FicheSplitSection
            imageUrl={splitImage1}
            imageAlt={`${name} — The Setting`}
            label="The Setting"
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

      {/* 7. Photo grid — pure gallery, no text overlays */}
      {photoGridCards.length > 0 && (
        <ScrollReveal>
          <FicheHighlightsEditorial cards={photoGridCards} showLabels={false} />
        </ScrollReveal>
      )}

      {/* 8. Highlights — clean feature band */}
      {displayHighlights.length > 0 && (
        <ScrollReveal>
          <FicheHighlights highlights={displayHighlights} />
        </ScrollReveal>
      )}

      {/* 9. Gallery */}
      {galleryImages.length > 0 && <FicheGallery images={galleryImages} name={name} />}

      {/* 9. Tags */}
      <FicheTags tags={tags} />

      {/* 10. CTA */}
      <FicheContact name={name} variant="editorial" />
    </>
  )
}
