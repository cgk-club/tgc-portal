#!/usr/bin/env node

/**
 * Registers an Airtable webhook for the Organizations table.
 * Run ONCE after deploying the webhook endpoint.
 *
 * Usage:
 *   node scripts/setup-airtable-webhook.mjs <ORGANIZATIONS_TABLE_ID>
 *
 * Example:
 *   node scripts/setup-airtable-webhook.mjs tblXXXXXXXXXXXXXX
 *
 * The script will output:
 *   - Webhook ID (for reference)
 *   - MAC secret (set as AIRTABLE_WEBHOOK_SECRET in Railway)
 */

import { readFileSync } from 'fs'
import { resolve } from 'path'
import { homedir } from 'os'

// Load env — always load all vars from .env.local (don't skip if some are already set)
function loadEnv() {
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
  } catch {}
}

loadEnv()

const API_KEY = process.env.AIRTABLE_API_KEY
const BASE_ID = process.env.AIRTABLE_BASE_ID || 'app23Nd0wKEbMGW7p'
const TABLE_ID = process.argv[2]
// Always use production URL — webhooks must point to the deployed app
const NOTIFICATION_URL = 'https://portal.thegatekeepers.club/api/webhooks/airtable'

if (!API_KEY) {
  console.error('Error: AIRTABLE_API_KEY not set')
  process.exit(1)
}

if (!TABLE_ID) {
  console.error('Usage: node scripts/setup-airtable-webhook.mjs <TABLE_ID>')
  console.error('')
  console.error('Run `node scripts/find-table-id.mjs` first to get the Organizations table ID.')
  process.exit(1)
}

console.log('Creating Airtable webhook...')
console.log(`  Base:    ${BASE_ID}`)
console.log(`  Table:   ${TABLE_ID}`)
console.log(`  URL:     ${NOTIFICATION_URL}`)
console.log()

const res = await fetch(`https://api.airtable.com/v0/bases/${BASE_ID}/webhooks`, {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${API_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    notificationUrl: NOTIFICATION_URL,
    specification: {
      options: {
        filters: {
          fromSources: ['client', 'publicApi', 'formSubmission'],
          dataTypes: ['tableData'],
          recordChangeScope: TABLE_ID,
        },
        includes: {
          includePreviousCellValues: false,
          includePreviousFieldDefinitions: false,
        },
      },
    },
  }),
})

if (!res.ok) {
  const text = await res.text()
  console.error(`Error: ${res.status} ${res.statusText}`)
  console.error(text)

  if (res.status === 403) {
    console.error()
    console.error('Your Airtable personal access token needs the webhook:manage scope.')
    console.error('Regenerate your token with this scope enabled at:')
    console.error()
    console.error('  https://airtable.com/create/tokens')
    console.error()
    console.error('Required scopes: data.records:read, schema.bases:read, webhook:manage')
    console.error('Then update AIRTABLE_API_KEY in .env.local and Railway.')
  }

  process.exit(1)
}

const data = await res.json()

console.log('Webhook created successfully!')
console.log()
console.log(`  Webhook ID:  ${data.id}`)
console.log(`  MAC Secret:  ${data.macSecretBase64}`)
console.log()
console.log('NEXT STEPS:')
console.log('  1. Add this to Railway environment variables:')
console.log(`     AIRTABLE_WEBHOOK_SECRET=${data.macSecretBase64}`)
console.log('  2. Also add it to ~/.tgc-portal/.env.local for local dev')
console.log('  3. Redeploy on Railway to pick up the new variable')
console.log('  4. Test by adding a new org in Airtable')
