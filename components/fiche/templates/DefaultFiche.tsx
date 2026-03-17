import { Fiche, Highlight } from '@/types'
import { AirtableOrg } from '@/types'
import FicheHero from '@/components/fiche/FicheHero'
import FicheHighlights from '@/components/fiche/FicheHighlights'
import FicheGallery from '@/components/fiche/FicheGallery'
import FicheTags from '@/components/fiche/FicheTags'
import FicheContact from '@/components/fiche/FicheContact'

interface Props {
  fiche: Fiche
  org: AirtableOrg | null
  name: string
  location: string
  highlights: Highlight[]
  galleryUrls: string[]
  tags: string[]
  mapSlot?: React.ReactNode
}

export default function DefaultFiche({
  fiche,
  org,
  name,
  location,
  highlights,
  galleryUrls,
  tags,
  mapSlot,
}: Props) {
  return (
    <>
      <FicheHero
        name={name}
        headline={fiche.headline}
        category={org?.category || ''}
        categorySub={org?.categorySub || ''}
        location={location}
        heroImageUrl={fiche.hero_image_url}
      />

      <FicheHighlights highlights={highlights} />

      {mapSlot}

      {fiche.description && (
        <div className="py-10 px-8 md:px-12 lg:px-16">
          <div className="max-w-3xl mx-auto">
            <div className="prose prose-lg font-body text-gray-700 leading-relaxed whitespace-pre-line max-w-[65ch]">
              {fiche.description}
            </div>
          </div>
        </div>
      )}

      <FicheGallery images={galleryUrls} name={name} />

      <FicheTags tags={tags} />

      <FicheContact name={name} />
    </>
  )
}
