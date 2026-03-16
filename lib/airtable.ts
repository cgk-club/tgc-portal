import { AirtableOrg } from '@/types'

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID
const TABLE_NAME = 'Organizations'

interface AirtableRecord {
  id: string
  fields: Record<string, unknown>
}

interface AirtableResponse {
  records: AirtableRecord[]
  offset?: string
}

function mapRecord(record: AirtableRecord): AirtableOrg {
  const f = record.fields
  return {
    id: record.id,
    name: (f['Organization Name'] as string) || '',
    category: (f['Organization Type'] as string) || '',
    country: (f['Country'] as string) || '',
    region: (f['Region'] as string) || '',
    city: (f['City'] as string) || '',
    website: (f['Website'] as string) || undefined,
    phone: (f['Phone General'] as string) || undefined,
    email: (f['Email General'] as string) || undefined,
    tags: (f['Tags'] as string[]) || undefined,
  }
}

async function fetchAirtable(
  formula?: string,
  maxRecords?: number,
  offset?: string
): Promise<AirtableResponse> {
  if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
    return { records: [] }
  }

  const params = new URLSearchParams()
  if (formula) params.set('filterByFormula', formula)
  if (maxRecords) params.set('maxRecords', String(maxRecords))
  if (offset) params.set('offset', offset)
  params.set('pageSize', '100')

  const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(TABLE_NAME)}?${params}`

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${AIRTABLE_API_KEY}`,
    },
    next: { revalidate: 3600 },
  })

  if (!res.ok) {
    console.error('Airtable fetch error:', res.status, await res.text())
    return { records: [] }
  }

  return res.json()
}

export async function getOrgById(recordId: string): Promise<AirtableOrg | null> {
  if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) return null

  const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(TABLE_NAME)}/${recordId}`

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${AIRTABLE_API_KEY}`,
    },
    next: { revalidate: 3600 },
  })

  if (!res.ok) return null

  const record: AirtableRecord = await res.json()
  return mapRecord(record)
}

export async function searchOrgs(
  query?: string,
  filters?: { category?: string; country?: string }
): Promise<AirtableOrg[]> {
  const conditions: string[] = []

  if (query) {
    conditions.push(`FIND(LOWER("${query}"), LOWER({Organization Name}))`)
  }
  if (filters?.category) {
    conditions.push(`{Organization Type} = "${filters.category}"`)
  }
  if (filters?.country) {
    conditions.push(`{Country} = "${filters.country}"`)
  }

  const formula = conditions.length > 0
    ? conditions.length === 1
      ? conditions[0]
      : `AND(${conditions.join(', ')})`
    : ''

  const allRecords: AirtableOrg[] = []
  let offset: string | undefined

  do {
    const response = await fetchAirtable(formula, 100, offset)
    allRecords.push(...response.records.map(mapRecord))
    offset = response.offset
  } while (offset)

  return allRecords
}
