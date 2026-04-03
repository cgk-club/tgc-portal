import { Fiche, Highlight } from '@/types'
import { AirtableOrg } from '@/types'
import { ArtsCultureFields } from '@/lib/ficheTemplates'
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

  const displayCategorySub = tf.institution_type || org?.categorySub || ''

  // ── Stats ribbon ──────────────────────────────────────────────
  const stats: { label: string; value: string }[] = []
  if (tf.specialisation) stats.push({ label: 'Specialisation', value: tf.specialisation })
  if (tf.founded) stats.push({ label: 'Founded', value: String(tf.founded) })
  if (tf.permanent_collection !== undefined) stats.push({ label: 'Collection', value: tf.permanent_collection ? 'Permanent' : 'Rotating' })
  if (tf.private_views) stats.push({ label: 'Private Views', value: 'Available' })
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
  if (tf.specialisation) autoHighlights.push({ icon: '', label: 'Specialisation', value: tf.specialisation })
  if (tf.founded) autoHighlights.push({ icon: '', label: 'Established', value: String(tf.founded) })
  if (tf.permanent_collection !== undefined) autoHighlights.push({ icon: '', label: 'Collection', value: tf.permanent_collection ? 'Permanent collection' : 'Rotating exhibitions' })
  if (tf.current_programme) autoHighlights.push({ icon: '', label: 'Programme', value: tf.current_programme })
  if (tf.private_views) autoHighlights.push({ icon: '', label: 'Private Views', value: 'Via TGC' })
  if (tf.art_advisory) autoHighlights.push({ icon: '', label: 'Art Advisory', value: 'Available' })

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
  if (tf.specialisation) amenities.push({ label: 'Specialisation', value: tf.specialisation })
  if (tf.private_views) amenities.push({ label: 'Private Views', value: 'Invitation via TGC' })
  if (tf.art_advisory) amenities.push({ label: 'Art Advisory', value: 'Yes' })
  if (tf.shipping_logistics) amenities.push({ label: 'Shipping', value: 'Logistics available' })
  if (tf.current_programme) amenities.push({ label: 'Programme', value: tf.current_programme })
  for (const h of highlights) {
    const lbl = h.label.toLowerCase()
    if (!amenities.some(a => a.label.toLowerCase() === lbl)) {
      amenities.push({ label: h.label, value: h.value })
    }
  }

  // ── Visit details ─────────────────────────────────────────────
  const hasDetails = tf.institution_type || tf.visiting_hours || tf.admission ||
    tf.art_advisory || tf.shipping_logistics || (fiche.show_price && fiche.price_display)

  return (
    <>
      {/* 1. Cinematic Hero */}
      <FicheHero
        name={name}
        category={org?.category || ''}
        categorySub={displayCategorySub}
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
              {tf.institution_type && (
                <div>
                  <dt className="text-[11px] text-gray-400 uppercase tracking-widest mb-1">Type</dt>
                  <dd className="text-gray-800 font-medium">{tf.institution_type}</dd>
                </div>
              )}
              {tf.visiting_hours && (
                <div>
                  <dt className="text-[11px] text-gray-400 uppercase tracking-widest mb-1">Hours</dt>
                  <dd className="text-gray-800 font-medium">{tf.visiting_hours}</dd>
                </div>
              )}
              {tf.admission && (
                <div>
                  <dt className="text-[11px] text-gray-400 uppercase tracking-widest mb-1">Admission</dt>
                  <dd className="text-gray-800 font-medium">{tf.admission}</dd>
                </div>
              )}
              {tf.art_advisory && (
                <div>
                  <dt className="text-[11px] text-gray-400 uppercase tracking-widest mb-1">Art advisory</dt>
                  <dd className="text-gray-800 font-medium">Yes</dd>
                </div>
              )}
              {tf.shipping_logistics && (
                <div>
                  <dt className="text-[11px] text-gray-400 uppercase tracking-widest mb-1">Shipping</dt>
                  <dd className="text-gray-800 font-medium">Logistics available</dd>
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
          <FicheAmenityIcons amenities={amenities} title="At a Glance" />
        </ScrollReveal>
      )}

      {/* 5. Split Section — paragraph 1 */}
      {splitParagraph1 && splitImage1 ? (
        <ScrollReveal>
          <FicheSplitSection
            imageUrl={splitImage1}
            imageAlt={`${name} — The Collection`}
            label="The Collection"
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
            imageAlt={`${name} — The Programme`}
            label="The Programme"
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
