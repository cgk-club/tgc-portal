'use client'

import MakerFiche from '@/components/fiche/templates/MakerFiche'
import { Fiche, AirtableOrg } from '@/types'

interface Props {
  fiche: Fiche
  org: AirtableOrg | null
  name: string
  location: string
  galleryUrls: string[]
}

export default function ClientMakerFiche(props: Props) {
  return <MakerFiche {...props} />
}
