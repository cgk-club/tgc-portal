import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export async function GET() {
  const sb = getSupabaseAdmin()

  const { data, error } = await sb
    .from('partner_accounts')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Enrich with org count and format for list view
  const partners = (data || []).map((p) => ({
    ...p,
    org_count: (p.org_ids || []).length,
  }))

  return NextResponse.json(partners)
}

export async function POST(request: NextRequest) {
  const { name, email, org_ids } = await request.json()
  if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 })

  const { data, error } = await getSupabaseAdmin()
    .from('partner_accounts')
    .insert({
      name: name || null,
      email: email.toLowerCase().trim(),
      org_ids: org_ids || [],
    })
    .select()
    .single()

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'A partner with this email already exists' }, { status: 409 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}
