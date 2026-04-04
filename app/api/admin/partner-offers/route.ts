import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')

  let query = getSupabaseAdmin()
    .from('partner_offers')
    .select('*, partner:partner_accounts(org_name, email), fiche:fiches(slug, headline)')
    .order('created_at', { ascending: false })

  if (status) {
    query = query.eq('status', status)
  }

  const { data, error } = await query

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  const response = NextResponse.json(data)
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate')
  return response
}
