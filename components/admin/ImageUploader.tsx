'use client'

import { useState, useRef } from 'react'

interface ImageUploaderProps {
  onUpload: (url: string) => void
  currentUrl?: string | null
  label?: string
}

export default function ImageUploader({ onUpload, currentUrl, label = 'Upload Image' }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function uploadFile(file: File) {
    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      })

      if (res.ok) {
        const { url } = await res.json()
        onUpload(url)
      }
    } catch (err) {
      console.error('Upload failed:', err)
    } finally {
      setUploading(false)
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) {
      uploadFile(file)
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      uploadFile(file)
    }
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`
          relative border-2 border-dashed rounded-[8px] p-4 text-center cursor-pointer transition-colors
          ${dragOver ? 'border-green bg-green-muted' : 'border-gray-300 hover:border-green'}
          ${uploading ? 'opacity-50 pointer-events-none' : ''}
        `}
      >
        {currentUrl ? (
          <img
            src={currentUrl}
            alt="Current"
            className="w-full h-40 object-cover rounded-[4px] mb-2"
          />
        ) : (
          <div className="py-6">
            <p className="text-sm text-gray-500 font-body">
              {uploading ? 'Uploading...' : 'Drag and drop an image, or click to browse'}
            </p>
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
    </div>
  )
}
