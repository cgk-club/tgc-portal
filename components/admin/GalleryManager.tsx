'use client'

import { useState, useRef } from 'react'

interface GalleryManagerProps {
  images: string[]
  onChange: (images: string[]) => void
}

export default function GalleryManager({ images, onChange }: GalleryManagerProps) {
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function uploadFiles(files: FileList) {
    setUploading(true)
    const newUrls: string[] = []

    for (const file of Array.from(files)) {
      if (!file.type.startsWith('image/')) continue
      const formData = new FormData()
      formData.append('file', file)

      try {
        const res = await fetch('/api/admin/upload', {
          method: 'POST',
          body: formData,
        })
        if (res.ok) {
          const { url } = await res.json()
          newUrls.push(url)
        }
      } catch (err) {
        console.error('Upload failed:', err)
      }
    }

    onChange([...images, ...newUrls])
    setUploading(false)
  }

  function removeImage(index: number) {
    onChange(images.filter((_, i) => i !== index))
  }

  function moveImage(from: number, to: number) {
    if (to < 0 || to >= images.length) return
    const updated = [...images]
    const [moved] = updated.splice(from, 1)
    updated.splice(to, 0, moved)
    onChange(updated)
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Gallery</label>

      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-2 mb-3">
          {images.map((url, i) => (
            <div key={i} className="relative group">
              <img
                src={url}
                alt={`Gallery ${i + 1}`}
                className="w-full aspect-square object-cover rounded-[4px]"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-[4px] flex items-center justify-center gap-1">
                {i > 0 && (
                  <button
                    type="button"
                    onClick={() => moveImage(i, i - 1)}
                    className="text-white bg-black/50 rounded px-1.5 py-0.5 text-xs hover:bg-black/70"
                  >
                    &#8249;
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="text-white bg-red-500/80 rounded px-1.5 py-0.5 text-xs hover:bg-red-600"
                >
                  &times;
                </button>
                {i < images.length - 1 && (
                  <button
                    type="button"
                    onClick={() => moveImage(i, i + 1)}
                    className="text-white bg-black/50 rounded px-1.5 py-0.5 text-xs hover:bg-black/70"
                  >
                    &#8250;
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        className="w-full border-2 border-dashed border-gray-300 rounded-[4px] p-3 text-sm text-gray-500 hover:border-green hover:text-green transition-colors disabled:opacity-50"
      >
        {uploading ? 'Uploading...' : '+ Add images'}
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={(e) => e.target.files && uploadFiles(e.target.files)}
        className="hidden"
      />
    </div>
  )
}
