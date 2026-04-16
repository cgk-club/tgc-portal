import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get('slug')
  if (!slug) return NextResponse.json({ error: 'slug param required' }, { status: 400 })

  const sb = getSupabaseAdmin()

  // Test 1: direct single() call (mirrors the fiche page)
  const { data: single, error: singleErr } = await sb
    .from('fiches')
    .select('id,slug,status,updated_at')
    .eq('slug', slug)
    .single()

  // Test 2: array select (no single() constraint)
  const { data: rows, error: rowsErr } = await sb
    .from('fiches')
    .select('id,slug,status,updated_at')
    .eq('slug', slug)

  return NextResponse.json({
    env_url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    single,
    single_error: singleErr,
    rows,
    rows_error: rowsErr,
    row_count: rows?.length ?? null,
  })
}
