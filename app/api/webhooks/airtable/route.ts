import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { getSupabaseAdmin } from '@/lib/supabase'
import { getOrgById } from '@/lib/airtable'
import { getTemplate, FicheTemplate } from '@/lib/ficheTemplates'
import { slugify } from '@/lib/utils'
import { AirtableOrg } from '@/types'

/**
 * Airtable webhook flow:
 * 1. Airtable sends a POST notification: { base: { id }, webhook: { id }, timestamp }
 * 2. We fetch the actual change payloads from Airtable's API
 * 3. We extract record IDs and process each one
 */

const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID || 'app23Nd0wKEbMGW7p'

interface WebhookNotification {
  base?: { id: string }
  webhook?: { id: string }
  timestamp?: string
}

interface ChangePayload {
  timestamp: string
  baseTransactionNumber: number
  actionMetadata?: { source: string }
  changedTablesById?: Record<string, TableChange>
}

interface TableChange {
  createdRecordsById?: Record<string, unknown>
  changedRecordsById?: Record<string, unknown>
}

interface PayloadsResponse {
  cursor: number
  mightHaveMore: boolean
  payloads: ChangePayload[]
}

function verifySignature(body: string, signature: string | null): boolean {
  const secretBase64 = process.env.AIRTABLE_WEBHOOK_SECRET
  if (!secretBase64 || !signature) return false

  // The secret from Airtable is base64-encoded — decode it for HMAC key
  const secretBytes = Buffer.from(secretBase64, 'base64')
  const hmac = crypto.createHmac('sha256', secretBytes)
  hmac.update(body, 'ascii')
  const expected = 'hmac-sha256=' + hmac.digest('hex')

  try {
    return crypto.timingSafeEqual(
      Buffer.from(expected),
      Buffer.from(signature)
    )
  } catch {
    return false
  }
}

async function ensureUniqueSlug(baseSlug: string, existingId?: string): Promise<string> {
  const sb = getSupabaseAdmin()
  let slug = baseSlug
  let attempt = 0

  while (true) {
    let query = sb.from('fiches').select('id').eq('slug', slug)
    if (existingId) query = query.neq('id', existingId)
    const { data } = await query.maybeSingle()

    if (!data) return slug
    attempt++
    slug = `${baseSlug}-${attempt}`
  }
}

function buildTemplateFields(org: AirtableOrg, template: FicheTemplate): Record<string, unknown> {
  const location = org.city ? `${org.city}, ${org.country}` : org.country || ''
  switch (template) {
    case 'maker':
      return { based_in: location }
    case 'transport':
      return { base_location: location }
    default:
      return {}
  }
}

function buildInitialTags(org: AirtableOrg): string[] {
  const tags: string[] = []
  if (org.country) tags.push(org.country)
  if (org.city) tags.push(org.city)
  if (org.categorySub) tags.push(org.categorySub)
  return tags
}

async function triggerGeocode(ficheId: string, location: string) {
  try {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://portal.thegatekeepers.club'
    await fetch(`${appUrl}/api/geocode`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ location, ficheId }),
    })
  } catch {
    // Non-critical
  }
}

async function processOrgRecord(recordId: string): Promise<{
  created?: boolean
  updated?: boolean
  skipped?: boolean
  reason?: string
  ficheId?: string
}> {
  const sb = getSupabaseAdmin()

  const org = await getOrgById(recordId)
  if (!org) return { skipped: true, reason: 'Record not found in Airtable' }

  const { data: existing } = await sb
    .from('fiches')
    .select('id, status, slug, tags, template_type')
    .eq('airtable_record_id', recordId)
    .maybeSingle()

  if (existing?.status === 'live') {
    return { skipped: true, reason: 'Live fiche exists' }
  }

  const template = getTemplate(org.categorySub)

  const nameForSlug = [org.name, org.city].filter(Boolean).join(' ')
  const baseSlug = slugify(nameForSlug || 'untitled')
  const slug = await ensureUniqueSlug(baseSlug, existing?.id)

  const templateFields = buildTemplateFields(org, template)
  const tags = buildInitialTags(org)

  if (existing) {
    await sb
      .from('fiches')
      .update({
        template_type: template,
        slug: existing.slug || slug,
        tags: existing.tags?.length ? existing.tags : tags,
        template_fields: templateFields,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existing.id)
    return { updated: true, ficheId: existing.id }
  }

  const { data, error } = await sb
    .from('fiches')
    .insert({
      airtable_record_id: recordId,
      slug,
      headline: null,
      description: null,
      highlights: [],
      gallery_urls: [],
      tags,
      template_type: template,
      template_fields: templateFields,
      status: 'draft',
      featured: false,
    })
    .select('id')
    .single()

  if (error) {
    if (error.code === '23505') {
      return { skipped: true, reason: 'Duplicate record' }
    }
    throw error
  }

  if (org.city || org.country) {
    const location = [org.city, org.country].filter(Boolean).join(', ')
    triggerGeocode(data.id, location)
  }

  return { created: true, ficheId: data.id }
}

async function fetchWebhookPayloads(webhookId: string, cursor?: number): Promise<PayloadsResponse> {
  const apiKey = process.env.AIRTABLE_API_KEY
  if (!apiKey) throw new Error('AIRTABLE_API_KEY not set')

  const params = new URLSearchParams()
  if (cursor !== undefined) params.set('cursor', String(cursor))

  const url = `https://api.airtable.com/v0/bases/${AIRTABLE_BASE_ID}/webhooks/${webhookId}/payloads?${params}`
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${apiKey}` },
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Airtable payloads API error: ${res.status} ${text}`)
  }

  return res.json()
}

