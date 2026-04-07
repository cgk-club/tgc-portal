import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  const sb = getSupabaseAdmin()
  const searchParams = request.nextUrl.searchParams
  const search = searchParams.get('search')

  let query = sb
    .from('client_accounts')
    .select('*')
    .order('created_at', { ascending: false })

  if (search) {
    query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`)
  }

  const { data: clients, error } = await query

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Fetch the most recent magic token per client
  const { data: latestTokens } = await sb
    .from('magic_tokens')
    .select('client_id, created_at')
    .order('created_at', { ascending: false })

  // Build a map of client_id -> most recent magic link sent date
  const lastMagicLinkMap: Record<string, string> = {}
  if (latestTokens) {
    for (const token of latestTokens) {
      if (token.client_id && !lastMagicLinkMap[token.client_id]) {
        lastMagicLinkMap[token.client_id] = token.created_at
      }
    }
  }

  // Attach last_magic_link_sent to each client
  const enriched = (clients || []).map(c => ({
    ...c,
    last_magic_link_sent: lastMagicLinkMap[c.id] || null,
  }))

  return NextResponse.json(enriched)
}

export async function POST(request: NextRequest) {
  const { name, email } = await request.json()
  if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 })

  const { data, error } = await getSupabaseAdmin()
    .from('client_accounts')
    .insert({ name: name || null, email: email.toLowerCase().trim() })
    .select()
    .single()

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'A client with this email already exists' }, { status: 409 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}
