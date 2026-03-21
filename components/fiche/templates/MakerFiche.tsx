'use client'

import { useState } from 'react'
import { Fiche } from '@/types'
import { AirtableOrg } from '@/types'
import { MakerFields } from '@/lib/ficheTemplates'
import Badge from '@/components/ui/Badge'
import FicheContact from '@/components/fiche/FicheContact'

interface Props {
  fiche: Fiche
  org: AirtableOrg | null
  name: string
  location: string
  galleryUrls: string[]
}

const COMMISSION_LABELS: Record<string, string> = {
  'open': 'Open',
  'closed': 'Closed',
  'on-request': 'On request',
}

export default function MakerFiche({
  fiche,
  org,
  name,
  location,
  galleryUrls,
}: Props) {
  const tf = (fiche.template_fields || {}) as MakerFields
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  const discipline = tf.discipline || org?.categorySub || ''
  const basedIn = tf.based_in || location

  // Split description into intro (first paragraph) and body (rest)
  const paragraphs = (fiche.description || '').split('\n\n').filter(Boolean)
  const intro = paragraphs[0] || ''
  const bodyParagraphs = paragraphs.slice(1)

  // Split gallery for documentary layout
  const firstImage = galleryUrls[0]
  const gridImages = galleryUrls.slice(1, 4)
  const remainingImages = galleryUrls.slice(4)

  const mailtoSubject = encodeURIComponent(`Commission enquiry: ${name}`)

  return (
    <>
      <FicheContact name={name} />

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightboxIndex(null)}
        >
          <button
            className="absolute top-4 right-4 text-white text-3xl hover:text-gold"
            onClick={() => setLightboxIndex(null)}
          >
            &times;
          </button>
          {lightboxIndex > 0 && (
            <button
              className="absolute left-4 text-white text-3xl hover:text-gold"
              onClick={(e) => { e.stopPropagation(); setLightboxIndex(lightboxIndex - 1) }}
            >
              &#8249;
            </button>
          )}
          {lightboxIndex < galleryUrls.length - 1 && (
            <button
              className="absolute right-4 text-white text-3xl hover:text-gold z-10"
              onClick={(e) => { e.stopPropagation(); setLightboxIndex(lightboxIndex + 1) }}
            >
              &#8250;
            </button>
          )}
          <img
            src={galleryUrls[lightboxIndex]}
            alt={`${name} ${lightboxIndex + 1}`}
            className="max-h-[90vh] max-w-[90vw] object-contain rounded-[8px]"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  )
}
