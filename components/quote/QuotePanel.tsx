'use client'

import { useState } from 'react'
import { Itinerary, ItineraryItem } from '@/types'
import { calculateQuote, formatCurrency } from '@/lib/quote'
import QuoteLineItem from './QuoteLineItem'
import QuoteSummary from './QuoteSummary'
import QuotePDF from './QuotePDF'
import Button from '@/components/ui/Button'

interface QuotePanelProps {
  itinerary: Itinerary
  onUpdate: () => void
}

export default function QuotePanel({ itinerary, onUpdate }: QuotePanelProps) {
  const [saving, setSaving] = useState(false)
  const [quoteLink, setQuoteLink] = useState(itinerary.quote_token || '')

  const days = itinerary.days || []
  const allItems = days.flatMap(d => d.items || [])
  const isMember = itinerary.is_member || false
  const currency = itinerary.currency || 'EUR'
  const calc = calculateQuote(allItems, isMember)

  async function updateItem(itemId: string, dayId: string, data: Partial<ItineraryItem>) {
    await fetch(`/api/admin/itineraries/${itinerary.id}/days/${dayId}/items/${itemId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    onUpdate()
  }

  async function toggleMember() {
    setSaving(true)
    await fetch(`/api/admin/itineraries/${itinerary.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_member: !isMember }),
    })
    onUpdate()
    setSaving(false)
  }

  async function saveQuoteNotes(notes: string) {
    await fetch(`/api/admin/itineraries/${itinerary.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quote_notes: notes || null }),
    })
  }

  async function generateQuoteLink() {
    setSaving(true)
    const res = await fetch(`/api/admin/itineraries/${itinerary.id}/quote`, {
      method: 'POST',
    })
    if (res.ok) {
      const data = await res.json()
      setQuoteLink(data.quote_token)
      const url = `${window.location.origin}/quote/${data.quote_token}`
      await navigator.clipboard.writeText(url)
    }
    onUpdate()
    setSaving(false)
  }

  return (
    <div className="space-y-4">
      {/* Client type toggle */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-700">Client type</span>
        <button
          onClick={toggleMember}
          disabled={saving}
          className={`px-3 py-1 text-xs rounded-full font-medium transition-colors ${
            isMember
              ? 'bg-gold text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          {isMember ? 'Member' : 'Non-member'}
        </button>
      </div>

      <div className="text-xs text-gray-400">
        Currency: {currency}
      </div>

      {/* Line items by day */}
      <div>
        <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
          Line Items
        </h4>
        {days.map(day => {
          const items = day.items || []
          if (items.length === 0) return null
          return (
            <div key={day.id}>
              <p className="text-xs text-green font-medium mt-3 mb-1">
                Day {day.day_number}{day.title ? ` \u2014 ${day.title}` : ''}
              </p>
              {items.map(item => (
                <QuoteLineItem
                  key={item.id}
                  item={item}
                  currency={currency}
                  onUpdate={(data) => updateItem(item.id, day.id, data)}
                />
              ))}
            </div>
          )
        })}
      </div>

      {/* Summary */}
      <QuoteSummary calc={calc} currency={currency} />

      {/* Quote notes */}
      <div>
        <label className="block text-xs text-gray-500 mb-1">Quote notes (internal)</label>
        <textarea
          defaultValue={itinerary.quote_notes || ''}
          onBlur={(e) => saveQuoteNotes(e.target.value)}
          rows={3}
          placeholder="Internal notes..."
          className="w-full text-sm border border-gray-300 rounded-[4px] px-2 py-1.5 focus:border-green focus:outline-none resize-none"
        />
      </div>

      {/* Actions */}
      <div className="space-y-2">
        <QuotePDF itinerary={itinerary} calc={calc} />
        <Button
          variant="secondary"
          size="sm"
          onClick={generateQuoteLink}
          disabled={saving}
          className="w-full"
        >
          {quoteLink ? 'Copy quote link' : 'Share quote link'}
        </Button>
      </div>
    </div>
  )
}
