'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { FicheWithOrg, Highlight } from '@/types'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Textarea from '@/components/ui/Textarea'
import ImageUploader from '@/components/admin/ImageUploader'
import GalleryManager from '@/components/admin/GalleryManager'
import OutreachModal from '@/components/admin/OutreachModal'

interface FicheEditorProps {
  fiche: FicheWithOrg
}

export default function FicheEditor({ fiche: initial }: FicheEditorProps) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const [heroImageUrl, setHeroImageUrl] = useState(initial.hero_image_url || '')
  const [headline, setHeadline] = useState(initial.headline || '')
  const [description, setDescription] = useState(initial.description || '')
  const [highlights, setHighlights] = useState<Highlight[]>(
    Array.isArray(initial.highlights) ? initial.highlights : []
  )
  const [galleryUrls, setGalleryUrls] = useState<string[]>(
    Array.isArray(initial.gallery_urls) ? initial.gallery_urls : []
  )
  const [tags, setTags] = useState<string[]>(
    Array.isArray(initial.tags) ? initial.tags : []
  )
  const [tagInput, setTagInput] = useState('')
  const [tgcNote, setTgcNote] = useState(initial.tgc_note || '')
  const [status, setStatus] = useState(initial.status)
  const [featured, setFeatured] = useState(initial.featured)
  const [slug, setSlug] = useState(initial.slug)
  const [showOutreach, setShowOutreach] = useState(false)
  const [lastContacted, setLastContacted] = useState<string | null>(null)

  useEffect(() => {
    fetch(`/api/admin/outreach/${initial.id}`)
      .then(r => r.ok ? r.json() : [])
      .then(data => {
        if (data.length > 0) setLastContacted(data[0].sent_at)
      })
      .catch(() => {})
  }, [initial.id])

  function addHighlight() {
    setHighlights([...highlights, { icon: '', label: '', value: '' }])
  }

  function updateHighlight(index: number, field: keyof Highlight, value: string) {
    const updated = [...highlights]
    updated[index] = { ...updated[index], [field]: value }
    setHighlights(updated)
  }

  function removeHighlight(index: number) {
    setHighlights(highlights.filter((_, i) => i !== index))
  }

  function addTag() {
    const tag = tagInput.trim()
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag])
      setTagInput('')
    }
  }

  function removeTag(tag: string) {
    setTags(tags.filter((t) => t !== tag))
  }

  async function handleSave() {
    setSaving(true)
    setSaved(false)

    const res = await fetch(`/api/admin/fiches/${initial.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        hero_image_url: heroImageUrl || null,
        headline: headline || null,
        description: description || null,
        highlights,
        gallery_urls: galleryUrls,
        tags,
        tgc_note: tgcNote || null,
        status,
        featured,
        slug,
      }),
    })

    if (res.ok) {
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    }

    setSaving(false)
  }

  const org = initial.org
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || ''
  const publicUrl = `${appUrl}/fiche/${slug}`

  return (
    <div className="flex gap-8">
      {/* Left Column */}
      <div className="flex-1 space-y-6">
        <ImageUploader
          label="Hero Image"
          currentUrl={heroImageUrl || null}
          onUpload={(url) => setHeroImageUrl(url)}
        />

        <Input
          id="headline"
          label="Headline"
          placeholder="A short, compelling one-liner"
          value={headline}
          onChange={(e) => setHeadline(e.target.value)}
        />

        <Textarea
          id="description"
          label="Description"
          placeholder="2-4 paragraphs describing this supplier in the TGC voice"
          rows={8}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        {/* Highlights */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Highlights</label>
          {highlights.map((h, i) => (
            <div key={i} className="flex gap-2 mb-2">
              <input
                placeholder="Icon"
                value={h.icon}
                onChange={(e) => updateHighlight(i, 'icon', e.target.value)}
                className="w-16 rounded-[4px] border border-gray-300 px-2 py-1.5 text-sm text-center"
              />
              <input
                placeholder="Label"
                value={h.label}
                onChange={(e) => updateHighlight(i, 'label', e.target.value)}
                className="flex-1 rounded-[4px] border border-gray-300 px-2 py-1.5 text-sm"
              />
              <input
                placeholder="Value"
                value={h.value}
                onChange={(e) => updateHighlight(i, 'value', e.target.value)}
                className="flex-1 rounded-[4px] border border-gray-300 px-2 py-1.5 text-sm"
              />
              <button
                type="button"
                onClick={() => removeHighlight(i)}
                className="text-red-400 hover:text-red-600 px-2"
              >
                &times;
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addHighlight}
            className="text-sm text-green hover:text-green-light font-medium"
          >
            + Add highlight
          </button>
        </div>

        <GalleryManager images={galleryUrls} onChange={setGalleryUrls} />
      </div>

      {/* Right Column */}
      <div className="w-80 space-y-6">
        {/* Airtable Source Data */}
        {org && (
          <div className="bg-white rounded-[8px] border border-gray-200 p-4">
            <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
              Airtable Source
            </h3>
            <dl className="space-y-2 text-sm">
              <div>
                <dt className="text-gray-400">Name</dt>
                <dd className="text-gray-900 font-medium">{org.name}</dd>
              </div>
              {(org.categorySub || org.category) && (
                <div>
                  <dt className="text-gray-400">Category</dt>
                  <dd className="text-gray-900">{org.categorySub || org.category}</dd>
                </div>
              )}
              {(org.city || org.country) && (
                <div>
                  <dt className="text-gray-400">Location</dt>
                  <dd className="text-gray-900">
                    {[org.city, org.region, org.country].filter(Boolean).join(', ')}
                  </dd>
                </div>
              )}
              {org.website && (
                <div>
                  <dt className="text-gray-400">Website</dt>
                  <dd>
                    <a
                      href={org.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green hover:text-green-light"
                    >
                      {org.website}
                    </a>
                  </dd>
                </div>
              )}
              {org.phone && (
                <div>
                  <dt className="text-gray-400">Phone</dt>
                  <dd className="text-gray-900">{org.phone}</dd>
                </div>
              )}
            </dl>
          </div>
        )}

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
          <div className="flex flex-wrap gap-1 mb-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 rounded-full bg-gold-light px-2.5 py-0.5 text-xs font-medium text-yellow-800"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="hover:text-red-600"
                >
                  &times;
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-1">
            <input
              placeholder="Add a tag"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              className="flex-1 rounded-[4px] border border-gray-300 px-2 py-1.5 text-sm"
            />
            <Button size="sm" onClick={addTag}>Add</Button>
          </div>
        </div>

        {/* TGC Note */}
        <Textarea
          id="tgc_note"
          label="TGC Note (internal)"
          placeholder="Internal notes, never shown publicly"
          rows={3}
          value={tgcNote}
          onChange={(e) => setTgcNote(e.target.value)}
        />

        {/* Supplier Outreach */}
        <div className="bg-white rounded-[8px] border border-gray-200 p-4">
          <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
            Supplier Outreach
          </h3>
          <Button
            variant="ghost"
            size="sm"
            className="w-full mb-2"
            onClick={() => setShowOutreach(true)}
          >
            Draft outreach email
          </Button>
          <p className="text-xs text-gray-400 font-body">
            Last contacted: {lastContacted
              ? new Date(lastContacted).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
              : 'Never'}
          </p>
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as 'draft' | 'live' | 'archived')}
            className="w-full rounded-[4px] border border-gray-300 px-3 py-2 text-sm focus:border-green focus:outline-none focus:ring-1 focus:ring-green"
          >
            <option value="draft">Draft</option>
            <option value="live">Live</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        {/* Featured */}
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={featured}
            onChange={(e) => setFeatured(e.target.checked)}
            className="rounded border-gray-300 text-green focus:ring-green"
          />
          <span className="text-sm text-gray-700">Featured</span>
        </label>

        {/* Slug */}
        <Input
          id="slug"
          label="Slug"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
        />

        {/* Actions */}
        <div className="space-y-2">
          <a
            href={status === 'live' ? `/fiche/${slug}` : `/fiche/${slug}?preview=true`}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full text-center rounded-[4px] border border-green text-green px-4 py-2 text-sm font-medium hover:bg-green-muted transition-colors"
          >
            Preview fiche
          </a>
          <button
            type="button"
            onClick={() => {
              navigator.clipboard.writeText(publicUrl)
            }}
            className="block w-full text-center rounded-[4px] border border-gray-300 text-gray-600 px-4 py-2 text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            Copy link
          </button>
        </div>

        {/* Save */}
        <div className="sticky bottom-4">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="w-full"
            size="lg"
          >
            {saving ? 'Saving...' : saved ? 'Saved' : 'Save changes'}
          </Button>
        </div>
      </div>

      {showOutreach && org && (
        <OutreachModal
          ficheId={initial.id}
          airtableRecordId={initial.airtable_record_id}
          supplierName={org.name}
          supplierEmail={org.email}
          ficheSlug={slug}
          onClose={() => setShowOutreach(false)}
          onSent={() => setLastContacted(new Date().toISOString())}
        />
      )}
    </div>
  )
}