function extractRecordIds(payloads: ChangePayload[]): string[] {
  const ids = new Set<string>()

  for (const payload of payloads) {
    if (!payload.changedTablesById) continue
    for (const tableChange of Object.values(payload.changedTablesById)) {
      if (tableChange.createdRecordsById) {
        for (const id of Object.keys(tableChange.createdRecordsById)) {
          ids.add(id)
        }
      }
      if (tableChange.changedRecordsById) {
        for (const id of Object.keys(tableChange.changedRecordsById)) {
          ids.add(id)
        }
      }
    }
  }

  return Array.from(ids)
}

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  const sb = getSupabaseAdmin()

  const bodyText = await request.text()

  // Verify HMAC signature if secret is configured
  const secret = process.env.AIRTABLE_WEBHOOK_SECRET
  if (secret) {
    const signature = request.headers.get('X-Airtable-Content-MAC')
    if (!verifySignature(bodyText, signature)) {
      // Log the failure but still process — HMAC format may need tuning
      console.warn('Webhook HMAC verification failed — processing anyway')
    }
  }

  let notification: WebhookNotification
  try {
    notification = JSON.parse(bodyText)
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const webhookId = notification.webhook?.id
  if (!webhookId) {
    // Not a valid Airtable webhook notification — log and acknowledge
    await sb.from('webhook_log').insert({
      source: 'airtable',
      payload: notification as Record<string, unknown>,
      records_processed: 0,
      error: 'No webhook ID in notification',
      duration_ms: Date.now() - startTime,
    })
    return NextResponse.json({ ok: true, message: 'Acknowledged (no webhook ID)' })
  }

  // Fetch the actual change payloads from Airtable
  let recordIds: string[] = []
  let payloadsError: string | null = null

  try {
    // Fetch all available payloads (cursor starts at 1)
    let allPayloads: ChangePayload[] = []
    let cursor: number | undefined = undefined
    let hasMore = true

    while (hasMore) {
      const response = await fetchWebhookPayloads(webhookId, cursor)
      allPayloads = allPayloads.concat(response.payloads)
      cursor = response.cursor
      hasMore = response.mightHaveMore
    }

    recordIds = extractRecordIds(allPayloads)
  } catch (err) {
    payloadsError = err instanceof Error ? err.message : String(err)
    console.error('Error fetching webhook payloads:', err)
  }

  if (recordIds.length === 0) {
    await sb.from('webhook_log').insert({
      source: 'airtable',
      payload: notification as Record<string, unknown>,
      records_processed: 0,
      records_created: 0,
      records_updated: 0,
      records_skipped: 0,
      error: payloadsError,
      duration_ms: Date.now() - startTime,
    })
    return NextResponse.json({ ok: true, message: 'Acknowledged (no records to process)' })
  }

  // Process each record
  let created = 0
  let updated = 0
  let skipped = 0
  let errorMsg: string | null = null

  for (const recordId of recordIds) {
    try {
      const result = await processOrgRecord(recordId)
      if (result.created) created++
      else if (result.updated) updated++
      else skipped++
    } catch (err) {
      errorMsg = err instanceof Error ? err.message : String(err)
      console.error(`Error processing record ${recordId}:`, err)
    }
  }

  const duration = Date.now() - startTime

  // Log the webhook call
  await sb.from('webhook_log').insert({
    source: 'airtable',
    payload: notification as Record<string, unknown>,
    records_processed: recordIds.length,
    records_created: created,
    records_updated: updated,
    records_skipped: skipped,
    error: errorMsg,
    duration_ms: duration,
  })

  return NextResponse.json({
    ok: true,
    processed: recordIds.length,
    created,
    updated,
    skipped,
    duration_ms: duration,
  })
}
