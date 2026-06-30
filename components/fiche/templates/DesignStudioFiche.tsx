import { Fiche, Highlight, AirtableOrg } from '@/types'
import { DesignStudioFields } from '@/lib/ficheTemplates'
import FicheHero from '@/components/fiche/FicheHero'
import FicheStatsRibbon from '@/components/fiche/FicheStatsRibbon'
import FicheStatement from '@/components/fiche/FicheStatement'
import FicheSplitSection from '@/components/fiche/FicheSplitSection'
import FicheHighlightsEditorial from '@/components/fiche/FicheHighlightsEditorial'
import FicheGallery from '@/components/fiche/FicheGallery'
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

// Split a multi-line field into trimmed, non-empty lines.
function lines(value?: string): string[] {
  return (value || '')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
}

// Split "Project name - Location" on the first dash/pipe/middot separator.
function splitProject(line: string): { name: string; place: string } {
  const m = line.split(/\s+[—–\-|·]\s+/)
  return { name: m[0]?.trim() || line, place: m.slice(1).join(' ').trim() }
}

export default function DesignStudioFiche({
  fiche,
  org,
  name,
  location,
  highlights,
  galleryUrls,
  tags,
}: Props) {
  const tf = (fiche.template_fields || {}) as DesignStudioFields
  const mode = tf.studio_mode ?? 'multi'

  const disciplineList = mode === 'multi' ? lines(tf.disciplines) : []
  const disciplineLabel =
    mode === 'single' ? tf.primary_discipline || 'Design' : 'Architecture & Design'

  // ── Stats ribbon ──────────────────────────────────────────────
  const stats: { label: string; value: string }[] = []
  if (mode === 'single' && tf.primary_discipline) {
    stats.push({ label: 'Discipline', value: tf.primary_discipline })
  } else if (disciplineList.length > 0) {
    stats.push({ label: 'Disciplines', value: String(disciplineList.length) })
  }
  if (tf.established) stats.push({ label: 'Established', value: String(tf.established) })
  if (tf.project_types) stats.push({ label: 'Projects', value: tf.project_types })
  if (tf.works_in) stats.push({ label: 'Works in', value: tf.works_in })
  if (fiche.show_price && fiche.price_display) stats.push({ label: 'From', value: fiche.price_display })

  // ── Description splitting ─────────────────────────────────────
  const paragraphs = (fiche.description || '').split('\n\n').filter(Boolean)
  const splitParagraph1 = paragraphs[0] || ''
  const splitParagraph2 = paragraphs[1] || ''

  // ── Image allocation ──────────────────────────────────────────
  const statementImage = galleryUrls[0] || null
  const splitImage1 = galleryUrls[1] || null
  const splitImage2 = galleryUrls[2] || null
  const projectImagesStart = 3

  // ── Signature projects → editorial cards ──────────────────────
  const projectLines = lines(tf.signature_projects)
  const projectCards = projectLines
    .map((line, i) => {
      const { name: pName, place } = splitProject(line)
      return {
        imageUrl: galleryUrls[projectImagesStart + i] || galleryUrls[i % Math.max(galleryUrls.length, 1)] || '',
        heading: pName,
        description: place || undefined,
      }
    })
    .filter((c) => c.imageUrl)

  // Remaining images become the gallery (after hero allocations + project cards)
  const usedThroughProjects = projectImagesStart + projectCards.length
  const galleryImages = galleryUrls.slice(Math.min(usedThroughProjects, galleryUrls.length))

  return (
    <>
      {/* 1. Cinematic Hero */}
      <FicheHero
        name={name}
        category={org?.category || ''}
        categorySub={disciplineLabel}
        location={location}
        heroImageUrl={fiche.hero_image_url}
        variant="cinematic"
      />

      {/* 2. Stats Ribbon */}
      {stats.length > 0 && <FicheStatsRibbon stats={stats} />}

      {/* 3. Studio ethos statement */}
      {fiche.headline && (
        <ScrollReveal>
          <FicheStatement
            statement={fiche.headline}
            backgroundImageUrl={statementImage}
            variant={statementImage ? 'image' : 'dark'}
          />
        </ScrollReveal>
      )}

      {/* 4. Disciplines (multi-discipline studios) */}
      {mode === 'multi' && disciplineList.length > 0 && (
        <ScrollReveal>
          <section className="py-14 md:py-16 px-8 md:px-12 lg:px-16 bg-pearl">
            <div className="max-w-4xl mx-auto text-center">
              <p className="text-[11px] font-body text-gold uppercase tracking-[0.2em] mb-8">
                Disciplines
              </p>
              <div className="flex flex-wrap justify-center items-center gap-x-10 gap-y-5">
                {disciplineList.map((d, i) => (
                  <span
                    key={i}
                    className="font-display text-2xl md:text-3xl text-green"
                  >
                    {d}
                  </span>
                ))}
              </div>
              {tf.principals && (
                <p className="mt-10 text-sm font-body text-gray-500">
                  Led by {tf.principals}
                </p>
              )}
            </div>
          </section>
        </ScrollReveal>
      )}

      {/* 5. The Practice — paragraph 1 */}
      {splitParagraph1 && splitImage1 ? (
        <ScrollReveal>
          <FicheSplitSection
            imageUrl={splitImage1}
            imageAlt={`${name} — The Practice`}
            label="The Practice"
            content={splitParagraph1}
            imagePosition="right"
          />
        </ScrollReveal>
      ) : splitParagraph1 ? (
        <ScrollReveal>
          <div className="py-10 px-8 md:px-12 lg:px-16">
            <div className="max-w-3xl mx-auto">
              <div className="prose prose-lg font-body text-gray-700 leading-relaxed whitespace-pre-line max-w-[65ch]">
                {splitParagraph1}
              </div>
            </div>
          </div>
        </ScrollReveal>
      ) : null}

      {/* 6. The Approach — paragraph 2 or the approach field */}
      {splitParagraph2 && splitImage2 ? (
        <ScrollReveal>
          <FicheSplitSection
            imageUrl={splitImage2}
            imageAlt={`${name} — The Approach`}
            label="The Approach"
            content={splitParagraph2}
            imagePosition="left"
          />
        </ScrollReveal>
      ) : tf.approach ? (
        <ScrollReveal>
          <div className="py-10 px-8 md:px-12 lg:px-16">
            <div className="max-w-3xl mx-auto text-center">
              <p className="text-[11px] font-body text-gold uppercase tracking-[0.2em] mb-4">
                The Approach
              </p>
              <p className="font-body text-lg text-gray-700 leading-relaxed whitespace-pre-line">
                {tf.approach}
              </p>
            </div>
          </div>
        </ScrollReveal>
      ) : null}

      {/* 7. Signature projects */}
      {projectCards.length > 0 && (
        <ScrollReveal>
          <FicheHighlightsEditorial cards={projectCards} />
        </ScrollReveal>
      )}

      {/* 8. Gallery */}
      {galleryImages.length > 0 && <FicheGallery images={galleryImages} name={name} />}

      {/* 9. Pull quote */}
      {tf.pull_quote && (
        <ScrollReveal>
          <section className="relative w-full py-20 md:py-28 bg-green overflow-hidden">
            <div className="max-w-4xl mx-auto px-8 md:px-12 text-center">
              <p className="font-display italic text-2xl md:text-3xl lg:text-4xl text-gold leading-relaxed">
                &ldquo;{tf.pull_quote}&rdquo;
              </p>
              {tf.pull_quote_attribution && (
                <p className="mt-6 text-sm font-body uppercase tracking-[0.15em] text-white/70">
                  {tf.pull_quote_attribution}
                </p>
              )}
            </div>
          </section>
        </ScrollReveal>
      )}

      {/* 10. Tags */}
      <FicheTags tags={tags} />

      {/* 11. CTA */}
      <FicheContact name={name} variant="editorial" />
    </>
  )
}
