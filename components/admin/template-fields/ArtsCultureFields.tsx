'use client'

import { ArtsCultureFields } from '@/lib/ficheTemplates'
import Input from '@/components/ui/Input'

interface Props {
  fields: ArtsCultureFields
  onChange: (fields: ArtsCultureFields) => void
}

export default function ArtsCultureFieldsEditor({ fields, onChange }: Props) {
  function update(key: keyof ArtsCultureFields, value: unknown) {
    onChange({ ...fields, [key]: value })
  }

  return (
    <div className="space-y-3">
      <Input
        label="Institution type"
        placeholder="e.g. Contemporary art gallery"
        value={fields.institution_type ?? ''}
        onChange={(e) => update('institution_type', e.target.value || undefined)}
      />
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Founded"
          type="number"
          placeholder="e.g. 1985"
          value={fields.founded ?? ''}
          onChange={(e) => update('founded', e.target.value ? parseInt(e.target.value) : undefined)}
        />
        <Input
          label="Specialisation"
          placeholder="e.g. Post-war European painting"
          value={fields.specialisation ?? ''}
          onChange={(e) => update('specialisation', e.target.value || undefined)}
        />
      </div>
      <Input
        label="Current programme"
        placeholder="e.g. Rotating exhibitions, 6 per year"
        value={fields.current_programme ?? ''}
        onChange={(e) => update('current_programme', e.target.value || undefined)}
      />
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Visiting hours"
          placeholder="e.g. Tue-Sat, 10:00-19:00"
          value={fields.visiting_hours ?? ''}
          onChange={(e) => update('visiting_hours', e.target.value || undefined)}
        />
        <Input
          label="Admission"
          placeholder="e.g. Free or by appointment"
          value={fields.admission ?? ''}
          onChange={(e) => update('admission', e.target.value || undefined)}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={fields.permanent_collection ?? false}
            onChange={(e) => update('permanent_collection', e.target.checked)}
            className="rounded border-gray-300 text-green focus:ring-green"
          />
          <span className="text-sm text-gray-700">Permanent collection</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={fields.private_views ?? false}
            onChange={(e) => update('private_views', e.target.checked)}
            className="rounded border-gray-300 text-green focus:ring-green"
          />
          <span className="text-sm text-gray-700">Private views</span>
        </label>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={fields.art_advisory ?? false}
            onChange={(e) => update('art_advisory', e.target.checked)}
            className="rounded border-gray-300 text-green focus:ring-green"
          />
          <span className="text-sm text-gray-700">Art advisory</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={fields.shipping_logistics ?? false}
            onChange={(e) => update('shipping_logistics', e.target.checked)}
            className="rounded border-gray-300 text-green focus:ring-green"
          />
          <span className="text-sm text-gray-700">Shipping / logistics</span>
        </label>
      </div>
    </div>
  )
}
