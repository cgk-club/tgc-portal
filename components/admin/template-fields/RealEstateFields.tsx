'use client'

import { RealEstateFields } from '@/lib/ficheTemplates'
import Input from '@/components/ui/Input'

interface Props {
  fields: RealEstateFields
  onChange: (fields: RealEstateFields) => void
}

export default function RealEstateFieldsEditor({ fields, onChange }: Props) {
  function update(key: keyof RealEstateFields, value: unknown) {
    onChange({ ...fields, [key]: value })
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Sleeps (adults)"
          type="number"
          value={fields.sleeps_adults ?? ''}
          onChange={(e) => update('sleeps_adults', e.target.value ? parseInt(e.target.value) : undefined)}
        />
        <Input
          label="Sleeps (children)"
          type="number"
          value={fields.sleeps_children ?? ''}
          onChange={(e) => update('sleeps_children', e.target.value ? parseInt(e.target.value) : undefined)}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Bedrooms"
          type="number"
          value={fields.bedrooms ?? ''}
          onChange={(e) => update('bedrooms', e.target.value ? parseInt(e.target.value) : undefined)}
        />
        <Input
          label="Bathrooms"
          type="number"
          value={fields.bathrooms ?? ''}
          onChange={(e) => update('bathrooms', e.target.value ? parseInt(e.target.value) : undefined)}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Pool</label>
          <select
            value={fields.pool ?? 'none'}
            onChange={(e) => update('pool', e.target.value)}
            className="w-full rounded-[4px] border border-gray-300 px-3 py-2 text-sm focus:border-green focus:outline-none focus:ring-1 focus:ring-green"
          >
            <option value="none">None</option>
            <option value="heated">Heated</option>
            <option value="unheated">Unheated</option>
            <option value="indoor">Indoor</option>
          </select>
        </div>
        <Input
          label="Pool size"
          placeholder="e.g. 15m x 5m"
          value={fields.pool_size ?? ''}
          onChange={(e) => update('pool_size', e.target.value || undefined)}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Nearest airport"
          placeholder="e.g. Nice (NCE)"
          value={fields.nearest_airport ?? ''}
          onChange={(e) => update('nearest_airport', e.target.value || undefined)}
        />
        <Input
          label="Transfer time"
          placeholder="e.g. 45 minutes"
          value={fields.transfer_time ?? ''}
          onChange={(e) => update('transfer_time', e.target.value || undefined)}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Catering</label>
        <select
          value={fields.catering ?? ''}
          onChange={(e) => update('catering', e.target.value || undefined)}
          className="w-full rounded-[4px] border border-gray-300 px-3 py-2 text-sm focus:border-green focus:outline-none focus:ring-1 focus:ring-green"
        >
          <option value="">--</option>
          <option value="self-catered">Self-catered</option>
          <option value="chef-available">Chef available</option>
          <option value="full-board">Full board</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Events permitted</label>
        <select
          value={fields.events_permitted ?? ''}
          onChange={(e) => update('events_permitted', e.target.value || undefined)}
          className="w-full rounded-[4px] border border-gray-300 px-3 py-2 text-sm focus:border-green focus:outline-none focus:ring-1 focus:ring-green"
        >
          <option value="">--</option>
          <option value="yes">Yes</option>
          <option value="no">No</option>
          <option value="on-request">On request</option>
        </select>
      </div>
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={fields.exclusive_hire ?? false}
          onChange={(e) => update('exclusive_hire', e.target.checked)}
          className="rounded border-gray-300 text-green focus:ring-green"
        />
        <span className="text-sm text-gray-700">Exclusive hire only</span>
      </label>
      <Input
        label="Minimum stay"
        placeholder="e.g. 7 nights (summer)"
        value={fields.minimum_stay ?? ''}
        onChange={(e) => update('minimum_stay', e.target.value || undefined)}
      />
    </div>
  )
}
