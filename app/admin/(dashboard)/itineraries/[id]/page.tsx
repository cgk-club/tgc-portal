'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Itinerary } from '@/types'
import ItineraryDay from '@/components/itinerary/ItineraryDay'
import ShareButton from '@/components/itinerary/ShareButton'
import PDFExport from '@/components/itinerary/PDFExport'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

export default function ItineraryBuilderPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [itinerary, setItinerary] = useState<Itinerary | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Editable fields
  const [clientName, setClientName] = useState('')
  const [title, setTitle] = useState('')
  const [startDate, setStartDate] = useState('')
  const [status, setStatus] = useState<'draft' | 'shared' | 'archived'>('draft')

  const fetchItinerary = useCallback(async () => {
    const res = await fetch(`/api/admin/itineraries/${id}`)
    if (res.ok) {
      const data = await res.json()
      setItinerary(data)
      setClientName(data.client_name)
      setTitle(data.title)
      setStartDate(data.start_date || '')
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
        title,
        start_date: startDate || null,
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
            &larr; Back to Itineraries
          </button>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (itinerary.share_token) {
                window.open(`/itinerary/${itinerary.share_token}`, '_blank')
              }
            }}
            disabled={!itinerary.share_token}
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

      <div className="flex gap-8">
        {/* Left Panel: Days */}
        <div className="flex-1 min-w-0" style={{ flex: '0 0 65%' }}>
          <div className="mb-4">
            <h2 className="font-heading text-xl font-semibold text-green">
              {itinerary.client_name} &mdash; {itinerary.title}
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

        {/* Right Panel: Details */}
        <div className="w-80 flex-shrink-0">
          <div className="bg-white rounded-[8px] border border-gray-200 p-6 sticky top-8">
            <h3 className="font-heading text-sm font-semibold text-green uppercase tracking-wider mb-4">
              Itinerary Details
            </h3>

            <div className="space-y-4">
              <Input
                label="Client name"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
              />
              <Input
                label="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
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
          </div>
        </div>
      </div>
    </div>
  )
}
