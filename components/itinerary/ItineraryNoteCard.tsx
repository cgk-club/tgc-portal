'use client'

import { useState } from 'react'
import { ItineraryItem, TimeOfDay } from '@/types'

const TIME_OPTIONS: { value: TimeOfDay | ''; label: string }[] = [
  { value: '', label: 'No time set' },
  { value: 'breakfast', label: 'Breakfast' },
  { value: 'morning', label: 'Morning' },
  { value: 'lunch', label: 'Lunch' },
  { value: 'afternoon', label: 'Afternoon' },
  { value: 'evening', label: 'Evening' },
  { value: 'dinner', label: 'Dinner' },
  { value: 'late_night', label: 'Late Night' },
]

interface ItineraryNoteCardProps {
  item: ItineraryItem
  isFirst: boolean
  isLast: boolean
  onMoveUp: () => void
  onMoveDown: () => void
  onDelete: () => void
  onUpdate: (data: Partial<ItineraryItem>) => void
}

export default function ItineraryNoteCard({
  item,
  isFirst,
  isLast,
  onMoveUp,
  onMoveDown,
  onDelete,
  onUpdate,
}: ItineraryNoteCardProps) {
  const [title, setTitle] = useState(item.custom_title || '')
  const [note, setNote] = useState(item.custom_note || '')

  return (
    <div className="bg-pearl rounded-[8px] border-l-4 border-gold p-4 flex gap-4">
      <div className="flex-1 min-w-0">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={() => onUpdate({ custom_title: title })}
          placeholder="Note title (e.g. Transfer, Flight)"
          className="w-full text-sm font-medium text-gray-900 bg-transparent border-none p-0 focus:outline-none placeholder:text-gray-400 italic"
        />
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          onBlur={() => onUpdate({ custom_note: note })}
          placeholder="Details..."
          rows={2}
          className="w-full text-sm text-gray-600 bg-transparent border-none p-0 mt-1 focus:outline-none placeholder:text-gray-400 resize-none italic"
        />

        <div className="flex items-center gap-2 mt-2">
          <select
            value={item.time_of_day || ''}
            onChange={(e) => onUpdate({ time_of_day: (e.target.value || null) as TimeOfDay | null })}
            className="text-xs border border-gray-300 rounded-[4px] px-2 py-1 focus:border-green focus:outline-none"
          >
            {TIME_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <input
            type="time"
            value={item.exact_time || ''}
            onChange={(e) => onUpdate({ exact_time: e.target.value || null })}
            className="text-xs border border-gray-300 rounded-[4px] px-2 py-1 focus:border-green focus:outline-none"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1 flex-shrink-0">
        <button
          onClick={onMoveUp}
          disabled={isFirst}
          className="text-gray-400 hover:text-green disabled:opacity-30 text-sm p-1"
        >
          &#9650;
        </button>
        <button
          onClick={onMoveDown}
          disabled={isLast}
          className="text-gray-400 hover:text-green disabled:opacity-30 text-sm p-1"
        >
          &#9660;
        </button>
        <button onClick={onDelete} className="text-gray-400 hover:text-red-500 text-sm p-1">
          &times;
        </button>
      </div>
    </div>
  )
}
