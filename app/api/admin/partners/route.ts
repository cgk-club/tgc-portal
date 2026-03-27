import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  const sb = getSupabaseAdmin()
  const url = new URL(request.url)
  const search = url.searchParams.get('search')

  let query = sb
    .from('partner_accounts')
    .select('*')
    .order('created_at', { ascending: false })

  if (search) {
    query = query.or(`org_name.ilike.%${search}%,email.ilike.%${search}%`)
  }

  const { data, error } = await query

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Enrich with org count and user count
  const partnerIds = (data || []).map((p) => p.id)

  // Fetch user counts per partner
  let userCounts: Record<string, number> = {}
  if (partnerIds.length > 0) {
    const { data: users } = await sb
      .from('partner_users')
      .select('partner_id')
      .in('partner_id', partnerIds)

    if (users) {
      for (const u of users) {
        userCounts[u.partner_id] = (userCounts[u.partner_id] || 0) + 1
      }
    }
  }

  const partners = (data || []).map((p) => ({
    ...p,
    org_count: (p.org_ids || []).length,
    user_count: userCounts[p.id] || 0,
  }))

  return NextResponse.json(partners)
}

export async function POST(request: NextRequest) {
  const { org_name, email, name, org_ids, primary_org_id } = await request.json()
  if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 })

  const sb = getSupabaseAdmin()

  // Create the org-level partner account
  const { data: partner, error: partnerError } = await sb
    .from('partner_accounts')
    .insert({
      org_name: org_name || null,
      email: email.toLowerCase().trim(),
      name: name || null,
      org_ids: org_ids || [],
      primary_org_id: primary_org_id || null,
    })
    .select()
    .single()

  if (partnerError) {
    if (partnerError.code === '23505') {
      return NextResponse.json({ error: 'A partner with this email already exists' }, { status: 409 })
    }
    return NextResponse.json({ error: partnerError.message }, { status: 500 })
  }

  // Create the owner user
  const { data: user, error: userError } = await sb
    .from('partner_users')
    .insert({
      partner_id: partner.id,
      email: email.toLowerCase().trim(),
      name: name || null,
      role: 'owner',
    })
    .select()
    .single()

  if (userError) {
    // If user creation fails due to duplicate email, clean up and report
    if (userError.code === '23505') {
      await sb.from('partner_accounts').delete().eq('id', partner.id)
      return NextResponse.json({ error: 'A user with this email already exists' }, { status: 409 })
    }
    return NextResponse.json({ error: userError.message }, { status: 500 })
  }

  return NextResponse.json({ ...partner, users: [user] }, { status: 201 })
}
