'use client'

import { PersonalServicesFields } from '@/lib/ficheTemplates'
import Input from '@/components/ui/Input'
import Textarea from '@/components/ui/Textarea'

interface Props {
  fields: PersonalServicesFields
  onChange: (fields: PersonalServicesFields) => void
}

export default function PersonalServicesFieldsEditor({ fields, onChange }: Props) {
  function update(key: keyof PersonalServicesFields, value: unknown) {
    onChange({ ...fields, [key]: value })
  }

  return (
    <div className="space-y-3">
      <Input
        label="Service type"
        placeholder="e.g. Personal Shopping, Styling, Private Training"
        value={fields.service_type ?? ''}
        onChange={(e) => update('service_type', e.target.value || undefined)}
      />
      <Input
        label="Specialisation"
        placeholder="e.g. Luxury fashion, Italian culinary traditions"
        value={fields.specialisation ?? ''}
        onChange={(e) => update('specialisation', e.target.value || undefined)}
      />
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Based in"
          placeholder="e.g. Rome, Italy"
          value={fields.base_city ?? ''}
          onChange={(e) => update('base_city', e.target.value || undefined)}
        />
        <Input
          label="Travel radius"
          placeholder="e.g. Rome and surrounds, International"
          value={fields.travel_radius ?? ''}
          onChange={(e) => update('travel_radius', e.target.value || undefined)}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Languages"
          placeholder="e.g. English, Italian, French"
          value={fields.languages ?? ''}
          onChange={(e) => update('languages', e.target.value || undefined)}
        />
        <Input
          label="Experience (years)"
          placeholder="e.g. 17"
          value={fields.experience_years ?? ''}
          onChange={(e) => update('experience_years', e.target.value || undefined)}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Availability"
          placeholder="e.g. Year-round, By appointment"
          value={fields.availability ?? ''}
          onChange={(e) => update('availability', e.target.value || undefined)}
        />
        <Input
          label="Group size"
          placeholder="e.g. 1-on-1, Up to 4 guests"
          value={fields.group_size ?? ''}
          onChange={(e) => update('group_size', e.target.value || undefined)}
        />
      </div>
      <Input
        label="Rate structure"
        placeholder="e.g. Per session, Per day, Per experience"
        value={fields.rate_structure ?? ''}
        onChange={(e) => update('rate_structure', e.target.value || undefined)}
      />
      <Input
        label="Booking lead time"
        placeholder="e.g. 48 hours, 1 week"
        value={fields.booking_lead_time ?? ''}
        onChange={(e) => update('booking_lead_time', e.target.value || undefined)}
      />
      <Textarea
        label="Certifications"
        placeholder="e.g. Certified Personal Stylist, Licensed Guide"
        rows={2}
        value={fields.certifications ?? ''}
        onChange={(e) => update('certifications', e.target.value || undefined)}
      />
      <Input
        label="Equipment provided"
        placeholder="e.g. All materials included, Client provides own"
        value={fields.equipment_provided ?? ''}
        onChange={(e) => update('equipment_provided', e.target.value || undefined)}
      />
    </div>
  )
}
