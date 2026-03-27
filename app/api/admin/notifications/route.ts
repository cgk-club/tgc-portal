import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET() {
  const sb = getSupabaseAdmin()

  try {
    const [
      { count: ficheEdits },
      { count: partnerOffers },
      { count: partnerEvents },
      { count: partnerContent },
      { count: requests },
      { count: feedback },
      { count: marketplaceReview },
    ] = await Promise.all([
      sb.from('fiche_edit_requests').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      sb.from('partner_offers').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      sb.from('partner_events').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      sb.from('partner_content').select('*', { count: 'exact', head: true }).eq('status', 'submitted'),
      sb.from('client_requests').select('*', { count: 'exact', head: true }).eq('status', 'new'),
      sb.from('portal_feedback').select('*', { count: 'exact', head: true }).eq('status', 'new'),
      sb.from('listings').select('*', { count: 'exact', head: true }).eq('status', 'review'),
    ])

    return NextResponse.json({
      approvals: (ficheEdits || 0) + (partnerOffers || 0) + (partnerEvents || 0) + (partnerContent || 0),
      requests: requests || 0,
      feedback: feedback || 0,
      marketplace_review: marketplaceReview || 0,
    })
  } catch (err) {
    console.error('Notifications fetch error:', err)
    return NextResponse.json({
      approvals: 0,
      requests: 0,
      feedback: 0,
      marketplace_review: 0,
    })
  }
}
