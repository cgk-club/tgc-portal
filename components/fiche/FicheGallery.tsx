'use client'

import { useState } from 'react'

interface FicheGalleryProps {
  images: string[]
  name: string
}

export default function FicheGallery({ images, name }: FicheGalleryProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  if (!images.length) return null

  const imgButton = (url: string, idx: number, aspect: string) => (
    <button
      key={idx}
      onClick={() => setLightboxIndex(idx)}
      className={`relative ${aspect} overflow-hidden rounded-[8px] group cursor-pointer ring-0 hover:ring-2 hover:ring-gold/40 transition-all`}
    >
      <img
        src={url}
        alt={`${name} ${idx + 1}`}
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
      />
    </button>
  )

  return (
    <>
      <div className="py-16 md:py-20 px-8 md:px-12 lg:px-16">
        <div className="max-w-6xl mx-auto space-y-4">
          {/* Row 1: Full-width hero image */}
          {images[0] && imgButton(images[0], 0, 'w-full aspect-[16/9]')}

          {/* Row 2: Two side-by-side */}
          {images.length >= 2 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {images.slice(1, 3).map((url, i) => imgButton(url, i + 1, 'aspect-[3/2]'))}
            </div>
          )}

          {/* Row 3: Asymmetric — 1 tall + 2 stacked */}
          {images.length >= 4 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {imgButton(images[3], 3, 'aspect-[3/4]')}
              {images.length >= 5 && (
                <div className="grid grid-rows-2 gap-4">
                  {images.slice(4, 6).map((url, i) => imgButton(url, i + 4, 'aspect-[3/2]'))}
                </div>
              )}
            </div>
          )}

          {/* Remaining: 3-col grid */}
          {images.length > 6 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {images.slice(6).map((url, i) => imgButton(url, i + 6, 'aspect-[4/3]'))}
            </div>
          )}
        </div>
      </div>

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
          {lightboxIndex < images.length - 1 && (
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
          <img
            src={images[lightboxIndex]}
            alt={`${name} ${lightboxIndex + 1}`}
            className="max-h-[90vh] max-w-[90vw] object-contain rounded-[8px]"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  )
}
