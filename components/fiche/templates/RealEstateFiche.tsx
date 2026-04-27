import { Fiche, Highlight } from '@/types'
import { AirtableOrg } from '@/types'
import { RealEstateFields } from '@/lib/ficheTemplates'
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

const CATERING_LABELS: Record<string, string> = {
  'self-catered': 'Self-catered',
  'chef-available': 'Chef available',
  'full-board': 'Full board',
}

const EVENTS_LABELS: Record<string, string> = {
  'yes': 'Yes',
  'no': 'No',
  'on-request': 'On request',
}

export default function RealEstateFiche({
  fiche,
  org,
  name,
  location,
  highlights,
  galleryUrls,
  tags,
}: Props) {
  const tf = (fiche.template_fields || {}) as RealEstateFields

  // ── Stats ribbon ──────────────────────────────────────────────
  const stats: { label: string; value: string }[] = []
  if (tf.bedrooms) stats.push({ label: 'Bedrooms', value: String(tf.bedrooms) })
  if (tf.bathrooms) stats.push({ label: 'Bathrooms', value: String(tf.bathrooms) })
  if (tf.sleeps_adults) stats.push({ label: 'Sleeps', value: String(tf.sleeps_adults + (tf.sleeps_children || 0)) })
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
  if (tf.bedrooms) autoHighlights.push({ icon: '', label: 'Bedrooms', value: `${tf.bedrooms} bedroom${tf.bedrooms > 1 ? 's' : ''}` })
  if (tf.bathrooms) autoHighlights.push({ icon: '', label: 'Bathrooms', value: `${tf.bathrooms} bathroom${tf.bathrooms > 1 ? 's' : ''}` })
  if (tf.pool && tf.pool !== 'none') autoHighlights.push({ icon: '', label: 'Pool', value: `${tf.pool.charAt(0).toUpperCase() + tf.pool.slice(1)}${tf.pool_size ? `, ${tf.pool_size}` : ''}` })
  if (tf.nearest_airport) autoHighlights.push({ icon: '', label: 'Airport', value: tf.transfer_time ? `${tf.nearest_airport}, ${tf.transfer_time}` : tf.nearest_airport })
  if (tf.catering) autoHighlights.push({ icon: '', label: 'Catering', value: CATERING_LABELS[tf.catering] || tf.catering })
  if (tf.exclusive_hire) autoHighlights.push({ icon: '', label: 'Exclusive Hire', value: 'Yes' })

  const displayHighlights = highlights.length > 0 ? highlights : autoHighlights

  // Photo grid: first 6 gallery images, no label overlay
  const photoGridCards = highlightImages
    .slice(0, 6)
    .map(url => ({ imageUrl: url, heading: '', description: '' }))

  // ── Amenities (luxury icon grid) ────────────────────────────
  const amenities: { label: string; value: string }[] = []
  if (tf.bedrooms) amenities.push({ label: 'Rooms', value: `${tf.bedrooms} bedrooms` })
  if (tf.bathrooms) amenities.push({ label: 'Bathrooms', value: `${tf.bathrooms}` })
  if (tf.pool && tf.pool !== 'none') amenities.push({ label: 'Pool', value: tf.pool.charAt(0).toUpperCase() + tf.pool.slice(1) })
  if (tf.catering) amenities.push({ label: 'Catering', value: CATERING_LABELS[tf.catering] || tf.catering })
  if (tf.exclusive_hire) amenities.push({ label: 'Exclusive Hire', value: 'Yes' })
  for (const h of highlights) {
    const lbl = h.label.toLowerCase()
    if (!amenities.some(a => a.label.toLowerCase() === lbl)) {
      amenities.push({ label: h.label, value: h.value })
    }
  }

  // ── Property details ──────────────────────────────────────────
  const hasDetails = tf.sleeps_adults || tf.nearest_airport || tf.transfer_time ||
    tf.events_permitted || tf.minimum_stay || (fiche.show_price && fiche.price_display)

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

      {/* 2. Stats Ribbon + Property Details */}
      {stats.length > 0 && <FicheStatsRibbon stats={stats} />}

      {hasDetails && (
        <div className="py-6 px-8 md:px-12 lg:px-16">
          <div className="max-w-3xl mx-auto">
            <dl className="grid grid-cols-2 sm:grid-cols-4 gap-x-8 gap-y-3 text-sm font-body text-center">
              {tf.sleeps_adults && (
                <div>
                  <dt className="text-[11px] text-gray-400 uppercase tracking-widest mb-1">Sleeps</dt>
                  <dd className="text-gray-800 font-medium">
                    {tf.sleeps_adults} adults{tf.sleeps_children ? `, ${tf.sleeps_children} children` : ''}
                  </dd>
                </div>
              )}
              {tf.nearest_airport && (
                <div>
                  <dt className="text-[11px] text-gray-400 uppercase tracking-widest mb-1">Airport</dt>
                  <dd className="text-gray-800 font-medium">{tf.nearest_airport}</dd>
                </div>
              )}
              {tf.transfer_time && (
                <div>
                  <dt className="text-[11px] text-gray-400 uppercase tracking-widest mb-1">Transfer</dt>
                  <dd className="text-gray-800 font-medium">{tf.transfer_time}</dd>
                </div>
              )}
              {tf.events_permitted && (
                <div>
                  <dt className="text-[11px] text-gray-400 uppercase tracking-widest mb-1">Events</dt>
                  <dd className="text-gray-800 font-medium">{EVENTS_LABELS[tf.events_permitted] || tf.events_permitted}</dd>
                </div>
              )}
              {tf.minimum_stay && (
                <div>
                  <dt className="text-[11px] text-gray-400 uppercase tracking-widest mb-1">Minimum stay</dt>
                  <dd className="text-gray-800 font-medium">{tf.minimum_stay}</dd>
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
          <FicheAmenityIcons amenities={amenities} title="Property Features" />
        </ScrollReveal>
      )}

      {/* 5. Split Section — paragraph 1 */}
      {splitParagraph1 && splitImage1 ? (
        <ScrollReveal>
          <FicheSplitSection
            imageUrl={splitImage1}
            imageAlt={`${name} — The Property`}
            label="The Property"
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
            imageAlt={`${name} — The Living`}
            label="The Living"
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
