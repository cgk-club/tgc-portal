import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { sendPartnerMagicLink } from '@/lib/email'
import { randomBytes } from 'crypto'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const sb = getSupabaseAdmin()

  const body = await request.json()
  const { email, template_type } = body

  if (!email) {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 })
  }

  // Get the fiche
  const { data: fiche, error: ficheError } = await sb
    .from('fiches')
    .select('id, slug, headline, airtable_record_id, template_type, partner_account_id')
    .eq('id', id)
    .single()

  if (ficheError || !fiche) {
    return NextResponse.json({ error: 'Fiche not found' }, { status: 404 })
  }

  if (fiche.partner_account_id) {
    return NextResponse.json({ error: 'This fiche is already linked to a partner account' }, { status: 409 })
  }

  // Derive org name from slug
  const orgName = fiche.headline
    || fiche.slug.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')

  // Update template_type if provided
  if (template_type && template_type !== fiche.template_type) {
    await sb
      .from('fiches')
      .update({ template_type })
      .eq('id', id)
  }

  const emailLower = email.toLowerCase().trim()

  // Check if a partner account already exists with this email
  const { data: existingPartner } = await sb
    .from('partner_accounts')
    .select('id')
    .eq('email', emailLower)
    .single()

  let partnerId: string

  if (existingPartner) {
    partnerId = existingPartner.id

    // Add this org to the existing partner's org_ids if not already there
    const { data: partnerFull } = await sb
      .from('partner_accounts')
      .select('org_ids')
      .eq('id', partnerId)
      .single()

    const currentOrgIds: string[] = partnerFull?.org_ids || []
    if (!currentOrgIds.includes(fiche.airtable_record_id)) {
      await sb
        .from('partner_accounts')
        .update({
          org_ids: [...currentOrgIds, fiche.airtable_record_id],
        })
        .eq('id', partnerId)
    }
  } else {
    // Create partner account
    const { data: newPartner, error: partnerError } = await sb
      .from('partner_accounts')
      .insert({
        org_name: orgName,
        email: emailLower,
        org_ids: [fiche.airtable_record_id],
        primary_org_id: fiche.airtable_record_id,
      })
      .select()
      .single()

    if (partnerError) {
      return NextResponse.json({ error: partnerError.message }, { status: 500 })
    }

    partnerId = newPartner.id

    // Create partner user (owner)
    const { error: userError } = await sb
      .from('partner_users')
      .insert({
        partner_id: partnerId,
        email: emailLower,
        role: 'owner',
      })

    if (userError && userError.code !== '23505') {
      return NextResponse.json({ error: userError.message }, { status: 500 })
    }
  }

  // Link fiche to partner account
  await sb
    .from('fiches')
    .update({ partner_account_id: partnerId })
    .eq('id', id)

  // Generate and send magic link
  const token = randomBytes(32).toString('hex')
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()

  // Get the user id for this partner
  const { data: partnerUser } = await sb
    .from('partner_users')
    .select('id')
    .eq('partner_id', partnerId)
    .eq('email', emailLower)
    .single()

  await sb.from('partner_magic_tokens').insert({
    partner_id: partnerId,
    user_id: partnerUser?.id || null,
    token,
    expires_at: expiresAt,
  })

  try {
    await sendPartnerMagicLink(emailLower, orgName, token)
  } catch (err) {
    console.error('Failed to send partner magic link:', err)
    return NextResponse.json({
      error: 'Partner account created but failed to send invitation email',
      partnerId,
    }, { status: 500 })
  }

  return NextResponse.json({
    ok: true,
    partnerId,
    email: emailLower,
  })
}
