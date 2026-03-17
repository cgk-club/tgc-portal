'use client'

import { ItineraryItem } from '@/types'

interface QuoteLineItemProps {
  item: ItineraryItem
  currency: string
  onUpdate: (data: Partial<ItineraryItem>) => void
}

export default function QuoteLineItem({ item, currency, onUpdate }: QuoteLineItemProps) {
  const name = item.custom_title || item.fiche?.headline || 'Untitled'
  const symbol = currency === 'EUR' ? '\u20AC' : currency === 'GBP' ? '\u00A3' : '$'

  return (
    <div className={`py-3 border-b border-gray-100 ${!item.is_included ? 'opacity-50' : ''}`}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <p className="text-sm font-medium text-gray-900 flex-1 min-w-0 truncate">{name}</p>
        {item.unit_price != null && item.quantity > 0 && (
          <span className="text-sm font-medium text-gray-700 flex-shrink-0">
            {symbol}{((item.unit_price || 0) * (item.quantity || 1)).toLocaleString()}
          </span>
        )}
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-1">
          <span className="text-xs text-gray-400">{symbol}</span>
          <input
            type="number"
            value={item.unit_price ?? ''}
            onChange={(e) => onUpdate({ unit_price: e.target.value ? parseFloat(e.target.value) : null })}
            placeholder="Price"
            step="0.01"
            className="w-24 text-xs border border-gray-300 rounded-[4px] px-2 py-1 focus:border-green focus:outline-none"
          />
        </div>
        <span className="text-xs text-gray-400">{'\u00D7'}</span>
        <input
          type="number"
          value={item.quantity || 1}
          onChange={(e) => onUpdate({ quantity: parseInt(e.target.value) || 1 })}
          min={1}
          className="w-14 text-xs border border-gray-300 rounded-[4px] px-2 py-1 focus:border-green focus:outline-none"
        />
      </div>

      <div className="flex items-center gap-3 mt-2">
        <label className="flex items-center gap-1 cursor-pointer">
          <input
            type="checkbox"
            checked={item.is_zero_margin}
            onChange={(e) => onUpdate({ is_zero_margin: e.target.checked })}
            className="rounded border-gray-300 text-green focus:ring-green w-3 h-3"
          />
          <span className="text-xs text-gray-500">Zero margin</span>
        </label>
        <label className="flex items-center gap-1 cursor-pointer">
          <input
            type="checkbox"
            checked={!item.is_included}
            onChange={(e) => onUpdate({ is_included: !e.target.checked })}
            className="rounded border-gray-300 text-green focus:ring-green w-3 h-3"
          />
          <span className="text-xs text-gray-500">Exclude</span>
        </label>
      </div>
    </div>
  )
}
