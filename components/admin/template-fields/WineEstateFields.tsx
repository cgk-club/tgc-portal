'use client'

import { WineEstateFields } from '@/lib/ficheTemplates'
import Input from '@/components/ui/Input'

interface Props {
  fields: WineEstateFields
  onChange: (fields: WineEstateFields) => void
}

export default function WineEstateFieldsEditor({ fields, onChange }: Props) {
  function update(key: keyof WineEstateFields, value: unknown) {
    onChange({ ...fields, [key]: value })
  }

  return (
    <div className="space-y-3">
      <Input
        label="Appellation"
        placeholder="e.g. Saint-Emilion Grand Cru"
        value={fields.appellation ?? ''}
        onChange={(e) => update('appellation', e.target.value || undefined)}
      />
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Hectares"
          type="number"
          value={fields.hectares ?? ''}
          onChange={(e) => update('hectares', e.target.value ? parseInt(e.target.value) : undefined)}
        />
        <Input
          label="Established"
          type="number"
          placeholder="e.g. 1850"
          value={fields.established ?? ''}
          onChange={(e) => update('established', e.target.value ? parseInt(e.target.value) : undefined)}
        />
      </div>
      <Input
        label="Annual production"
        placeholder="e.g. 40,000 bottles"
        value={fields.annual_production ?? ''}
        onChange={(e) => update('annual_production', e.target.value || undefined)}
      />
      <Input
        label="Grape varieties"
        placeholder="e.g. Merlot, Cabernet Franc"
        value={fields.grape_varieties ?? ''}
        onChange={(e) => update('grape_varieties', e.target.value || undefined)}
      />
      <Input
        label="Winemaker"
        placeholder="e.g. Jean-Michel Arcaute"
        value={fields.winemaker ?? ''}
        onChange={(e) => update('winemaker', e.target.value || undefined)}
      />
      <Input
        label="Certifications"
        placeholder="e.g. Organic, Biodynamic, HVE3"
        value={fields.certifications ?? ''}
        onChange={(e) => update('certifications', e.target.value || undefined)}
      />
      <div className="grid grid-cols-2 gap-3">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={fields.accommodation ?? false}
            onChange={(e) => update('accommodation', e.target.checked)}
            className="rounded border-gray-300 text-green focus:ring-green"
          />
          <span className="text-sm text-gray-700">Accommodation</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={fields.restaurant_bistro ?? false}
            onChange={(e) => update('restaurant_bistro', e.target.checked)}
            className="rounded border-gray-300 text-green focus:ring-green"
          />
          <span className="text-sm text-gray-700">Restaurant / bistro</span>
        </label>
      </div>
      {fields.accommodation && (
        <>
          <Input
            label="Accommodation details"
            placeholder="e.g. 4-room gite, sleeps 8"
            value={fields.accommodation_details ?? ''}
            onChange={(e) => update('accommodation_details', e.target.value || undefined)}
          />
          <div className="grid grid-cols-3 gap-3">
            <Input
              label="Rooms / suites"
              type="number"
              value={fields.room_count ?? ''}
              onChange={(e) => update('room_count', e.target.value ? parseInt(e.target.value) : undefined)}
            />
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
        </>
      )}
      <Input
        label="Cellar visits"
        placeholder="e.g. By appointment, groups up to 12"
        value={fields.cellar_visits ?? ''}
        onChange={(e) => update('cellar_visits', e.target.value || undefined)}
      />
      <Input
        label="Tasting format"
        placeholder="e.g. Vertical tasting of 5 vintages"
        value={fields.tasting_format ?? ''}
        onChange={(e) => update('tasting_format', e.target.value || undefined)}
      />
      <Input
        label="Shipping"
        placeholder="e.g. Ships to EU, UK, US"
        value={fields.shipping ?? ''}
        onChange={(e) => update('shipping', e.target.value || undefined)}
      />
    </div>
  )
}
