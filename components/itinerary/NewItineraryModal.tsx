'use client'

import { useState } from 'react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

interface NewItineraryModalProps {
  onClose: () => void
  onCreated: (id: string) => void
}

export default function NewItineraryModal({ onClose, onCreated }: NewItineraryModalProps) {
  const [clientName, setClientName] = useState('')
  const [clientEmail, setClientEmail] = useState('')
  const [title, setTitle] = useState('')
  const [startDate, setStartDate] = useState('')
  const [numDays, setNumDays] = useState(3)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!clientName.trim() || !title.trim()) return

    setLoading(true)
    setError('')

    const res = await fetch('/api/admin/itineraries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_name: clientName,
        client_email: clientEmail || undefined,
        title,
        start_date: startDate || undefined,
        num_days: numDays,
      }),
    })

    if (res.ok) {
      const data = await res.json()
      onCreated(data.id)
    } else {
      const data = await res.json()
      setError(data.error || 'Failed to create itinerary')
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-[8px] w-full max-w-md">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-lg font-semibold text-green">New Itinerary</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">
              &times;
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <Input
            label="Client name"
            placeholder="e.g. Thompson Family"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            required
          />
          <Input
            label="Client email (optional)"
            type="email"
            placeholder="client@example.com"
            value={clientEmail}
            onChange={(e) => setClientEmail(e.target.value)}
          />
          <Input
            label="Itinerary title"
            placeholder="e.g. Tuscany Week"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <Input
            label="Start date (optional)"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <Input
            label="Number of days"
            type="number"
            min={1}
            max={30}
            value={numDays}
            onChange={(e) => setNumDays(parseInt(e.target.value) || 3)}
          />

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" type="button" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={loading || !clientName.trim() || !title.trim()}>
              {loading ? 'Creating...' : 'Create Itinerary'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
