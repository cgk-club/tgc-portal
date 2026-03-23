'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Itinerary } from '@/types'
import ItineraryDay from '@/components/itinerary/ItineraryDay'
import ShareButton from '@/components/itinerary/ShareButton'
import PDFExport from '@/components/itinerary/PDFExport'
import QuotePanel from '@/components/quote/QuotePanel'
import ImageUploader from '@/components/admin/ImageUploader'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
// ChoiceGroupEditor loaded on full-width page at /admin/itineraries/[id]/choices

export default function ItineraryBuilderPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [itinerary, setItinerary] = useState<Itinerary | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'details' | 'quote' | 'payments' | 'choices'>('details')

  // Editable fields
  const [clientName, setClientName] = useState('')
  const [clientEmail, setClientEmail] = useState('')
  const [title, setTitle] = useState('')
  const [startDate, setStartDate] = useState('')
  const [coverImageUrl, setCoverImageUrl] = useState('')
  const [status, setStatus] = useState<'draft' | 'shared' | 'archived'>('draft')

  const fetchItinerary = useCallback(async () => {
    const res = await fetch(`/api/admin/itineraries/${id}`)
    if (res.ok) {
      const data = await res.json()
      setItinerary(data)
      setClientName(data.client_name)
      setClientEmail(data.client_email || '')
      setTitle(data.title)
      setStartDate(data.start_date || '')
      setCoverImageUrl(data.cover_image_url || '')
      setStatus(data.status)
    }
    setLoading(false)
  }, [id])

  useEffect(() => {
    fetchItinerary()
  }, [fetchItinerary])

  async function saveChanges() {
    setSaving(true)
    await fetch(`/api/admin/itineraries/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_name: clientName,
        client_email: clientEmail || null,
        title,
        start_date: startDate || null,
        cover_image_url: coverImageUrl || null,
        status,
      }),
    })
    await fetchItinerary()
    setSaving(false)
  }

  async function addDay() {
    await fetch(`/api/admin/itineraries/${id}/days`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    })
    fetchItinerary()
  }

  if (loading) {
    return <div className="p-8"><p className="text-gray-500 font-body">Loading...</p></div>
  }

  if (!itinerary) {
    return <div className="p-8"><p className="text-gray-500 font-body">Itinerary not found.</p></div>
  }

  const days = itinerary.days || []

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/admin/itineraries')}
            className="text-sm text-gray-500 hover:text-green font-body"
          >
            {'\u2190'} Back to Itineraries
          </button>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={async () => {
              let token = itinerary.share_token
              if (!token) {
                // Generate a share token for preview without changing status
                const res = await fetch(`/api/admin/itineraries/${id}/preview-token`, { method: 'POST' })
                if (res.ok) {
                  const data = await res.json()
                  token = data.token
                  fetchItinerary()
                }
              }
              if (token) {
                window.open(`/itinerary/${token}?preview=true`, '_blank')
              }
            }}
          >
            Preview
          </Button>
          <ShareButton
            itineraryId={id}
            shareToken={itinerary.share_token}
            onTokenGenerated={() => fetchItinerary()}
          />
          <PDFExport itinerary={itinerary} />
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Panel: Days */}
        <div className="flex-1 min-w-0 lg:max-w-[65%]">
          <div className="mb-4">
            <h2 className="font-heading text-xl font-semibold text-green">
              {itinerary.client_name} {'\u2014'} {itinerary.title}
            </h2>
          </div>

          {days.map((day) => (
            <ItineraryDay
              key={day.id}
              day={day}
              itineraryId={id}
              onUpdate={fetchItinerary}
            />
          ))}

          <button
            onClick={addDay}
            className="text-sm text-green hover:text-green-light font-medium font-body mt-2"
          >
            + Add day
          </button>
        </div>

        {/* Right Panel: Tabs */}
        <div className="w-full lg:w-80 flex-shrink-0">
          <div className="bg-white rounded-[8px] border border-gray-200 sticky top-8">
            {/* Tab headers */}
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setActiveTab('details')}
                className={`flex-1 px-4 py-3 text-xs font-semibold uppercase tracking-wider transition-colors ${
                  activeTab === 'details'
                    ? 'text-green border-b-2 border-green'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                Details
              </button>
              <button
                onClick={() => setActiveTab('quote')}
                className={`flex-1 px-4 py-3 text-xs font-semibold uppercase tracking-wider transition-colors ${
                  activeTab === 'quote'
                    ? 'text-green border-b-2 border-green'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                Quote
              </button>
              <button
                onClick={() => setActiveTab('payments')}
                className={`flex-1 px-4 py-3 text-xs font-semibold uppercase tracking-wider transition-colors ${
                  activeTab === 'payments'
                    ? 'text-green border-b-2 border-green'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                Payments
              </button>
              <button
                onClick={() => setActiveTab('choices')}
                className={`flex-1 px-4 py-3 text-xs font-semibold uppercase tracking-wider transition-colors ${
                  activeTab === 'choices'
                    ? 'text-green border-b-2 border-green'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                Choices
              </button>
            </div>

            <div className="p-6">
              {activeTab === 'details' ? (
                <div className="space-y-4">
                  <Input
                    label="Client name"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                  />
                  <Input
                    label="Client email"
                    type="email"
                    placeholder="client@example.com"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                  />
                  <Input
                    label="Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                  <ImageUploader
                    label="Cover Image"
                    currentUrl={coverImageUrl || null}
                    onUpload={(url) => setCoverImageUrl(url)}
                  />
                  {coverImageUrl && (
                    <button
                      onClick={() => setCoverImageUrl('')}
                      className="text-xs text-red-400 hover:text-red-600"
                    >
                      Remove cover image
                    </button>
                  )}
                  <Input
                    label="Start date"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as typeof status)}
                      className="w-full rounded-[4px] border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-green focus:outline-none focus:ring-1 focus:ring-green"
                    >
                      <option value="draft">Draft</option>
                      <option value="shared">Shared</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>

                  <div className="text-sm text-gray-500">
                    <p>Days: {days.length}</p>
                    {itinerary.share_token && (
                      <p className="mt-1 truncate">
                        Share link: <span className="text-green text-xs">/itinerary/{itinerary.share_token}</span>
                      </p>
                    )}
                  </div>

                  <Button onClick={saveChanges} disabled={saving} className="w-full">
                    {saving ? 'Saving...' : 'Save changes'}
                  </Button>
                </div>
              ) : activeTab === 'quote' ? (
                <QuotePanel itinerary={itinerary} onUpdate={fetchItinerary} />
              ) : activeTab === 'payments' ? (
                <div className="text-center py-4">
                  <a
                    href={`/admin/itineraries/${id}/payments`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block bg-green text-white text-xs font-body font-medium px-4 py-2 rounded hover:bg-green/90 transition-colors"
                  >
                    Open Payment Tracker
                  </a>
                  <p className="text-xs text-gray-400 mt-2 font-body">Opens in a full-width view for easier management.</p>
                </div>
              ) : (
                <div className="text-center py-4">
                  <a
                    href={`/admin/itineraries/${id}/choices`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block bg-green text-white text-xs font-body font-medium px-4 py-2 rounded hover:bg-green/90 transition-colors"
                  >
                    Open Choice Editor
                  </a>
                  <p className="text-xs text-gray-400 mt-2 font-body">Opens in a full-width view for easier editing.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
