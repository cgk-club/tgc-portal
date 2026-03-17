'use client'

import { DiningFields } from '@/lib/ficheTemplates'
import Input from '@/components/ui/Input'

interface Props {
  fields: DiningFields
  onChange: (fields: DiningFields) => void
}

export default function DiningFieldsEditor({ fields, onChange }: Props) {
  function update(key: keyof DiningFields, value: unknown) {
    onChange({ ...fields, [key]: value })
  }

  return (
    <div className="space-y-3">
      <Input
        label="Cuisine"
        placeholder="e.g. Contemporary Provencal"
        value={fields.cuisine ?? ''}
        onChange={(e) => update('cuisine', e.target.value || undefined)}
      />
      <Input
        label="Chef"
        placeholder="e.g. Mauro Colagreco"
        value={fields.chef_name ?? ''}
        onChange={(e) => update('chef_name', e.target.value || undefined)}
      />
      <Input
        label="Recognition"
        placeholder="e.g. 3 Michelin stars, World's Best 50"
        value={fields.recognition ?? ''}
        onChange={(e) => update('recognition', e.target.value || undefined)}
      />
      <Input
        label="Covers"
        type="number"
        value={fields.covers ?? ''}
        onChange={(e) => update('covers', e.target.value ? parseInt(e.target.value) : undefined)}
      />
      <Input
        label="Signature dish"
        placeholder="e.g. Langoustine royale with caviar"
        value={fields.signature_dish ?? ''}
        onChange={(e) => update('signature_dish', e.target.value || undefined)}
      />
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Dress code</label>
        <select
          value={fields.dress_code ?? ''}
          onChange={(e) => update('dress_code', e.target.value || undefined)}
          className="w-full rounded-[4px] border border-gray-300 px-3 py-2 text-sm focus:border-green focus:outline-none focus:ring-1 focus:ring-green"
        >
          <option value="">--</option>
          <option value="casual">Casual</option>
          <option value="smart-casual">Smart casual</option>
          <option value="smart">Smart</option>
          <option value="black-tie">Black tie</option>
        </select>
      </div>
      <Input
        label="Reservation lead time"
        placeholder="e.g. 4-6 weeks in advance"
        value={fields.reservation_lead ?? ''}
        onChange={(e) => update('reservation_lead', e.target.value || undefined)}
      />
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={fields.private_dining ?? false}
          onChange={(e) => update('private_dining', e.target.checked)}
          className="rounded border-gray-300 text-green focus:ring-green"
        />
        <span className="text-sm text-gray-700">Private dining available</span>
      </label>
      {fields.private_dining && (
        <Input
          label="Private dining details"
          placeholder="e.g. Seats up to 12 in the wine cellar"
          value={fields.private_dining_details ?? ''}
          onChange={(e) => update('private_dining_details', e.target.value || undefined)}
        />
      )}
    </div>
  )
}
