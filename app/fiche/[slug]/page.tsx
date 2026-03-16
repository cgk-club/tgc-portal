import { notFound } from 'next/navigation'
import { getSupabaseAdmin } from '@/lib/supabase'
import { getOrgById } from '@/lib/airtable'
import { Fiche, Highlight } from '@/types'
import FicheHero from '@/components/fiche/FicheHero'
import FicheHighlights from '@/components/fiche/FicheHighlights'
import FicheGallery from '@/components/fiche/FicheGallery'
import FicheTags from '@/components/fiche/FicheTags'
import FicheContact from '@/components/fiche/FicheContact'

interface PageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ preview?: string }>
}

export default async function FichePage({ params, searchParams }: PageProps) {
  const { slug } = await params
  const { preview } = await searchParams

  const { data: fiche } = await getSupabaseAdmin()
    .from('fiches')
    .select('*')
    .eq('slug', slug)
    .single()

  if (!fiche) {
    notFound()
  }

  const ficheData = fiche as Fiche

  if (ficheData.status !== 'live' && preview !== 'true') {
    notFound()
  }

  const org = await getOrgById(ficheData.airtable_record_id)
  const name = org?.name || 'Unnamed'
  const category = org?.category || ''
  const locationParts = [org?.city, org?.country].filter(Boolean)
  const location = locationParts.join(', ')

  const highlights: Highlight[] = Array.isArray(ficheData.highlights) ? ficheData.highlights : []
  const galleryUrls: string[] = Array.isArray(ficheData.gallery_urls) ? ficheData.gallery_urls : []
  const tags: string[] = Array.isArray(ficheData.tags) ? ficheData.tags : []

  return (
    <div className="min-h-screen bg-pearl">
      {/* Header */}
      <header className="absolute top-0 left-0 z-10 p-6">
        <span className="font-heading text-sm font-semibold tracking-wider text-gold">
          THE GATEKEEPERS CLUB
        </span>
      </header>

      <FicheHero
        name={name}
        headline={ficheData.headline}
        category={category}
        location={location}
        heroImageUrl={ficheData.hero_image_url}
      />

      <FicheHighlights highlights={highlights} />

      {ficheData.description && (
        <div className="py-10 px-8 md:px-12 lg:px-16">
          <div className="max-w-3xl mx-auto">
            <div className="prose prose-lg font-body text-gray-700 leading-relaxed whitespace-pre-line max-w-[65ch]">
              {ficheData.description}
            </div>
          </div>
        </div>
      )}

      <FicheGallery images={galleryUrls} name={name} />

      <FicheTags tags={tags} />

      <FicheContact name={name} />

      {/* Footer */}
      <footer className="py-8 px-8 text-center border-t border-gray-200">
        <span className="font-heading text-sm font-semibold tracking-wider text-gold">
          THE GATEKEEPERS CLUB
        </span>
        <p className="text-xs text-gray-400 mt-2 font-body">
          Curated travel, crafted personally
        </p>
        <p className="text-xs text-gray-400 mt-1 font-body">
          &copy; {new Date().getFullYear()} The Gatekeepers Club
        </p>
      </footer>
    </div>
  )
}
