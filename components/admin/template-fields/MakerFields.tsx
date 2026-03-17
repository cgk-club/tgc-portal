'use client'

import { MakerFields } from '@/lib/ficheTemplates'
import Input from '@/components/ui/Input'
import ImageUploader from '@/components/admin/ImageUploader'

interface Props {
  fields: MakerFields
  onChange: (fields: MakerFields) => void
}

export default function MakerFieldsEditor({ fields, onChange }: Props) {
  function update(key: keyof MakerFields, value: unknown) {
    onChange({ ...fields, [key]: value })
  }

  return (
    <div className="space-y-3">
      <Input
        label="Discipline"
        placeholder="e.g. Hand-thrown porcelain"
        value={fields.discipline ?? ''}
        onChange={(e) => update('discipline', e.target.value || undefined)}
      />
      <Input
        label="Materials"
        placeholder="e.g. Local clay, natural glazes"
        value={fields.materials ?? ''}
        onChange={(e) => update('materials', e.target.value || undefined)}
      />
      <Input
        label="Based in"
        placeholder="e.g. Vallauris, France"
        value={fields.based_in ?? ''}
        onChange={(e) => update('based_in', e.target.value || undefined)}
      />
      <Input
        label="Established"
        type="number"
        placeholder="e.g. 1987"
        value={fields.established ?? ''}
        onChange={(e) => update('established', e.target.value ? parseInt(e.target.value) : undefined)}
      />
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Commissions</label>
        <select
          value={fields.commissions ?? ''}
          onChange={(e) => update('commissions', e.target.value || undefined)}
          className="w-full rounded-[4px] border border-gray-300 px-3 py-2 text-sm focus:border-green focus:outline-none focus:ring-1 focus:ring-green"
        >
          <option value="">--</option>
          <option value="open">Open</option>
          <option value="closed">Closed</option>
          <option value="on-request">On request</option>
        </select>
      </div>
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={fields.ships_internationally ?? false}
          onChange={(e) => update('ships_internationally', e.target.checked)}
          className="rounded border-gray-300 text-green focus:ring-green"
        />
        <span className="text-sm text-gray-700">Ships internationally</span>
      </label>
      <Input
        label="Lead time"
        placeholder="e.g. 6-8 weeks for commissions"
        value={fields.lead_time ?? ''}
        onChange={(e) => update('lead_time', e.target.value || undefined)}
      />
      <ImageUploader
        label="Maker portrait"
        currentUrl={fields.maker_portrait_url || null}
        onUpload={(url) => update('maker_portrait_url', url)}
      />
      <Input
        label="Pull quote (max 120 chars)"
        placeholder="A quote from or about the maker"
        value={fields.pull_quote ?? ''}
        onChange={(e) => update('pull_quote', e.target.value.slice(0, 120) || undefined)}
      />
      <Input
        label="Pull quote attribution"
        placeholder="e.g. The New York Times, 2024"
        value={fields.pull_quote_attribution ?? ''}
        onChange={(e) => update('pull_quote_attribution', e.target.value || undefined)}
      />
    </div>
  )
}
