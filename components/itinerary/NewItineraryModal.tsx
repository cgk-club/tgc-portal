'use client'

import { useState } from 'react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import ClientSelect from '@/components/admin/ClientSelect'

interface NewItineraryModalProps {
  onClose: () => void
  onCreated: (id: string) => void
}

type Kind = 'trip' | 'event' | 'programme'

const KINDS: { value: Kind; label: string; hint: string }[] = [
  { value: 'trip', label: 'Trip', hint: 'Days with places, stays and experiences.' },
  { value: 'event', label: 'Event', hint: 'Run of show, guests, the team on their phones, call sheets.' },
  { value: 'programme', label: 'Programme', hint: 'Blocks over weeks or months, no day numbers.' },
]

export default function NewItineraryModal({ onClose, onCreated }: NewItineraryModalProps) {
  const [clientName, setClientName] = useState('')
  const [clientEmail, setClientEmail] = useState('')
  const [clientAccountId, setClientAccountId] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [startDate, setStartDate] = useState('')
  const [numDays, setNumDays] = useState(3)
  const [kind, setKind] = useState<Kind>('trip')
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
        client_account_id: clientAccountId || undefined,
        title,
        start_date: startDate || undefined,
        num_days: numDays,
        kind,
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
      <div className="bg-white rounded-[8px] w-full max-w-md max-h-[92vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-lg font-semibold text-green">New Itinerary</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">
              &times;
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <fieldset>
            <legend className="block text-sm font-medium text-gray-700 mb-1">Type</legend>
            <div className="grid grid-cols-3 gap-2">
              {KINDS.map((k) => (
                <label
                  key={k.value}
                  className={`cursor-pointer rounded-[4px] border px-2 py-2 text-center text-sm ${kind === k.value ? 'border-green bg-green-muted text-green font-medium' : 'border-gray-300 text-gray-600'}`}
                >
                  <input type="radio" name="kind" value={k.value} checked={kind === k.value} onChange={() => setKind(k.value)} className="sr-only" />
                  {k.label}
                </label>
              ))}
            </div>
            <p className="mt-1.5 text-xs text-gray-500">{KINDS.find((k) => k.value === kind)?.hint}</p>
          </fieldset>
          <ClientSelect
            value={clientAccountId}
            onChange={(id, client) => {
              setClientAccountId(id)
              if (client) {
                setClientName(client.name || '')
                setClientEmail(client.email)
              }
            }}
          />
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
            placeholder={kind === 'event' ? 'e.g. Paris Fashion Week SS27' : 'e.g. Tuscany Week'}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <Input
            label={kind === 'event' ? 'First day' : 'Start date (optional)'}
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <Input
            label={kind === 'programme' ? 'Number of blocks' : 'Number of days'}
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
