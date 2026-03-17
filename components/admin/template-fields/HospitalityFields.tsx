'use client'

import { HospitalityFields } from '@/lib/ficheTemplates'
import Input from '@/components/ui/Input'

interface Props {
  fields: HospitalityFields
  onChange: (fields: HospitalityFields) => void
}

export default function HospitalityFieldsEditor({ fields, onChange }: Props) {
  function update(key: keyof HospitalityFields, value: unknown) {
    onChange({ ...fields, [key]: value })
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Rooms / suites"
          type="number"
          value={fields.room_count ?? ''}
          onChange={(e) => update('room_count', e.target.value ? parseInt(e.target.value) : undefined)}
        />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Star rating</label>
          <select
            value={fields.star_rating ?? ''}
            onChange={(e) => update('star_rating', e.target.value ? parseInt(e.target.value) : undefined)}
            className="w-full rounded-[4px] border border-gray-300 px-3 py-2 text-sm focus:border-green focus:outline-none focus:ring-1 focus:ring-green"
          >
            <option value="">--</option>
            {[1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={n}>{n} star{n > 1 ? 's' : ''}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Check-in"
          type="time"
          value={fields.checkin_time ?? ''}
          onChange={(e) => update('checkin_time', e.target.value || undefined)}
        />
        <Input
          label="Check-out"
          type="time"
          value={fields.checkout_time ?? ''}
          onChange={(e) => update('checkout_time', e.target.value || undefined)}
        />
      </div>
      <Input
        label="Restaurants on-site"
        type="number"
        value={fields.restaurants_onsite ?? ''}
        onChange={(e) => update('restaurants_onsite', e.target.value ? parseInt(e.target.value) : undefined)}
      />
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={fields.has_spa ?? false}
          onChange={(e) => update('has_spa', e.target.checked)}
          className="rounded border-gray-300 text-green focus:ring-green"
        />
        <span className="text-sm text-gray-700">Spa</span>
      </label>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Pool</label>
        <select
          value={fields.pool ?? 'none'}
          onChange={(e) => update('pool', e.target.value)}
          className="w-full rounded-[4px] border border-gray-300 px-3 py-2 text-sm focus:border-green focus:outline-none focus:ring-1 focus:ring-green"
        >
          <option value="none">None</option>
          <option value="indoor">Indoor</option>
          <option value="outdoor">Outdoor</option>
          <option value="both">Both</option>
        </select>
      </div>
      <Input
        label="Pet policy"
        placeholder="e.g. Pets welcome"
        value={fields.pet_policy ?? ''}
        onChange={(e) => update('pet_policy', e.target.value || undefined)}
      />
      <Input
        label="Minimum stay"
        placeholder="e.g. 2 nights"
        value={fields.minimum_stay ?? ''}
        onChange={(e) => update('minimum_stay', e.target.value || undefined)}
      />
    </div>
  )
}
