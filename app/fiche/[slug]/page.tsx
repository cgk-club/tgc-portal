export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import { getSupabaseAdmin } from '@/lib/supabase'
import { getOrgById } from '@/lib/airtable'
import { Fiche, Highlight } from '@/types'
import { getTemplate } from '@/lib/ficheTemplates'
import DefaultFiche from '@/components/fiche/templates/DefaultFiche'
import HospitalityFiche from '@/components/fiche/templates/HospitalityFiche'
import RealEstateFiche from '@/components/fiche/templates/RealEstateFiche'
import DiningFiche from '@/components/fiche/templates/DiningFiche'
import ExperienceFiche from '@/components/fiche/templates/ExperienceFiche'
import TransportFiche from '@/components/fiche/templates/TransportFiche'
import WineEstateFiche from '@/components/fiche/templates/WineEstateFiche'
import WellnessFiche from '@/components/fiche/templates/WellnessFiche'
import EventsSportFiche from '@/components/fiche/templates/EventsSportFiche'
import ArtsCultureFiche from '@/components/fiche/templates/ArtsCultureFiche'
import PersonalServicesFiche from '@/components/fiche/templates/PersonalServicesFiche'
import ClientMakerFiche from './ClientMakerFiche'

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
  const locationParts = [org?.city, org?.country].filter(Boolean)
  const location = locationParts.join(', ')

  // Auto-detect template if not set
  const templateType = ficheData.template_type || getTemplate(org?.categorySub)

  // Silent migration: set template_type if not yet stored
  if (!ficheData.template_type && templateType !== 'default') {
    await getSupabaseAdmin()
      .from('fiches')
      .update({ template_type: templateType })
      .eq('id', ficheData.id)
  }

  const highlights: Highlight[] = Array.isArray(ficheData.highlights) ? ficheData.highlights : []
  const galleryUrls: string[] = Array.isArray(ficheData.gallery_urls) ? ficheData.gallery_urls : []
  const tags: string[] = Array.isArray(ficheData.tags) ? ficheData.tags : []

  const commonProps = {
    fiche: ficheData,
    org,
    name,
    location,
    highlights,
    galleryUrls,
    tags,
  }

  return (
    <div className="min-h-screen bg-pearl">
      {/* Header */}
      <header className="absolute top-0 left-0 z-10 p-6">
        <span className="font-heading text-sm font-semibold tracking-wider text-gold">
          THE GATEKEEPERS CLUB
        </span>
      </header>

      {templateType === 'hospitality' && <HospitalityFiche {...commonProps} />}
      {templateType === 'real_estate' && <RealEstateFiche {...commonProps} />}
      {templateType === 'dining' && <DiningFiche {...commonProps} />}
      {templateType === 'maker' && (
        <ClientMakerFiche
          fiche={ficheData}
          org={org}
          name={name}
          location={location}
          galleryUrls={galleryUrls}
        />
      )}
      {templateType === 'experience' && <ExperienceFiche {...commonProps} />}
      {templateType === 'transport' && <TransportFiche {...commonProps} />}
      {templateType === 'wine_estate' && <WineEstateFiche {...commonProps} />}
      {templateType === 'wellness' && <WellnessFiche {...commonProps} />}
      {templateType === 'events_sport' && <EventsSportFiche {...commonProps} />}
      {templateType === 'arts_culture' && <ArtsCultureFiche {...commonProps} />}
      {templateType === 'personal_services' && <PersonalServicesFiche {...commonProps} />}
      {(templateType === 'default' || !['hospitality', 'real_estate', 'dining', 'maker', 'experience', 'transport', 'wine_estate', 'wellness', 'events_sport', 'arts_culture', 'personal_services'].includes(templateType)) && (
        <DefaultFiche {...commonProps} />
      )}

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
