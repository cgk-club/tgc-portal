'use client'

import { EventsSportFields } from '@/lib/ficheTemplates'
import Input from '@/components/ui/Input'

interface Props {
  fields: EventsSportFields
  onChange: (fields: EventsSportFields) => void
}

export default function EventsSportFieldsEditor({ fields, onChange }: Props) {
  function update(key: keyof EventsSportFields, value: unknown) {
    onChange({ ...fields, [key]: value })
  }

  return (
    <div className="space-y-3">
      <Input
        label="Venue / activity type"
        placeholder="e.g. Chateau event venue or Golf club"
        value={fields.venue_activity_type ?? ''}
        onChange={(e) => update('venue_activity_type', e.target.value || undefined)}
      />

      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider pt-2">Venue fields</p>
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Capacity (seated)"
          type="number"
          value={fields.capacity_seated ?? ''}
          onChange={(e) => update('capacity_seated', e.target.value ? parseInt(e.target.value) : undefined)}
        />
        <Input
          label="Capacity (standing)"
          type="number"
          value={fields.capacity_standing ?? ''}
          onChange={(e) => update('capacity_standing', e.target.value ? parseInt(e.target.value) : undefined)}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Indoor / outdoor</label>
          <select
            value={fields.indoor_outdoor ?? ''}
            onChange={(e) => update('indoor_outdoor', e.target.value || undefined)}
            className="w-full rounded-[4px] border border-gray-300 px-3 py-2 text-sm focus:border-green focus:outline-none focus:ring-1 focus:ring-green"
          >
            <option value="">--</option>
            <option value="Indoor">Indoor</option>
            <option value="Outdoor">Outdoor</option>
            <option value="Both">Both</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Exclusive hire</label>
          <select
            value={fields.exclusive_hire ?? ''}
            onChange={(e) => update('exclusive_hire', e.target.value || undefined)}
            className="w-full rounded-[4px] border border-gray-300 px-3 py-2 text-sm focus:border-green focus:outline-none focus:ring-1 focus:ring-green"
          >
            <option value="">--</option>
            <option value="Yes">Yes</option>
            <option value="No">No</option>
            <option value="On request">On request</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={fields.catering_inhouse ?? false}
            onChange={(e) => update('catering_inhouse', e.target.checked)}
            className="rounded border-gray-300 text-green focus:ring-green"
          />
          <span className="text-sm text-gray-700">Catering in-house</span>
        </label>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">AV equipment</label>
          <select
            value={fields.av_equipment ?? ''}
            onChange={(e) => update('av_equipment', e.target.value || undefined)}
            className="w-full rounded-[4px] border border-gray-300 px-3 py-2 text-sm focus:border-green focus:outline-none focus:ring-1 focus:ring-green"
          >
            <option value="">--</option>
            <option value="Yes">Yes</option>
            <option value="No">No</option>
            <option value="External only">External only</option>
          </select>
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={fields.accommodation_onsite ?? false}
            onChange={(e) => update('accommodation_onsite', e.target.checked)}
            className="rounded border-gray-300 text-green focus:ring-green"
          />
          <span className="text-sm text-gray-700">Accommodation</span>
        </label>
      </div>
      <Input
        label="Accessibility"
        placeholder="e.g. Fully accessible"
        value={fields.accessibility ?? ''}
        onChange={(e) => update('accessibility', e.target.value || undefined)}
      />

      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider pt-2">Sport fields</p>
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Season"
          placeholder="e.g. Year-round"
          value={fields.season ?? ''}
          onChange={(e) => update('season', e.target.value || undefined)}
        />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Skill level</label>
          <select
            value={fields.skill_level ?? ''}
            onChange={(e) => update('skill_level', e.target.value || undefined)}
            className="w-full rounded-[4px] border border-gray-300 px-3 py-2 text-sm focus:border-green focus:outline-none focus:ring-1 focus:ring-green"
          >
            <option value="">--</option>
            <option value="All levels">All levels</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={fields.instruction_available ?? false}
            onChange={(e) => update('instruction_available', e.target.checked)}
            className="rounded border-gray-300 text-green focus:ring-green"
          />
          <span className="text-sm text-gray-700">Instruction</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={fields.equipment_hire ?? false}
            onChange={(e) => update('equipment_hire', e.target.checked)}
            className="rounded border-gray-300 text-green focus:ring-green"
          />
          <span className="text-sm text-gray-700">Equipment hire</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={fields.membership_required ?? false}
            onChange={(e) => update('membership_required', e.target.checked)}
            className="rounded border-gray-300 text-green focus:ring-green"
          />
          <span className="text-sm text-gray-700">Membership req.</span>
        </label>
      </div>
      <Input
        label="Guest policy"
        placeholder="e.g. Members may introduce 2 guests per visit"
        value={fields.guest_policy ?? ''}
        onChange={(e) => update('guest_policy', e.target.value || undefined)}
      />
    </div>
  )
}
