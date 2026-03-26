import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const sb = getSupabaseAdmin()

  // Verify partner exists
  const { data: partner } = await sb
    .from('partner_accounts')
    .select('id')
    .eq('id', id)
    .single()

  if (!partner) {
    return NextResponse.json({ error: 'Partner not found' }, { status: 404 })
  }

  const { name, email, role } = await request.json()
  if (!email) {
    return NextResponse.json({ error: 'Email required' }, { status: 400 })
  }

  const validRoles = ['owner', 'admin', 'member']
  const userRole = validRoles.includes(role) ? role : 'member'

  const { data: user, error } = await sb
    .from('partner_users')
    .insert({
      partner_id: id,
      email: email.toLowerCase().trim(),
      name: name || null,
      role: userRole,
    })
    .select()
    .single()

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'A user with this email already exists' }, { status: 409 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(user, { status: 201 })
}
