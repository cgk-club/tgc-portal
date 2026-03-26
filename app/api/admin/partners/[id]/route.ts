import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const sb = getSupabaseAdmin()

  // Get partner account (org-level)
  const { data: partner, error } = await sb
    .from('partner_accounts')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !partner) {
    return NextResponse.json({ error: 'Partner not found' }, { status: 404 })
  }

  // Get users for this org
  const { data: users } = await sb
    .from('partner_users')
    .select('id, email, name, role, last_login, created_at')
    .eq('partner_id', id)
    .order('created_at', { ascending: true })

  // Get linked fiches (via partner_account_id OR airtable_record_id in org_ids)
  const orgIds = partner.org_ids || []
  let allFiches: { id: string; slug: string; headline: string | null; airtable_record_id: string; status: string }[] = []

  // Query by partner_account_id
  const { data: fichesByAccount } = await sb
    .from('fiches')
    .select('id, slug, headline, airtable_record_id, status')
    .eq('partner_account_id', id)

  if (fichesByAccount) allFiches = [...fichesByAccount]

  // Query by org_ids (airtable_record_id match)
  if (orgIds.length > 0) {
    const { data: fichesByOrg } = await sb
      .from('fiches')
      .select('id, slug, headline, airtable_record_id, status')
      .in('airtable_record_id', orgIds)

    if (fichesByOrg) {
      const existingIds = new Set(allFiches.map(f => f.id))
      for (const f of fichesByOrg) {
        if (!existingIds.has(f.id)) allFiches.push(f)
      }
    }
  }

  // Map to expected shape
  const fiches = allFiches.map(f => ({
    id: f.id,
    slug: f.slug,
    name: f.slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
    headline: f.headline,
    status: f.status,
  }))

  // Get active offers
  const { data: offers } = await sb
    .from('partner_offers')
    .select('*')
    .eq('partner_id', id)
    .order('created_at', { ascending: false })

  // Get events
  const { data: events } = await sb
    .from('partner_events')
    .select('*')
    .eq('partner_id', id)
    .order('created_at', { ascending: false })

  // Get referral stats
  const { data: referrals } = await sb
    .from('partner_referrals')
    .select('*')
    .eq('partner_id', id)

  const referralStats = {
    total_visits: (referrals || []).length,
    total_enquiries: (referrals || []).filter((r) => r.status === 'enquired' || r.status === 'converted').length,
    total_conversions: (referrals || []).filter((r) => r.status === 'converted').length,
    total_revenue: (referrals || []).reduce((sum, r) => sum + Number(r.revenue_attributed || 0), 0),
  }

  // Get content submissions
  const { data: content } = await sb
    .from('partner_content')
    .select('*')
    .eq('partner_id', id)
    .order('created_at', { ascending: false })

  // Get fiche edit requests
  const { data: ficheEdits } = await sb
    .from('fiche_edit_requests')
    .select('*, fiches(slug, headline)')
    .eq('partner_id', id)
    .order('submitted_at', { ascending: false })

  return NextResponse.json({
    ...partner,
    users: users || [],
    fiches: fiches || [],
    offers: offers || [],
    events: events || [],
    referral_stats: referralStats,
    content: content || [],
    fiche_edits: ficheEdits || [],
  })
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await request.json()

  const updates: Record<string, unknown> = {}
  const allowed = ['org_name', 'email', 'org_ids', 'status', 'primary_org_id']
  for (const key of allowed) {
    if (key in body) {
      if (key === 'email') {
        updates[key] = (body[key] as string).toLowerCase().trim()
      } else {
        updates[key] = body[key]
      }
    }
  }

  const { data, error } = await getSupabaseAdmin()
    .from('partner_accounts')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'A partner with this email already exists' }, { status: 409 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}
