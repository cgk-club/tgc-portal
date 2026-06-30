'use client'

import { DesignStudioFields } from '@/lib/ficheTemplates'
import Input from '@/components/ui/Input'

interface Props {
  fields: DesignStudioFields
  onChange: (fields: DesignStudioFields) => void
}

const textareaClass =
  'w-full rounded-[4px] border border-gray-300 px-3 py-2 text-sm focus:border-green focus:outline-none focus:ring-1 focus:ring-green'

export default function DesignStudioFieldsEditor({ fields, onChange }: Props) {
  function update(key: keyof DesignStudioFields, value: unknown) {
    onChange({ ...fields, [key]: value })
  }

  const mode = fields.studio_mode ?? 'multi'

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Studio type</label>
        <select
          value={mode}
          onChange={(e) => update('studio_mode', e.target.value)}
          className={textareaClass}
        >
          <option value="multi">Multi-discipline studio (showcases every discipline)</option>
          <option value="single">Single-discipline studio (focused layout)</option>
        </select>
      </div>

      {mode === 'multi' ? (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Disciplines</label>
          <textarea
            rows={3}
            placeholder={'One per line, e.g.\nArchitecture\nInterior Design\nLandscape Design'}
            value={fields.disciplines ?? ''}
            onChange={(e) => update('disciplines', e.target.value || undefined)}
            className={textareaClass}
          />
          <p className="text-xs text-gray-400 mt-1">One discipline per line. Each gets its own showcase block.</p>
        </div>
      ) : (
        <Input
          label="Discipline"
          placeholder="e.g. Interior Design"
          value={fields.primary_discipline ?? ''}
          onChange={(e) => update('primary_discipline', e.target.value || undefined)}
        />
      )}

      <Input
        label="Principals"
        placeholder="e.g. Lindsay Mattinson, Rene Mattinson"
        value={fields.principals ?? ''}
        onChange={(e) => update('principals', e.target.value || undefined)}
      />
      <Input
        label="Established"
        type="number"
        placeholder="e.g. 2009"
        value={fields.established ?? ''}
        onChange={(e) => update('established', e.target.value ? parseInt(e.target.value) : undefined)}
      />
      <Input
        label="Project types"
        placeholder="e.g. Private residences, hospitality, yachts"
        value={fields.project_types ?? ''}
        onChange={(e) => update('project_types', e.target.value || undefined)}
      />
      <Input
        label="Works in"
        placeholder="e.g. France, United Kingdom, Switzerland"
        value={fields.works_in ?? ''}
        onChange={(e) => update('works_in', e.target.value || undefined)}
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Signature projects</label>
        <textarea
          rows={4}
          placeholder={'One per line, e.g.\nVilla on Cap Ferrat - Saint-Jean-Cap-Ferrat\nThe Ventnor townhouse - Isle of Wight'}
          value={fields.signature_projects ?? ''}
          onChange={(e) => update('signature_projects', e.target.value || undefined)}
          className={textareaClass}
        />
        <p className="text-xs text-gray-400 mt-1">Format: Project name - Location (each becomes a project card).</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Approach</label>
        <textarea
          rows={3}
          placeholder="A short statement of how the studio works"
          value={fields.approach ?? ''}
          onChange={(e) => update('approach', e.target.value || undefined)}
          className={textareaClass}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">How to engage</label>
        <textarea
          rows={2}
          placeholder="e.g. Initial consultation arranged through The Gatekeepers Club"
          value={fields.engagement ?? ''}
          onChange={(e) => update('engagement', e.target.value || undefined)}
          className={textareaClass}
        />
      </div>

      <Input
        label="Pull quote (max 120 chars)"
        placeholder="A quote from or about the studio"
        value={fields.pull_quote ?? ''}
        onChange={(e) => update('pull_quote', e.target.value.slice(0, 120) || undefined)}
      />
      <Input
        label="Pull quote attribution"
        placeholder="e.g. AD France, 2024"
        value={fields.pull_quote_attribution ?? ''}
        onChange={(e) => update('pull_quote_attribution', e.target.value || undefined)}
      />
    </div>
  )
}
