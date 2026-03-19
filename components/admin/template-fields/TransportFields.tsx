'use client'

import { TransportFields } from '@/lib/ficheTemplates'
import Input from '@/components/ui/Input'

interface Props {
  fields: TransportFields
  onChange: (fields: TransportFields) => void
}

export default function TransportFieldsEditor({ fields, onChange }: Props) {
  function update(key: keyof TransportFields, value: unknown) {
    onChange({ ...fields, [key]: value })
  }

  return (
    <div className="space-y-3">
      <Input
        label="Vehicle / vessel type"
        placeholder="e.g. Gulfstream G650 or 42m Motor Yacht"
        value={fields.vehicle_type ?? ''}
        onChange={(e) => update('vehicle_type', e.target.value || undefined)}
      />
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Capacity (passengers)"
          type="number"
          value={fields.capacity_passengers ?? ''}
          onChange={(e) => update('capacity_passengers', e.target.value ? parseInt(e.target.value) : undefined)}
        />
        <Input
          label="Capacity (crew)"
          type="number"
          value={fields.capacity_crew ?? ''}
          onChange={(e) => update('capacity_crew', e.target.value ? parseInt(e.target.value) : undefined)}
        />
      </div>
      <Input
        label="Range / coverage"
        placeholder="e.g. Transatlantic range"
        value={fields.range_coverage ?? ''}
        onChange={(e) => update('range_coverage', e.target.value || undefined)}
      />
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Fleet size"
          placeholder="e.g. 6 aircraft"
          value={fields.fleet_size ?? ''}
          onChange={(e) => update('fleet_size', e.target.value || undefined)}
        />
        <Input
          label="Base location"
          placeholder="e.g. Nice Cote d'Azur (NCE)"
          value={fields.base_location ?? ''}
          onChange={(e) => update('base_location', e.target.value || undefined)}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Operating area"
          placeholder="e.g. Europe & Middle East"
          value={fields.operating_area ?? ''}
          onChange={(e) => update('operating_area', e.target.value || undefined)}
        />
        <Input
          label="Lead time"
          placeholder="e.g. 4 hours notice"
          value={fields.lead_time ?? ''}
          onChange={(e) => update('lead_time', e.target.value || undefined)}
        />
      </div>
      <Input
        label="Certifications"
        placeholder="e.g. ARGUS Platinum rated"
        value={fields.certifications ?? ''}
        onChange={(e) => update('certifications', e.target.value || undefined)}
      />
      <Input
        label="Catering"
        placeholder="e.g. Full catering available"
        value={fields.catering ?? ''}
        onChange={(e) => update('catering', e.target.value || undefined)}
      />
    </div>
  )
}
