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
    // Update partner event status
    const { data: partnerEvent, error } = await sb
      .from('partner_events')
      .update({
        status: 'active',
        admin_note: body.admin_note || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // Optionally copy to main events table
    if (body.copy_to_events && partnerEvent) {
      await sb.from('events').insert({
        title: partnerEvent.title,
        category: partnerEvent.category,
        date_display: partnerEvent.date_display,
        date_start: partnerEvent.date_start,
        date_end: partnerEvent.date_end,
        location: partnerEvent.location,
        price: partnerEvent.price || 'On application',
        description: partnerEvent.description,
        highlights: partnerEvent.highlights,
        image_url: partnerEvent.image_url,
        brochure_url: partnerEvent.brochure_url || null,
        gallery_images: partnerEvent.gallery_images || null,
        stats: partnerEvent.stats || null,
        active: true,
        featured: false,
        members_only: false,
        sort_order: 0,
        partner_id: partnerEvent.partner_id,
        source: 'partner',
        approval_status: 'approved',
      })
    }

    return NextResponse.json(partnerEvent)

  } else if (body.action === 'reject') {
    const { data, error } = await sb
      .from('partner_events')
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

  } else {
    return NextResponse.json({ error: 'Invalid action. Use "approve" or "reject".' }, { status: 400 })
  }
}
