import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await request.json()
  const sb = getSupabaseAdmin()

  if (body.action === 'approve') {
    const { data, error } = await sb
      .from('partner_content')
      .update({
        status: 'approved',
        admin_note: body.admin_note || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)

  } else if (body.action === 'reject') {
    const { data, error } = await sb
      .from('partner_content')
      .update({
        status: 'rejected',
        admin_note: body.admin_note || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)

  } else if (body.action === 'publish') {
    const { data, error } = await sb
      .from('partner_content')
      .update({
        status: 'published',
        published_to: body.published_to || null,
        admin_note: body.admin_note || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)

  } else {
    return NextResponse.json({ error: 'Invalid action. Use "approve", "reject", or "publish".' }, { status: 400 })
  }
}
