'use client'

import { WellnessFields } from '@/lib/ficheTemplates'
import Input from '@/components/ui/Input'
import Textarea from '@/components/ui/Textarea'

interface Props {
  fields: WellnessFields
  onChange: (fields: WellnessFields) => void
}

export default function WellnessFieldsEditor({ fields, onChange }: Props) {
  function update(key: keyof WellnessFields, value: unknown) {
    onChange({ ...fields, [key]: value })
  }

  return (
    <div className="space-y-3">
      <Input
        label="Wellness focus"
        placeholder="e.g. Thermal spa & ayurvedic treatments"
        value={fields.wellness_focus ?? ''}
        onChange={(e) => update('wellness_focus', e.target.value || undefined)}
      />
      <Input
        label="Treatment philosophy"
        placeholder="e.g. Based on balneotherapy tradition"
        value={fields.treatment_philosophy ?? ''}
        onChange={(e) => update('treatment_philosophy', e.target.value || undefined)}
      />
      <Input
        label="Signature treatment"
        placeholder="e.g. 3-hour Vichy shower ritual"
        value={fields.signature_treatment ?? ''}
        onChange={(e) => update('signature_treatment', e.target.value || undefined)}
      />
      <Textarea
        label="Facilities"
        placeholder="e.g. Indoor pool, hammam, 8 treatment rooms, fitness"
        rows={2}
        value={fields.facilities ?? ''}
        onChange={(e) => update('facilities', e.target.value || undefined)}
      />
      <Input
        label="Practitioners"
        placeholder="e.g. In-house medical team + visiting specialists"
        value={fields.practitioners ?? ''}
        onChange={(e) => update('practitioners', e.target.value || undefined)}
      />
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Minimum stay"
          placeholder="e.g. 2 nights"
          value={fields.minimum_stay ?? ''}
          onChange={(e) => update('minimum_stay', e.target.value || undefined)}
        />
        <Input
          label="Suitable for"
          placeholder="e.g. Solo, couples"
          value={fields.suitable_for ?? ''}
          onChange={(e) => update('suitable_for', e.target.value || undefined)}
        />
      </div>
      <Input
        label="Programmes available"
        placeholder="e.g. Day visits, 3-day detox, 7-day retreat"
        value={fields.programmes_available ?? ''}
        onChange={(e) => update('programmes_available', e.target.value || undefined)}
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
            checked={fields.medical_consultations ?? false}
            onChange={(e) => update('medical_consultations', e.target.checked)}
            className="rounded border-gray-300 text-green focus:ring-green"
          />
          <span className="text-sm text-gray-700">Medical consultations</span>
        </label>
      </div>
    </div>
  )
}
