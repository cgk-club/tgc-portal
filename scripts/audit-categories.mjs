import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Load .env.local
const envPath = join(__dirname, '..', '.env.local')
const envContent = readFileSync(envPath, 'utf-8')
for (const line of envContent.split('\n')) {
  const trimmed = line.trim()
  if (!trimmed || trimmed.startsWith('#')) continue
  const eqIdx = trimmed.indexOf('=')
  if (eqIdx === -1) continue
  const key = trimmed.slice(0, eqIdx)
  const val = trimmed.slice(eqIdx + 1)
  process.env[key] = val
}

const API_KEY = process.env.AIRTABLE_API_KEY
const BASE_ID = process.env.AIRTABLE_BASE_ID
const TABLE = 'Organizations'

async function fetchAll() {
  const all = []
  let offset

  do {
    const params = new URLSearchParams({ pageSize: '100' })
    if (offset) params.set('offset', offset)

    const url = `https://api.airtable.com/v0/${BASE_ID}/${encodeURIComponent(TABLE)}?${params}`
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${API_KEY}` },
    })

    if (!res.ok) {
      console.error('Airtable error:', res.status, await res.text())
      process.exit(1)
    }

    const data = await res.json()
    all.push(...data.records)
    offset = data.offset
    process.stderr.write(`  Fetched ${all.length} records...\r`)
  } while (offset)

  console.error('')
  return all
}

function findDuplicates(counts) {
  const issues = []
  const entries = Array.from(counts.entries())

  for (let i = 0; i < entries.length; i++) {
    for (let j = i + 1; j < entries.length; j++) {
      const [a, countA] = entries[i]
      const [b, countB] = entries[j]

      const normA = a.toLowerCase().replace(/s$/, '').replace(/[- ]/g, '')
      const normB = b.toLowerCase().replace(/s$/, '').replace(/[- ]/g, '')

      if (normA === normB && a !== b) {
        issues.push(`  "${a}" and "${b}" -- likely duplicate (${countA} vs ${countB} records)`)
      }
    }
  }
  return issues
}

async function main() {
  console.log('Fetching all records from Airtable Organizations...\n')
  const records = await fetchAll()
  console.log(`AIRTABLE CATEGORY AUDIT`)
  console.log(`=======================`)
  console.log(`Total records: ${records.length}\n`)

  const byParent = new Map()
  const orgTypeCounts = new Map()
  const allCategorySubs = new Map()

  for (const r of records) {
    const orgType = r.fields['Organization Type'] || '(empty)'
    const parent = r.fields['Category Parent'] || '(empty)'
    const sub = r.fields['Category Sub'] || '(empty)'

    orgTypeCounts.set(orgType, (orgTypeCounts.get(orgType) || 0) + 1)

    if (!byParent.has(parent)) byParent.set(parent, new Map())
    const subs = byParent.get(parent)
    subs.set(sub, (subs.get(sub) || 0) + 1)

    allCategorySubs.set(sub, (allCategorySubs.get(sub) || 0) + 1)
  }

  // Organization Type breakdown
  console.log('ORGANIZATION TYPE BREAKDOWN')
  console.log('-'.repeat(40))
  const sortedTypes = Array.from(orgTypeCounts.entries()).sort((a, b) => b[1] - a[1])
  for (const [type, count] of sortedTypes) {
    console.log(`  ${type.padEnd(30)} ${count} records`)
  }
  console.log('')

  // Category Parent > Category Sub breakdown
  console.log('CATEGORY PARENT > CATEGORY SUB BREAKDOWN')
  console.log('-'.repeat(50))
  const sortedParents = Array.from(byParent.entries()).sort((a, b) => {
    const totalA = Array.from(a[1].values()).reduce((s, v) => s + v, 0)
    const totalB = Array.from(b[1].values()).reduce((s, v) => s + v, 0)
    return totalB - totalA
  })

  for (const [parent, subs] of sortedParents) {
    const total = Array.from(subs.values()).reduce((s, v) => s + v, 0)
    console.log(`\nCategory Parent: ${parent} (${total} total)`)
    const sortedSubs = Array.from(subs.entries()).sort((a, b) => b[1] - a[1])
    for (const [sub, count] of sortedSubs) {
      console.log(`  ${sub.padEnd(35)} ${String(count).padStart(4)} records`)
    }
  }

  console.log('\n')

  // Potential duplicates
  const issues = findDuplicates(allCategorySubs)
  if (issues.length > 0) {
    console.log('POTENTIAL ISSUES')
    console.log('-'.repeat(40))
    for (const issue of issues) {
      console.log(issue)
    }
    console.log('')
  }

  // All unique values
  console.log('ALL UNIQUE CATEGORY SUB VALUES')
  console.log('-'.repeat(40))
  const sortedAll = Array.from(allCategorySubs.entries()).sort((a, b) => b[1] - a[1])
  for (const [sub, count] of sortedAll) {
    console.log(`  ${sub.padEnd(35)} ${String(count).padStart(4)} records`)
  }

  console.log('\n')
  console.log('RECOMMENDED TEMPLATE MAPPING')
  console.log('-'.repeat(50))
  console.log('(Review the values above and confirm before proceeding to Part 2)')
  console.log('')

  // Suggest mapping
  const suggestions = {
    HOSPITALITY: [],
    VILLA: [],
    DINING: [],
    MAKER: [],
    EXPERIENCE: [],
    SERVICE: [],
    DEFAULT: [],
  }

  const hospitalityKeywords = ['hotel', 'lodge', 'resort', 'palace', 'riad', 'inn', 'accommodation', 'camp', 'safari']
  const villaKeywords = ['villa', 'estate', 'chateau', 'château', 'residence', 'house', 'manor', 'mas', 'farmhouse', 'country']
  const diningKeywords = ['restaurant', 'dining', 'chef', 'food', 'wine', 'cuisine', 'gastr', 'bistro', 'brasserie', 'table', 'sommelier']
  const makerKeywords = ['artisan', 'craft', 'designer', 'maker', 'atelier', 'studio', 'ceramic', 'pottery', 'jewel', 'textile', 'leather', 'perfum']
  const experienceKeywords = ['experience', 'tour', 'guide', 'adventure', 'excursion', 'activity', 'sport', 'wellness', 'spa', 'yacht', 'boat', 'helicopter', 'balloon']
  const serviceKeywords = ['service', 'transport', 'security', 'concierge', 'planner', 'event', 'photo', 'florist', 'nanny', 'driver']

  for (const [sub] of sortedAll) {
    if (sub === '(empty)') { suggestions.DEFAULT.push(sub); continue }
    const lower = sub.toLowerCase()

    if (hospitalityKeywords.some(k => lower.includes(k))) suggestions.HOSPITALITY.push(sub)
    else if (villaKeywords.some(k => lower.includes(k))) suggestions.VILLA.push(sub)
    else if (diningKeywords.some(k => lower.includes(k))) suggestions.DINING.push(sub)
    else if (makerKeywords.some(k => lower.includes(k))) suggestions.MAKER.push(sub)
    else if (experienceKeywords.some(k => lower.includes(k))) suggestions.EXPERIENCE.push(sub)
    else if (serviceKeywords.some(k => lower.includes(k))) suggestions.SERVICE.push(sub)
    else suggestions.DEFAULT.push(sub)
  }

  for (const [template, values] of Object.entries(suggestions)) {
    const building = ['HOSPITALITY', 'VILLA', 'DINING', 'MAKER'].includes(template)
    const note = building ? '' : ' (not building yet)'
    console.log(`  ${template}${note}:`)
    if (values.length === 0) {
      console.log(`    (none matched)`)
    } else {
      for (const v of values) {
        console.log(`    - ${v}`)
      }
    }
    console.log('')
  }
}

main().catch(console.error)
