#!/usr/bin/env node

/**
 * Finds the table ID for the Organizations table in Airtable.
 * Usage: node scripts/find-table-id.mjs
 *
 * Requires AIRTABLE_API_KEY and AIRTABLE_BASE_ID in environment or ~/.tgc-portal/.env.local
 */

import { readFileSync } from 'fs'
import { resolve } from 'path'
import { homedir } from 'os'

// Load env from ~/.tgc-portal/.env.local if not already set
function loadEnv() {
  if (process.env.AIRTABLE_API_KEY && process.env.AIRTABLE_BASE_ID) return

  try {
    const envPath = resolve(process.cwd(), '.env.local')
    const content = readFileSync(envPath, 'utf8')
    for (const line of content.split('\n')) {
      const match = line.match(/^([^#=]+)=(.*)$/)
      if (match) {
        const key = match[1].trim()
        const value = match[2].trim()
        if (!process.env[key]) process.env[key] = value
      }
    }
  } catch {
    // Ignore — env vars might be set directly
  }
}

loadEnv()

const API_KEY = process.env.AIRTABLE_API_KEY
const BASE_ID = process.env.AIRTABLE_BASE_ID || 'app23Nd0wKEbMGW7p'

if (!API_KEY) {
  console.error('Error: AIRTABLE_API_KEY not set')
  process.exit(1)
}

const res = await fetch(`https://api.airtable.com/v0/meta/bases/${BASE_ID}/tables`, {
  headers: { Authorization: `Bearer ${API_KEY}` },
})

if (!res.ok) {
  console.error(`Error: ${res.status} ${res.statusText}`)
  const text = await res.text()
  console.error(text)
  process.exit(1)
}

const data = await res.json()

console.log('\nAirtable tables in base', BASE_ID, ':\n')
for (const table of data.tables) {
  const marker = table.name === 'Organizations' ? ' ← USE THIS' : ''
  console.log(`  ${table.id}  ${table.name}${marker}`)
}

const orgTable = data.tables.find(t => t.name === 'Organizations')
if (orgTable) {
  console.log(`\n✓ Organizations table ID: ${orgTable.id}`)
  console.log('  Use this ID in setup-airtable-webhook.mjs')
} else {
  console.log('\n✗ No table named "Organizations" found.')
  console.log('  Check the table names above and update the script accordingly.')
}
