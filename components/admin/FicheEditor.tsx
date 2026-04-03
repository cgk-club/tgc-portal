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
import TemplateFieldSelector from '@/components/admin/template-fields/TemplateFieldSelector'
import HospitalityFieldsEditor from '@/components/admin/template-fields/HospitalityFields'
import RealEstateFieldsEditor from '@/components/admin/template-fields/RealEstateFields'
import DiningFieldsEditor from '@/components/admin/template-fields/DiningFields'
import MakerFieldsEditor from '@/components/admin/template-fields/MakerFields'
import ExperienceFieldsEditor from '@/components/admin/template-fields/ExperienceFields'
import TransportFieldsEditor from '@/components/admin/template-fields/TransportFields'
import WineEstateFieldsEditor from '@/components/admin/template-fields/WineEstateFields'
import WellnessFieldsEditor from '@/components/admin/template-fields/WellnessFields'
import EventsSportFieldsEditor from '@/components/admin/template-fields/EventsSportFields'
import ArtsCultureFieldsEditor from '@/components/admin/template-fields/ArtsCultureFields'
import PersonalServicesFieldsEditor from '@/components/admin/template-fields/PersonalServicesFields'
import { FicheTemplate, getTemplate, TEMPLATE_LABELS } from '@/lib/ficheTemplates'

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
  const [templateType, setTemplateType] = useState<FicheTemplate>(
    (initial.template_type as FicheTemplate) || getTemplate(initial.org?.categorySub)
  )
  const [templateFields, setTemplateFields] = useState<Record<string, unknown>>(
    (initial.template_fields && typeof initial.template_fields === 'object') ? initial.template_fields : {}
  )
  const [showPrice, setShowPrice] = useState(initial.show_price ?? false)
  const [priceDisplay, setPriceDisplay] = useState(initial.price_display || '')
  const [showOutreach, setShowOutreach] = useState(false)
  const [showInvitePartner, setShowInvitePartner] = useState(false)
  const [inviteEmail, setInviteEmail] = useState(initial.org?.email || '')
  const [inviteTemplateType, setInviteTemplateType] = useState<FicheTemplate>(
    (initial.template_type as FicheTemplate) || 'default'
  )
  const [inviting, setInviting] = useState(false)
  const [inviteError, setInviteError] = useState<string | null>(null)
  const [inviteSuccess, setInviteSuccess] = useState(false)
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
        template_type: templateType,
        template_fields: templateFields,
        show_price: showPrice,
        price_display: priceDisplay || null,
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

  async function handleInvitePartner() {
    if (!inviteEmail) return
    setInviting(true)
    setInviteError(null)
    setInviteSuccess(false)

    try {
      const res = await fetch(`/api/admin/fiches/${initial.id}/invite-partner`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: inviteEmail,
          template_type: inviteTemplateType,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setInviteError(data.error || 'Failed to invite partner')
      } else {
        setInviteSuccess(true)
        setTimeout(() => {
          setShowInvitePartner(false)
          setInviteSuccess(false)
        }, 2000)
      }
    } catch {
      setInviteError('Network error. Please try again.')
    } finally {
      setInviting(false)
    }
  }

  const org = initial.org
  const appUrl = typeof window !== 'undefined' ? window.location.origin : (process.env.NEXT_PUBLIC_APP_URL || '')
  const publicUrl = `${appUrl}/fiche/${slug}`

  return (
    <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
      {/* Left Column */}
      <div className="flex-1 min-w-0 space-y-6">
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

        {/* Template Fields */}
        <div className="bg-white rounded-[8px] border border-gray-200 p-4 space-y-4">
          <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">
            Template Fields
          </h3>
          <TemplateFieldSelector value={templateType} onChange={setTemplateType} />
          {templateType === 'hospitality' && (
            <HospitalityFieldsEditor
              fields={templateFields as Record<string, unknown>}
              onChange={(f) => setTemplateFields(f as Record<string, unknown>)}
            />
          )}
          {templateType === 'real_estate' && (
            <RealEstateFieldsEditor
              fields={templateFields as Record<string, unknown>}
              onChange={(f) => setTemplateFields(f as Record<string, unknown>)}
            />
          )}
          {templateType === 'dining' && (
            <DiningFieldsEditor
              fields={templateFields as Record<string, unknown>}
              onChange={(f) => setTemplateFields(f as Record<string, unknown>)}
            />
          )}
          {templateType === 'maker' && (
            <MakerFieldsEditor
              fields={templateFields as Record<string, unknown>}
              onChange={(f) => setTemplateFields(f as Record<string, unknown>)}
            />
          )}
          {templateType === 'experience' && (
            <ExperienceFieldsEditor
              fields={templateFields as Record<string, unknown>}
              onChange={(f) => setTemplateFields(f as Record<string, unknown>)}
            />
          )}
          {templateType === 'transport' && (
            <TransportFieldsEditor
              fields={templateFields as Record<string, unknown>}
              onChange={(f) => setTemplateFields(f as Record<string, unknown>)}
            />
          )}
          {templateType === 'wine_estate' && (
            <WineEstateFieldsEditor
              fields={templateFields as Record<string, unknown>}
              onChange={(f) => setTemplateFields(f as Record<string, unknown>)}
            />
          )}
          {templateType === 'wellness' && (
            <WellnessFieldsEditor
              fields={templateFields as Record<string, unknown>}
              onChange={(f) => setTemplateFields(f as Record<string, unknown>)}
            />
          )}
          {templateType === 'events_sport' && (
            <EventsSportFieldsEditor
              fields={templateFields as Record<string, unknown>}
              onChange={(f) => setTemplateFields(f as Record<string, unknown>)}
            />
          )}
          {templateType === 'arts_culture' && (
            <ArtsCultureFieldsEditor
              fields={templateFields as Record<string, unknown>}
              onChange={(f) => setTemplateFields(f as Record<string, unknown>)}
            />
          )}
          {templateType === 'personal_services' && (
            <PersonalServicesFieldsEditor
              fields={templateFields as Record<string, unknown>}
              onChange={(f) => setTemplateFields(f as Record<string, unknown>)}
            />
          )}
          <div className="border-t border-gray-200 pt-3 space-y-3">
            <Input
              label="Price display"
              placeholder="e.g. from €850 per night"
              value={priceDisplay}
              onChange={(e) => setPriceDisplay(e.target.value)}
            />
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showPrice}
                onChange={(e) => setShowPrice(e.target.checked)}
                className="rounded border-gray-300 text-green focus:ring-green"
              />
              <span className="text-sm text-gray-700">Show price publicly</span>
            </label>
          </div>
        </div>

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
      <div className="w-full lg:w-80 flex-shrink-0 space-y-6">
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
          {status === 'live' && galleryUrls.length < 4 && (
            <div className="mt-2 p-3 rounded-[4px] bg-amber-50 border border-amber-200 text-sm text-amber-800 font-body">
              <strong>Gallery:</strong> At least 4 images are required for the editorial layout. This fiche currently has {galleryUrls.length}.
            </div>
          )}
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
          <button
            type="button"
            onClick={() => {
              setInviteEmail(initial.org?.email || '')
              setInviteTemplateType(templateType)
              setInviteError(null)
              setInviteSuccess(false)
              setShowInvitePartner(true)
            }}
            className="block w-full text-center rounded-[4px] border border-gold text-gold px-4 py-2 text-sm font-medium hover:bg-gold/5 transition-colors"
          >
            Invite as Partner
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
          templateType={(templateType || 'default') as FicheTemplate}
          templateFields={templateFields}
          heroImageUrl={heroImageUrl || null}
          galleryUrls={galleryUrls}
          onClose={() => setShowOutreach(false)}
          onSent={() => setLastContacted(new Date().toISOString())}
        />
      )}

      {/* Invite Partner Modal */}
      {showInvitePartner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-[8px] border border-gray-200 shadow-xl w-full max-w-md mx-4 p-6">
            <h3 className="text-lg font-heading font-semibold text-gray-900 mb-1">
              Invite as Partner
            </h3>
            <p className="text-sm text-gray-500 font-body mb-4">
              This will create a partner account for <span className="font-medium text-gray-700">{org?.name || slug}</span> and send a portal invitation.
            </p>

            {/* Template type display */}
            <div className="mb-4 p-3 rounded bg-gray-50 border border-gray-100">
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">
                Template type
              </label>
              <select
                value={inviteTemplateType}
                onChange={(e) => setInviteTemplateType(e.target.value as FicheTemplate)}
                className="w-full rounded-[4px] border border-gray-300 px-3 py-2 text-sm focus:border-green focus:outline-none focus:ring-1 focus:ring-green"
              >
                {(['default', 'hospitality', 'real_estate', 'dining', 'maker', 'experience', 'transport', 'wine_estate', 'wellness', 'events_sport', 'arts_culture'] as FicheTemplate[]).map((t) => (
                  <option key={t} value={t}>{TEMPLATE_LABELS[t]}</option>
                ))}
              </select>
              {inviteTemplateType === 'default' && (
                <p className="text-xs text-amber-600 mt-1.5 font-body">
                  Template is set to &lsquo;default&rsquo;. Consider selecting the correct template before inviting.
                </p>
              )}
            </div>

            {/* Email input */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Partner contact email <span className="text-red-400">*</span>
              </label>
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="partner@example.com"
                className="w-full rounded-[4px] border border-gray-300 px-3 py-2 text-sm focus:border-green focus:outline-none focus:ring-1 focus:ring-green"
              />
              {!inviteEmail && (
                <p className="text-xs text-gray-400 mt-1 font-body">
                  No email found for this organisation. Please enter one.
                </p>
              )}
            </div>

            {/* Error / Success */}
            {inviteError && (
              <div className="mb-4 p-2 rounded bg-red-50 border border-red-200 text-sm text-red-700 font-body">
                {inviteError}
              </div>
            )}
            {inviteSuccess && (
              <div className="mb-4 p-2 rounded bg-green-50 border border-green-200 text-sm text-green-700 font-body">
                Partner invited successfully. Magic link sent.
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setShowInvitePartner(false)}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleInvitePartner}
                disabled={!inviteEmail || inviting || inviteSuccess}
                className="px-4 py-2 text-sm font-medium rounded-[4px] bg-green text-white hover:bg-green/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {inviting ? 'Inviting...' : inviteSuccess ? 'Invited' : 'Confirm & Send Invitation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
