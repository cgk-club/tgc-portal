'use client'

import { FicheTemplate, TEMPLATE_LABELS } from '@/lib/ficheTemplates'

interface TemplateFieldSelectorProps {
  value: FicheTemplate
  onChange: (template: FicheTemplate) => void
}

const TEMPLATE_OPTIONS: FicheTemplate[] = [
  'default', 'hospitality', 'real_estate', 'dining', 'maker',
  'experience', 'transport', 'wine_estate', 'wellness', 'events_sport', 'arts_culture', 'personal_services',
]

export default function TemplateFieldSelector({ value, onChange }: TemplateFieldSelectorProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Template type</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as FicheTemplate)}
        className="w-full rounded-[4px] border border-gray-300 px-3 py-2 text-sm focus:border-green focus:outline-none focus:ring-1 focus:ring-green"
      >
        {TEMPLATE_OPTIONS.map((t) => (
          <option key={t} value={t}>{TEMPLATE_LABELS[t]}</option>
        ))}
      </select>
    </div>
  )
}
