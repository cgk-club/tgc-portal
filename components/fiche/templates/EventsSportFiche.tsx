import { Fiche, Highlight } from '@/types'
import { AirtableOrg } from '@/types'
import { EventsSportFields, isVenueEvent } from '@/lib/ficheTemplates'
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

export default function EventsSportFiche({
  fiche,
  org,
  name,
  location,
  highlights,
  galleryUrls,
  tags,
}: Props) {
  const tf = (fiche.template_fields || {}) as EventsSportFields
  const isVenue = isVenueEvent(org?.categorySub)

  // ── Stats ribbon ──────────────────────────────────────────────
  const stats: { label: string; value: string }[] = []
  if (isVenue) {
    if (tf.capacity_seated) stats.push({ label: 'Seated', value: String(tf.capacity_seated) })
    if (tf.capacity_standing) stats.push({ label: 'Standing', value: String(tf.capacity_standing) })
    if (tf.indoor_outdoor) stats.push({ label: 'Setting', value: tf.indoor_outdoor })
    if (tf.exclusive_hire) stats.push({ label: 'Exclusive Hire', value: tf.exclusive_hire })
  } else {
    if (tf.season) stats.push({ label: 'Season', value: tf.season })
    if (tf.skill_level) stats.push({ label: 'Level', value: tf.skill_level })
    if (tf.instruction_available) stats.push({ label: 'Instruction', value: 'Available' })
    if (tf.membership_required !== undefined) stats.push({ label: 'Membership', value: tf.membership_required ? 'Required' : 'Not required' })
  }
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
  if (isVenue) {
    if (tf.capacity_seated) autoHighlights.push({ icon: '', label: 'Capacity', value: `${tf.capacity_seated} seated` })
    if (tf.indoor_outdoor) autoHighlights.push({ icon: '', label: 'Setting', value: tf.indoor_outdoor })
    if (tf.catering_inhouse !== undefined) autoHighlights.push({ icon: '', label: 'Catering', value: tf.catering_inhouse ? 'In-house' : 'External' })
    if (tf.accommodation_onsite !== undefined) autoHighlights.push({ icon: '', label: 'Accommodation', value: tf.accommodation_onsite ? 'On site' : 'Nearby' })
    if (tf.av_equipment) autoHighlights.push({ icon: '', label: 'AV', value: tf.av_equipment === 'Yes' ? 'Full production' : tf.av_equipment })
    if (tf.accessibility) autoHighlights.push({ icon: '', label: 'Accessibility', value: tf.accessibility })
  } else {
    if (tf.season) autoHighlights.push({ icon: '', label: 'Season', value: tf.season })
    if (tf.skill_level) autoHighlights.push({ icon: '', label: 'Level', value: tf.skill_level })
    if (tf.instruction_available) autoHighlights.push({ icon: '', label: 'Instruction', value: 'Available' })
    if (tf.equipment_hire) autoHighlights.push({ icon: '', label: 'Equipment', value: 'Hire available' })
    if (tf.guest_policy) autoHighlights.push({ icon: '', label: 'Guest Policy', value: tf.guest_policy })
    if (tf.membership_required !== undefined) autoHighlights.push({ icon: '', label: 'Membership', value: tf.membership_required ? 'Required' : 'Not required' })
  }

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
  if (isVenue) {
    if (tf.capacity_seated) amenities.push({ label: 'Seated', value: String(tf.capacity_seated) })
    if (tf.capacity_standing) amenities.push({ label: 'Standing', value: String(tf.capacity_standing) })
    if (tf.indoor_outdoor) amenities.push({ label: 'Setting', value: tf.indoor_outdoor })
    if (tf.exclusive_hire) amenities.push({ label: 'Exclusive Hire', value: tf.exclusive_hire })
    if (tf.catering_inhouse !== undefined) amenities.push({ label: 'Catering', value: tf.catering_inhouse ? 'In-house' : 'External' })
    if (tf.av_equipment) amenities.push({ label: 'AV', value: tf.av_equipment === 'Yes' ? 'Full production' : tf.av_equipment })
    if (tf.accommodation_onsite !== undefined) amenities.push({ label: 'Accommodation', value: tf.accommodation_onsite ? 'On site' : 'Nearby' })
  } else {
    if (tf.season) amenities.push({ label: 'Season', value: tf.season })
    if (tf.skill_level) amenities.push({ label: 'Level', value: tf.skill_level })
    if (tf.instruction_available) amenities.push({ label: 'Instruction', value: 'Available' })
    if (tf.equipment_hire) amenities.push({ label: 'Equipment Hire', value: 'Available' })
    if (tf.guest_policy) amenities.push({ label: 'Guest Policy', value: tf.guest_policy })
  }
  for (const h of highlights) {
    const lbl = h.label.toLowerCase()
    if (!amenities.some(a => a.label.toLowerCase() === lbl)) {
      amenities.push({ label: h.label, value: h.value })
    }
  }

  // ── Venue/Playing details ─────────────────────────────────────
  const hasDetails = isVenue
    ? (tf.accessibility || tf.exclusive_hire || tf.catering_inhouse !== undefined || (fiche.show_price && fiche.price_display))
    : (tf.guest_policy || tf.equipment_hire !== undefined || tf.instruction_available !== undefined || (fiche.show_price && fiche.price_display))

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

      {/* 2. Stats Ribbon + Details */}
      {stats.length > 0 && <FicheStatsRibbon stats={stats} />}

      {hasDetails && (
        <div className="py-6 px-8 md:px-12 lg:px-16">
          <div className="max-w-3xl mx-auto">
            <dl className="grid grid-cols-2 sm:grid-cols-4 gap-x-8 gap-y-3 text-sm font-body text-center">
              {isVenue ? (
                <>
                  {tf.exclusive_hire && (
                    <div>
                      <dt className="text-[11px] text-gray-400 uppercase tracking-widest mb-1">Exclusive hire</dt>
                      <dd className="text-gray-800 font-medium">{tf.exclusive_hire}</dd>
                    </div>
                  )}
                  {tf.catering_inhouse !== undefined && (
                    <div>
                      <dt className="text-[11px] text-gray-400 uppercase tracking-widest mb-1">Catering</dt>
                      <dd className="text-gray-800 font-medium">{tf.catering_inhouse ? 'In-house' : 'External'}</dd>
                    </div>
                  )}
                  {tf.accessibility && (
                    <div>
                      <dt className="text-[11px] text-gray-400 uppercase tracking-widest mb-1">Accessibility</dt>
                      <dd className="text-gray-800 font-medium">{tf.accessibility}</dd>
                    </div>
                  )}
                </>
              ) : (
                <>
                  {tf.instruction_available !== undefined && (
                    <div>
                      <dt className="text-[11px] text-gray-400 uppercase tracking-widest mb-1">Instruction</dt>
                      <dd className="text-gray-800 font-medium">{tf.instruction_available ? 'Available' : 'Not available'}</dd>
                    </div>
                  )}
                  {tf.equipment_hire !== undefined && (
                    <div>
                      <dt className="text-[11px] text-gray-400 uppercase tracking-widest mb-1">Equipment hire</dt>
                      <dd className="text-gray-800 font-medium">{tf.equipment_hire ? 'Available' : 'Not available'}</dd>
                    </div>
                  )}
                  {tf.guest_policy && (
                    <div>
                      <dt className="text-[11px] text-gray-400 uppercase tracking-widest mb-1">Guest policy</dt>
                      <dd className="text-gray-800 font-medium">{tf.guest_policy}</dd>
                    </div>
                  )}
                </>
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
          <FicheAmenityIcons amenities={amenities} title={isVenue ? 'Venue Features' : 'Playing Details'} />
        </ScrollReveal>
      )}

      {/* 5. Split Section — paragraph 1 */}
      {splitParagraph1 && splitImage1 ? (
        <ScrollReveal>
          <FicheSplitSection
            imageUrl={splitImage1}
            imageAlt={`${name} — ${isVenue ? 'The Venue' : 'The Setting'}`}
            label={isVenue ? 'The Venue' : 'The Setting'}
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
            imageAlt={`${name} — ${isVenue ? 'The Experience' : 'The Sport'}`}
            label={isVenue ? 'The Experience' : 'The Sport'}
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
