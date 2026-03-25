'use client'

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

interface ItineraryFicheCardProps {
  item: ItineraryItem
  isFirst: boolean
  isLast: boolean
  onMoveUp: () => void
  onMoveDown: () => void
  onDelete: () => void
  onUpdate: (data: Partial<ItineraryItem>) => void
}

export default function ItineraryFicheCard({
  item,
  isFirst,
  isLast,
  onMoveUp,
  onMoveDown,
  onDelete,
  onUpdate,
}: ItineraryFicheCardProps) {
  const heroUrl = item.fiche?.hero_image_url
  const name = item.custom_title || item.fiche?.headline || 'Untitled'

  return (
    <div className="bg-white rounded-[8px] border border-gray-200 p-4 flex gap-4">
      {heroUrl && (
        <div className="w-20 h-20 rounded-[4px] overflow-hidden flex-shrink-0">
          <img src={heroUrl} alt="" className="w-full h-full object-cover" />
        </div>
      )}

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">{name}</p>

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
          title="Move up"
        >
          {'\u25B2'}
        </button>
        <button
          onClick={onMoveDown}
          disabled={isLast}
          className="text-gray-400 hover:text-green disabled:opacity-30 text-sm p-1"
          title="Move down"
        >
          {'\u25BC'}
        </button>
        <button
          onClick={onDelete}
          className="text-gray-400 hover:text-red-500 text-sm p-1"
          title="Remove"
        >
          &times;
        </button>
      </div>
    </div>
  )
}
