'use client'

import { useState } from 'react'

interface FicheGalleryProps {
  images: string[]
  name: string
}

export default function FicheGallery({ images, name }: FicheGalleryProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  if (!images.length) return null

  return (
    <>
      <div className="py-10 px-8 md:px-12 lg:px-16">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-heading text-2xl font-semibold text-green mb-6">Gallery</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {images.map((url, i) => (
              <button
                key={i}
                onClick={() => setLightboxIndex(i)}
                className="relative aspect-[4/3] overflow-hidden rounded-[8px] group cursor-pointer"
              >
                <img
                  src={url}
                  alt={`${name} gallery ${i + 1}`}
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                />
              </button>
            ))}
          </div>
        </div>
      </div>

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
            alt={`${name} gallery ${lightboxIndex + 1}`}
            className="max-h-[90vh] max-w-[90vw] object-contain rounded-[8px]"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  )
}
