'use client'

import { useState } from 'react'
import { Fiche } from '@/types'
import { AirtableOrg } from '@/types'
import { MakerFields } from '@/lib/ficheTemplates'
import Badge from '@/components/ui/Badge'

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
      {/* Hero - full bleed, work-focused */}
      <div className="relative w-full h-[70vh] min-h-[400px] overflow-hidden">
        {fiche.hero_image_url ? (
          <img
            src={fiche.hero_image_url}
            alt={name}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-green" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {/* Discipline pill top-left */}
        {discipline && (
          <div className="absolute top-6 left-6 sm:top-8 sm:left-8">
            <Badge variant="gold" className="text-sm">{discipline}</Badge>
          </div>
        )}

        {/* Name bottom-left */}
        <div className="absolute bottom-8 left-8 md:bottom-12 md:left-12">
          <p className="text-white/70 font-body text-sm mb-2">{basedIn}</p>
          <h1 className="text-white font-heading text-3xl md:text-4xl lg:text-5xl font-bold">
            {name}
          </h1>
        </div>
      </div>

      {/* Intro row: portrait + text */}
      <div className="py-12 px-8 md:px-12 lg:px-16 bg-pearl">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-8 md:gap-12">
          {/* Portrait or placeholder */}
          <div className="md:w-[40%] flex-shrink-0">
            {tf.maker_portrait_url ? (
              <img
                src={tf.maker_portrait_url}
                alt={name}
                className="w-full aspect-[3/4] object-cover rounded-[8px]"
              />
            ) : (
              <div className="w-full aspect-[3/4] bg-green-muted rounded-[8px] flex items-center justify-center">
                <span className="text-gray-400 font-body text-sm">Portrait</span>
              </div>
            )}
            <div className="mt-4">
              <h2 className="font-heading text-xl font-semibold text-green">{name}</h2>
              {discipline && <p className="text-gold font-body mt-1">{discipline}</p>}
              <p className="text-gray-500 font-body text-sm mt-1">
                {[basedIn, tf.established ? `Est. ${tf.established}` : ''].filter(Boolean).join(' · ')}
              </p>
            </div>
          </div>

          {/* Intro text */}
          <div className="md:w-[60%]">
            {intro && (
              <div className="prose prose-lg font-body text-gray-700 leading-relaxed max-w-[65ch]">
                {intro}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Pull quote */}
      {tf.pull_quote && (
        <div className="py-12 px-8 md:px-12 lg:px-16 bg-white">
          <div className="max-w-3xl mx-auto text-center">
            <blockquote className="font-heading text-xl md:text-2xl text-green italic leading-relaxed">
              &ldquo;{tf.pull_quote}&rdquo;
            </blockquote>
            {tf.pull_quote_attribution && (
              <p className="text-gray-500 font-body text-sm mt-4">{tf.pull_quote_attribution}</p>
            )}
          </div>
        </div>
      )}

      {/* First gallery image - full width */}
      {firstImage && (
        <div className="px-0 md:px-8 lg:px-16">
          <div className="max-w-5xl mx-auto">
            <button
              onClick={() => setLightboxIndex(0)}
              className="w-full aspect-[16/9] overflow-hidden md:rounded-[8px] cursor-pointer"
            >
              <img
                src={firstImage}
                alt={`${name} work`}
                className="w-full h-full object-cover hover:scale-105 transition-transform"
              />
            </button>
          </div>
        </div>
      )}

      {/* Body text */}
      {bodyParagraphs.length > 0 && (
        <div className="py-10 px-8 md:px-12 lg:px-16">
          <div className="max-w-3xl mx-auto">
            <div className="prose prose-lg font-body text-gray-700 leading-relaxed max-w-[65ch]">
              {bodyParagraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 3-column grid */}
      {gridImages.length > 0 && (
        <div className="py-4 px-8 md:px-12 lg:px-16">
          <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-4">
            {gridImages.map((url, i) => (
              <button
                key={i}
                onClick={() => setLightboxIndex(i + 1)}
                className="aspect-square overflow-hidden rounded-[8px] cursor-pointer"
              >
                <img
                  src={url}
                  alt={`${name} ${i + 2}`}
                  className="w-full h-full object-cover hover:scale-105 transition-transform"
                />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* The Work section */}
      {(discipline || tf.materials || tf.commissions || tf.lead_time || (fiche.show_price && fiche.price_display)) && (
        <div className="py-10 px-8 md:px-12 lg:px-16 bg-green-muted">
          <div className="max-w-3xl mx-auto">
            <h3 className="font-heading text-lg font-semibold text-green mb-4">The Work</h3>
            <div className="flex flex-wrap gap-2 mb-4 text-sm font-body text-gray-700">
              {discipline && <span className="bg-white rounded-full px-3 py-1">{discipline}</span>}
              {tf.materials && <span className="bg-white rounded-full px-3 py-1">{tf.materials}</span>}
              {basedIn && <span className="bg-white rounded-full px-3 py-1">{basedIn}</span>}
            </div>
            <dl className="space-y-2 text-sm font-body">
              {tf.commissions && (
                <div className="flex justify-between">
                  <dt className="text-gray-400">Commissions</dt>
                  <dd className="text-gray-900 font-medium">{COMMISSION_LABELS[tf.commissions] || tf.commissions}</dd>
                </div>
              )}
              {tf.ships_internationally && (
                <div className="flex justify-between">
                  <dt className="text-gray-400">Ships internationally</dt>
                  <dd className="text-gray-900 font-medium">Yes</dd>
                </div>
              )}
              {tf.lead_time && (
                <div className="flex justify-between">
                  <dt className="text-gray-400">Lead time</dt>
                  <dd className="text-gray-900 font-medium">{tf.lead_time}</dd>
                </div>
              )}
              {fiche.show_price && fiche.price_display && (
                <div className="flex justify-between">
                  <dt className="text-gray-400">Price</dt>
                  <dd className="text-gray-900 font-medium">{fiche.price_display}</dd>
                </div>
              )}
            </dl>
          </div>
        </div>
      )}

      {/* Remaining gallery images - 2-column */}
      {remainingImages.length > 0 && (
        <div className="py-8 px-8 md:px-12 lg:px-16">
          <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-4">
            {remainingImages.map((url, i) => (
              <button
                key={i}
                onClick={() => setLightboxIndex(i + 4)}
                className="aspect-[4/3] overflow-hidden rounded-[8px] cursor-pointer"
              >
                <img
                  src={url}
                  alt={`${name} ${i + 5}`}
                  className="w-full h-full object-cover hover:scale-105 transition-transform"
                />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Enquire CTA */}
      <div className="py-12 px-8 md:px-12 lg:px-16 bg-white border-t border-gray-200">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="font-heading text-2xl font-semibold text-green mb-3">
            Commission or collaborate with {name}
          </h2>
          <p className="text-gray-600 font-body mb-6">
            Get in touch and we will make the introduction.
          </p>
          <a
            href={`mailto:hello@thegatekeepers.club?subject=${mailtoSubject}`}
            className="inline-flex items-center justify-center rounded-[4px] bg-green text-white px-8 py-3 font-body font-medium hover:bg-green-light transition-colors w-full sm:w-auto"
          >
            Get in touch
          </a>
        </div>
      </div>

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
