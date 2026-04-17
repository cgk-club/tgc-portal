import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { createNotification } from '@/lib/notifications'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await request.json()
  const sb = getSupabaseAdmin()

  // Get the edit request
  const { data: editReq, error: fetchError } = await sb
    .from('fiche_edit_requests')
    .select('*')
    .eq('id', id)
    .single()

  if (fetchError || !editReq) {
    return NextResponse.json({ error: 'Edit request not found' }, { status: 404 })
  }

  if (body.action === 'approve') {
    // Apply the JSONB changes to the fiche
    if (editReq.fiche_id && editReq.changes) {
      const rawChanges = typeof editReq.changes === 'string'
        ? JSON.parse(editReq.changes)
        : { ...editReq.changes }

      // Only apply known fiche columns — unknown fields cause a Postgres error
      const SAFE_FICHE_FIELDS = new Set([
        'headline', 'description', 'highlights', 'hero_image_url',
        'gallery_urls', 'price_display', 'template_fields', 'tags',
        'show_price', 'latitude', 'longitude',
      ])
      const changes: Record<string, unknown> = Object.fromEntries(
        Object.entries(rawChanges).filter(([k]) => SAFE_FICHE_FIELDS.has(k))
      )

      // Convert highlights string to JSONB array if needed
      if (typeof changes.highlights === 'string' && changes.highlights) {
        changes.highlights = changes.highlights
          .split('\n')
          .filter((h: string) => h.trim())
          .map((h: string) => ({ icon: '✦', label: h.trim(), value: '' }))
      }

      if (Object.keys(changes).length > 0) {
        const { error: updateError } = await sb
          .from('fiches')
          .update({ ...changes, updated_at: new Date().toISOString() })
          .eq('id', editReq.fiche_id)

        if (updateError) {
          return NextResponse.json({ error: `Failed to apply changes: ${updateError.message}` }, { status: 500 })
        }
      }
    }

    // Mark the edit request as approved
    const { data, error } = await sb
      .from('fiche_edit_requests')
      .update({
        status: 'approved',
        admin_note: body.admin_note || null,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // Notify partner users about approval
    notifyPartnerUsers(sb, editReq.partner_id, 'Fiche edit approved', 'Your fiche changes have been approved and applied.', '/partner/fiche')

    return NextResponse.json(data)

  } else if (body.action === 'reject') {
    const { data, error } = await sb
      .from('fiche_edit_requests')
      .update({
        status: 'rejected',
        admin_note: body.admin_note || null,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // Notify partner users about rejection
    const rejectBody = body.admin_note
      ? `Your fiche edit was not approved. Note: ${body.admin_note}`
      : 'Your fiche edit was not approved. Please check with the team.'
    notifyPartnerUsers(sb, editReq.partner_id, 'Fiche edit not approved', rejectBody, '/partner/fiche')

    return NextResponse.json(data)

  } else {
    return NextResponse.json({ error: 'Invalid action. Use "approve" or "reject".' }, { status: 400 })
  }
}

// Helper: send notification to all users of a partner account
async function notifyPartnerUsers(
  sb: ReturnType<typeof getSupabaseAdmin>,
  partnerId: string,
  title: string,
  body: string,
  link: string
) {
  try {
    const { data: users } = await sb
      .from('partner_users')
      .select('id')
      .eq('partner_id', partnerId)

    if (users && users.length > 0) {
      for (const user of users) {
        createNotification({
          user_type: 'partner',
          user_id: user.id,
          title,
          body,
          type: 'approval',
          link,
        }).catch(() => {}) // fire and forget
      }
    }
  } catch {
    // Non-critical, don't block the response
  }
}
