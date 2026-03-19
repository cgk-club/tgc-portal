'use client'

import { ExperienceFields } from '@/lib/ficheTemplates'
import Input from '@/components/ui/Input'
import Textarea from '@/components/ui/Textarea'

interface Props {
  fields: ExperienceFields
  onChange: (fields: ExperienceFields) => void
}

export default function ExperienceFieldsEditor({ fields, onChange }: Props) {
  function update(key: keyof ExperienceFields, value: unknown) {
    onChange({ ...fields, [key]: value })
  }

  return (
    <div className="space-y-3">
      <Input
        label="Experience type"
        placeholder="e.g. Private guided walking tour"
        value={fields.experience_type ?? ''}
        onChange={(e) => update('experience_type', e.target.value || undefined)}
      />
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Duration"
          placeholder="e.g. Half day (4 hours)"
          value={fields.duration ?? ''}
          onChange={(e) => update('duration', e.target.value || undefined)}
        />
        <Input
          label="Group size"
          placeholder="e.g. 2-8 guests"
          value={fields.group_size ?? ''}
          onChange={(e) => update('group_size', e.target.value || undefined)}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Physical level</label>
          <select
            value={fields.physical_level ?? ''}
            onChange={(e) => update('physical_level', e.target.value || undefined)}
            className="w-full rounded-[4px] border border-gray-300 px-3 py-2 text-sm focus:border-green focus:outline-none focus:ring-1 focus:ring-green"
          >
            <option value="">--</option>
            <option value="None">None</option>
            <option value="Easy">Easy</option>
            <option value="Moderate">Moderate</option>
            <option value="Challenging">Challenging</option>
            <option value="Strenuous">Strenuous</option>
          </select>
        </div>
        <Input
          label="Minimum age"
          placeholder="e.g. All ages"
          value={fields.minimum_age ?? ''}
          onChange={(e) => update('minimum_age', e.target.value || undefined)}
        />
      </div>
      <Input
        label="Languages"
        placeholder="e.g. French, English, Spanish"
        value={fields.languages ?? ''}
        onChange={(e) => update('languages', e.target.value || undefined)}
      />
      <Textarea
        label="What's included"
        placeholder="e.g. Guide, transport, picnic lunch"
        rows={2}
        value={fields.whats_included ?? ''}
        onChange={(e) => update('whats_included', e.target.value || undefined)}
      />
      <Textarea
        label="What's not included"
        placeholder="e.g. Flights, personal insurance"
        rows={2}
        value={fields.whats_not_included ?? ''}
        onChange={(e) => update('whats_not_included', e.target.value || undefined)}
      />
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Booking lead time"
          placeholder="e.g. 48 hours advance notice"
          value={fields.booking_lead_time ?? ''}
          onChange={(e) => update('booking_lead_time', e.target.value || undefined)}
        />
        <Input
          label="Seasonal"
          placeholder="e.g. April to October"
          value={fields.seasonal ?? ''}
          onChange={(e) => update('seasonal', e.target.value || undefined)}
        />
      </div>
    </div>
  )
}
