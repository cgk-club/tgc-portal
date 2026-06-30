'use client'

import { DesignStudioFields, DisciplineBlock } from '@/lib/ficheTemplates'
import Input from '@/components/ui/Input'
import ImageUploader from '@/components/admin/ImageUploader'

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
  const blocks: DisciplineBlock[] = Array.isArray(fields.discipline_blocks)
    ? fields.discipline_blocks
    : []

  function setBlocks(next: DisciplineBlock[]) {
    update('discipline_blocks', next)
  }
  function updateBlock(i: number, patch: Partial<DisciplineBlock>) {
    setBlocks(blocks.map((b, idx) => (idx === i ? { ...b, ...patch } : b)))
  }
  function addBlock() {
    setBlocks([...blocks, { name: '', blurb: '', images: [] }])
  }
  function removeBlock(i: number) {
    setBlocks(blocks.filter((_, idx) => idx !== i))
  }
  function addBlockImage(i: number, url: string) {
    updateBlock(i, { images: [...(blocks[i].images || []), url] })
  }
  function removeBlockImage(i: number, j: number) {
    updateBlock(i, { images: (blocks[i].images || []).filter((_, idx) => idx !== j) })
  }

  const canAdd = mode === 'multi' || blocks.length === 0

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

      {/* Disciplines: name + write-up + image carousel each */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          {mode === 'multi' ? 'Disciplines' : 'Discipline'}
        </label>
        {blocks.length === 0 && (
          <p className="text-xs text-gray-400">No disciplines yet. Add one to give it a write-up and image carousel.</p>
        )}
        {blocks.map((b, i) => (
          <div key={i} className="rounded-[8px] border border-gray-200 p-3 space-y-3 bg-gray-50">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-500">
                {mode === 'multi' ? `Discipline ${i + 1}` : 'Discipline'}
              </span>
              <button
                type="button"
                onClick={() => removeBlock(i)}
                className="text-xs text-red-500 hover:text-red-700"
              >
                Remove
              </button>
            </div>
            <Input
              label="Name"
              placeholder="e.g. Interior Design"
              value={b.name ?? ''}
              onChange={(e) => updateBlock(i, { name: e.target.value })}
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Write-up</label>
              <textarea
                rows={3}
                placeholder="A short paragraph on this discipline"
                value={b.blurb ?? ''}
                onChange={(e) => updateBlock(i, { blurb: e.target.value })}
                className={textareaClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Images ({(b.images || []).length})
              </label>
              {(b.images || []).length > 0 && (
                <div className="grid grid-cols-4 gap-2 mb-2">
                  {(b.images || []).map((url, j) => (
                    <div key={j} className="relative group">
                      <img src={url} alt="" className="w-full h-16 object-cover rounded-[4px]" />
                      <button
                        type="button"
                        onClick={() => removeBlockImage(i, j)}
                        className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-black/60 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        aria-label="Remove image"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <ImageUploader label="Add image" currentUrl={null} onUpload={(url) => addBlockImage(i, url)} />
            </div>
          </div>
        ))}
        {canAdd && (
          <button
            type="button"
            onClick={addBlock}
            className="text-sm text-green hover:underline"
          >
            + Add {mode === 'multi' ? 'discipline' : 'the discipline'}
          </button>
        )}
      </div>

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
