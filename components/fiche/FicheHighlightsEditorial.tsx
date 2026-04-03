'use client'

import { useState } from 'react'

interface HighlightCard {
  imageUrl: string
  heading: string
  description?: string
}

interface FicheHighlightsEditorialProps {
  cards: HighlightCard[]
  stats?: { label: string; value: string }[]
}

export default function FicheHighlightsEditorial({
  cards,
  stats,
}: FicheHighlightsEditorialProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  if (!cards.length) return null

  return (
    <>
      <section className="bg-green py-16 md:py-20 px-8 md:px-12 lg:px-16">
        <div className="max-w-6xl mx-auto">
          {/* Image cards grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {cards.map((card, i) => (
              <button
                key={i}
                onClick={() => setLightboxIndex(i)}
                className="relative aspect-[4/3] rounded-[8px] overflow-hidden group cursor-pointer text-left"
              >
                <img
                  src={card.imageUrl}
                  alt={card.heading}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <h3 className="font-display text-lg text-gold font-semibold mb-1">
                    {card.heading}
                  </h3>
                  {card.description && (
                    <p className="text-white/70 text-sm font-body leading-snug">
                      {card.description}
                    </p>
                  )}
                </div>
                {/* View indicator */}
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="bg-white/20 backdrop-blur-sm rounded-full p-2">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                    </svg>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Optional stats within dark section */}
          {stats && stats.length > 0 && (
            <div className="mt-12 pt-8 border-t border-gold/20">
              <dl className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                  <div key={i} className="text-center">
                    <dt className="text-[11px] font-body text-white/40 uppercase tracking-widest mb-1">
                      {stat.label}
                    </dt>
                    <dd className="text-base font-body font-semibold text-gold">
                      {stat.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </div>
      </section>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setLightboxIndex(null)}
        >
          <button
            className="absolute top-4 right-4 text-white text-3xl hover:text-gold z-10"
            onClick={() => setLightboxIndex(null)}
          >
            &times;
          </button>

          {lightboxIndex > 0 && (
            <button
              className="absolute left-4 text-white text-3xl hover:text-gold z-10"
              onClick={(e) => {
                e.stopPropagation()
                setLightboxIndex(lightboxIndex - 1)
              }}
            >
              &#8249;
            </button>
          )}

          {lightboxIndex < cards.length - 1 && (
            <button
              className="absolute right-4 text-white text-3xl hover:text-gold z-10"
              onClick={(e) => {
                e.stopPropagation()
                setLightboxIndex(lightboxIndex + 1)
              }}
            >
              &#8250;
            </button>
          )}

          <div className="flex flex-col items-center max-w-5xl" onClick={(e) => e.stopPropagation()}>
            <img
              src={cards[lightboxIndex].imageUrl}
              alt={cards[lightboxIndex].heading}
              className="max-h-[75vh] max-w-full object-contain rounded-[8px]"
            />
            <div className="mt-6 text-center">
              <h3 className="font-display text-xl text-gold font-semibold">
                {cards[lightboxIndex].heading}
              </h3>
              {cards[lightboxIndex].description && (
                <p className="text-white/60 text-sm font-body mt-2 max-w-lg">
                  {cards[lightboxIndex].description}
                </p>
              )}
              <p className="text-white/30 text-xs font-body mt-4">
                {lightboxIndex + 1} of {cards.length}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
