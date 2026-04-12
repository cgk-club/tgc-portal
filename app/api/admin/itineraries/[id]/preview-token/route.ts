import { NextRequest, NextResponse } from 'next/server'
import { randomBytes } from 'crypto'
import { getSupabaseAdmin } from '@/lib/supabase'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  // Check if token already exists
  const { data: existing } = await getSupabaseAdmin()
    .from('itineraries')
    .select('share_token')
    .eq('id', id)
    .single()

  if (existing?.share_token) {
    return NextResponse.json({ token: existing.share_token })
  }

  // Generate token without changing status
  const token = randomBytes(18).toString('base64url')

  const { error } = await getSupabaseAdmin()
    .from('itineraries')
    .update({
      share_token: token,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ token })
}
