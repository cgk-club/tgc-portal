import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET() {
  const sb = getSupabaseAdmin()

  // Fetch edit requests
  const { data: editRequests, error } = await sb
    .from('fiche_edit_requests')
    .select('*')
    .order('submitted_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!editRequests || editRequests.length === 0) return NextResponse.json([])

  // Get unique partner and fiche IDs
  const partnerIds = Array.from(new Set(editRequests.map(r => r.partner_id).filter(Boolean)))
  const ficheIds = Array.from(new Set(editRequests.map(r => r.fiche_id).filter(Boolean)))

  // Fetch partners and fiches separately
  const [partnersRes, fichesRes] = await Promise.all([
    partnerIds.length > 0
      ? sb.from('partner_accounts').select('id, org_name, email').in('id', partnerIds)
      : Promise.resolve({ data: [] }),
    ficheIds.length > 0
      ? sb.from('fiches').select('id, slug, headline').in('id', ficheIds)
      : Promise.resolve({ data: [] }),
  ])

  const partnersMap = new Map((partnersRes.data || []).map(p => [p.id, p]))
  const fichesMap = new Map((fichesRes.data || []).map(f => [f.id, f]))

  // Merge
  const result = editRequests.map(r => ({
    ...r,
    partner: partnersMap.get(r.partner_id) || null,
    fiche: fichesMap.get(r.fiche_id) || null,
  }))

  return NextResponse.json(result)
}
