'use client'

import { useState } from 'react'
import { ItineraryDay as DayType, ItineraryItem } from '@/types'
import ItineraryFicheCard from './ItineraryFicheCard'
import ItineraryNoteCard from './ItineraryNoteCard'
import FicheSearchModal from './FicheSearchModal'
import Button from '@/components/ui/Button'

interface ItineraryDayProps {
  day: DayType & { items?: ItineraryItem[] }
  itineraryId: string
  onUpdate: () => void
}

export default function ItineraryDay({ day, itineraryId, onUpdate }: ItineraryDayProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [showFicheSearch, setShowFicheSearch] = useState(false)
  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState(day.title || '')
  const [date, setDate] = useState(day.date || '')

  const items = day.items || []

  async function saveDay() {
    await fetch(`/api/admin/itineraries/${itineraryId}/days/${day.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: title || null, date: date || null }),
    })
    setEditing(false)
    onUpdate()
  }

  async function deleteDay() {
    if (items.length > 0 && !confirm('This day has items. Delete anyway?')) return
    await fetch(`/api/admin/itineraries/${itineraryId}/days/${day.id}`, {
      method: 'DELETE',
    })
    onUpdate()
  }

  async function addFiche(result: { fiche_id?: string; custom_title: string }) {
    await fetch(`/api/admin/itineraries/${itineraryId}/days/${day.id}/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fiche_id: result.fiche_id || null,
        custom_title: result.custom_title,
        item_type: 'fiche',
      }),
    })
    setShowFicheSearch(false)
    onUpdate()
  }

  async function addNote() {
    await fetch(`/api/admin/itineraries/${itineraryId}/days/${day.id}/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        custom_title: '',
        custom_note: '',
        item_type: 'note',
      }),
    })
    onUpdate()
  }

  async function updateItem(itemId: string, data: Partial<ItineraryItem>) {
    await fetch(`/api/admin/itineraries/${itineraryId}/days/${day.id}/items/${itemId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
  }

  async function deleteItem(itemId: string) {
    await fetch(`/api/admin/itineraries/${itineraryId}/days/${day.id}/items/${itemId}`, {
      method: 'DELETE',
    })
    onUpdate()
  }

  async function moveItem(itemId: string, direction: 'up' | 'down') {
    const ids = items.map(i => i.id)
    const idx = ids.indexOf(itemId)
    if (direction === 'up' && idx > 0) {
      [ids[idx], ids[idx - 1]] = [ids[idx - 1], ids[idx]]
    } else if (direction === 'down' && idx < ids.length - 1) {
      [ids[idx], ids[idx + 1]] = [ids[idx + 1], ids[idx]]
    }

    await fetch(`/api/admin/itineraries/${itineraryId}/days/${day.id}/items/reorder`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderedIds: ids }),
    })
    onUpdate()
  }

  const dateLabel = day.date
    ? new Date(day.date + 'T00:00:00').toLocaleDateString('en-GB', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      })
    : null

  return (
    <div className="mb-6">
      <div
        className="flex items-center gap-3 cursor-pointer select-none mb-3"
        onClick={() => setCollapsed(!collapsed)}
      >
        <span className="text-gray-400 text-xs">{collapsed ? '\u25B6' : '\u25BC'}</span>
        <h3 className="font-heading text-base font-semibold text-green">
          Day {day.day_number}
          {dateLabel && <span className="font-body font-normal text-sm text-gray-500 ml-2">{dateLabel}</span>}
          {day.title && <span className="font-body font-normal text-sm text-gray-500 ml-2">/ {day.title}</span>}
        </h3>
        <div className="flex-1" />
        <button
          onClick={(e) => { e.stopPropagation(); setEditing(!editing) }}
          className="text-xs text-green hover:text-green-light"
        >
          Edit
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); deleteDay() }}
          className="text-xs text-red-400 hover:text-red-600"
        >
          Delete
        </button>
      </div>

      {editing && (
        <div className="flex gap-3 mb-3 items-end">
          <div className="flex-1">
            <label className="block text-xs text-gray-500 mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Arrival in Paris"
              className="w-full text-sm border border-gray-300 rounded-[4px] px-2 py-1 focus:border-green focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="text-sm border border-gray-300 rounded-[4px] px-2 py-1 focus:border-green focus:outline-none"
            />
          </div>
          <Button size="sm" onClick={saveDay}>Save</Button>
        </div>
      )}

      {!collapsed && (
        <div className="space-y-2 ml-5">
          {items.map((item, index) =>
            item.item_type === 'note' ? (
              <ItineraryNoteCard
                key={item.id}
                item={item}
                isFirst={index === 0}
                isLast={index === items.length - 1}
                onMoveUp={() => moveItem(item.id, 'up')}
                onMoveDown={() => moveItem(item.id, 'down')}
                onDelete={() => deleteItem(item.id)}
                onUpdate={(data) => updateItem(item.id, data)}
              />
            ) : (
              <ItineraryFicheCard
                key={item.id}
                item={item}
                isFirst={index === 0}
                isLast={index === items.length - 1}
                onMoveUp={() => moveItem(item.id, 'up')}
                onMoveDown={() => moveItem(item.id, 'down')}
                onDelete={() => deleteItem(item.id)}
                onUpdate={(data) => updateItem(item.id, data)}
              />
            )
          )}

          <div className="flex gap-2 pt-1">
            <button
              onClick={() => setShowFicheSearch(true)}
              className="text-xs text-green hover:text-green-light font-medium"
            >
              + Add fiche
            </button>
            <button
              onClick={addNote}
              className="text-xs text-gold hover:text-gold/80 font-medium"
            >
              + Add note
            </button>
          </div>
        </div>
      )}

      {showFicheSearch && (
        <FicheSearchModal
          onClose={() => setShowFicheSearch(false)}
          onSelect={addFiche}
        />
      )}
    </div>
  )
}
