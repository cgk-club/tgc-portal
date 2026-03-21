import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { sendMagicLink } from '@/lib/email'
import { randomBytes } from 'crypto'

export async function GET() {
  const { data, error } = await getSupabaseAdmin()
    .from('client_accounts')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
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

  // Auto-send magic link on creation
  const token = randomBytes(32).toString('hex')
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()

  await getSupabaseAdmin().from('magic_tokens').insert({
    client_id: data.id,
    token,
    expires_at: expiresAt,
  })

  sendMagicLink(data.email, data.name || 'there', token).catch((err) =>
    console.error('Failed to send magic link on creation:', err)
  )

  return NextResponse.json(data, { status: 201 })
}
