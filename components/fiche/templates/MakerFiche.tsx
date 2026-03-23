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
      {/* Hero */}
      {fiche.hero_image_url && (
        <div className="relative w-full h-[60vh] min-h-[400px]">
          <img
            src={fiche.hero_image_url}
            alt={name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 lg:p-16">
            {discipline && (
              <Badge className="mb-3 bg-white/20 text-white border-0 backdrop-blur-sm">
                {discipline}
              </Badge>
            )}
            <h1 className="font-heading text-3xl md:text-4xl font-semibold text-white mb-2">{name}</h1>
            {basedIn && <p className="text-white/80 font-body text-sm">{basedIn}</p>}
          </div>
        </div>
      )}

      {/* Headline */}
      {fiche.headline && (
        <div className="py-10 px-8 md:px-12 lg:px-16">
          <div className="max-w-3xl mx-auto">
            <p className="font-heading text-xl text-green font-medium leading-relaxed">{fiche.headline}</p>
          </div>
        </div>
      )}

      {/* Intro paragraph */}
      {intro && (
        <div className="px-8 md:px-12 lg:px-16 pb-8">
          <div className="max-w-3xl mx-auto">
            <p className="font-body text-lg text-gray-700 leading-relaxed">{intro}</p>
          </div>
        </div>
      )}

      {/* Documentary image grid */}
      {firstImage && (
        <div className="px-8 md:px-12 lg:px-16 pb-8">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="md:col-span-2">
                <img
                  src={firstImage}
                  alt={`${name} 1`}
                  className="w-full h-[400px] object-cover rounded-[8px] cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => setLightboxIndex(0)}
                />
              </div>
              <div className="flex flex-col gap-3">
                {gridImages.map((url, i) => (
                  <img
                    key={i}
                    src={url}
                    alt={`${name} ${i + 2}`}
                    className="w-full h-[126px] object-cover rounded-[8px] cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => setLightboxIndex(i + 1)}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Body text */}
      {bodyParagraphs.length > 0 && (
        <div className="py-8 px-8 md:px-12 lg:px-16">
          <div className="max-w-3xl mx-auto prose prose-lg font-body text-gray-700 leading-relaxed">
            {bodyParagraphs.map((p, i) => (
              <p key={i} className="mb-4">{p}</p>
            ))}
          </div>
        </div>
      )}

      {/* Remaining images */}
      {remainingImages.length > 0 && (
        <div className="px-8 md:px-12 lg:px-16 pb-10">
          <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-3 gap-3">
            {remainingImages.map((url, i) => (
              <img
                key={i}
                src={url}
                alt={`${name} ${i + 5}`}
                className="w-full h-[200px] object-cover rounded-[8px] cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => setLightboxIndex(i + 4)}
              />
            ))}
          </div>
        </div>
      )}

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
