import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { getOrgById } from '@/lib/airtable'
import { createNotification } from '@/lib/notifications'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const { data: fiche, error } = await getSupabaseAdmin()
    .from('fiches')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !fiche) {
    return NextResponse.json({ error: 'Fiche not found' }, { status: 404 })
  }

  const org = await getOrgById(fiche.airtable_record_id)
  return NextResponse.json({ ...fiche, org })
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await request.json()

  const allowedFields = [
    'slug',
    'hero_image_url',
    'headline',
    'description',
    'highlights',
    'gallery_urls',
    'tags',
    'tgc_note',
    'template_type',
    'template_fields',
    'show_price',
    'price_display',
    'status',
    'featured',
  ]

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
  for (const field of allowedFields) {
    if (field in body) {
      updates[field] = body[field]
    }
  }

  // Enforce minimum 4 gallery images for live status
  if (updates.status === 'live') {
    let galleryCount = 0
    if ('gallery_urls' in updates && Array.isArray(updates.gallery_urls)) {
      galleryCount = updates.gallery_urls.length
    } else {
      const sb2 = getSupabaseAdmin()
      const { data: current } = await sb2.from('fiches').select('gallery_urls').eq('id', id).single()
      galleryCount = Array.isArray(current?.gallery_urls) ? current.gallery_urls.length : 0
    }
    if (galleryCount < 4) {
      return NextResponse.json(
        { error: 'At least 4 gallery images are required to publish a fiche.' },
        { status: 422 }
      )
    }
  }

  const sb = getSupabaseAdmin()
  const { data: fiche, error } = await sb
    .from('fiches')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // If fiche status changed, notify linked partner users
  if ('status' in body && fiche) {
    notifyLinkedPartners(sb, fiche.airtable_record_id, fiche.slug, body.status).catch(() => {})
  }

  return NextResponse.json(fiche)
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const { error } = await getSupabaseAdmin()
    .from('fiches')
    .delete()
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}

// Helper: notify partner users linked to a fiche via airtable record ID
async function notifyLinkedPartners(
  sb: ReturnType<typeof getSupabaseAdmin>,
  airtableRecordId: string,
  slug: string,
  newStatus: string
) {
  try {
    // Find partner accounts that have this org in their org_ids
    const { data: partners } = await sb
      .from('partner_accounts')
      .select('id')
      .contains('org_ids', [airtableRecordId])

    if (!partners || partners.length === 0) return

    for (const partner of partners) {
      const { data: users } = await sb
        .from('partner_users')
        .select('id')
        .eq('partner_id', partner.id)

      if (users) {
        const statusLabel = newStatus === 'live' ? 'published' : newStatus
        const title = newStatus === 'live' ? 'Your fiche is now live' : `Fiche status changed to ${statusLabel}`
        const body = newStatus === 'live'
          ? `Your fiche "${slug}" is now visible to clients.`
          : `Your fiche "${slug}" status has been updated to ${statusLabel}.`

        for (const user of users) {
          createNotification({
            user_type: 'partner',
            user_id: user.id,
            title,
            body,
            type: 'update',
            link: `/partner/fiche`,
          }).catch(() => {})
        }
      }
    }
  } catch {
    // Non-critical, don't block the response
  }
}
