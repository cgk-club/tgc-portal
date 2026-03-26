import { NextRequest, NextResponse } from 'next/server'
import { verifyClientSession, CLIENT_COOKIE_NAME } from '@/lib/client-auth'
import { getSupabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  const token = request.cookies.get(CLIENT_COOKIE_NAME)?.value
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const session = await verifyClientSession(token)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()

  const { data, error } = await getSupabaseAdmin()
    .from('requests')
    .insert({
      category: body.category || null,
      description: body.description || null,
      budget_min: body.budget_min || null,
      budget_max: body.budget_max || null,
      timeline: body.timeline || null,
      flexibility: body.flexibility || null,
      name: body.name || null,
      email: body.email || session.email,
      is_public: body.is_public || false,
      status: 'new',
      raw_chat_input: body.description || null,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
