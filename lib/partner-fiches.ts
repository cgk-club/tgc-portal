import { SupabaseClient } from '@supabase/supabase-js'

// A partner owns a fiche if the fiche is directly linked to their partner
// account (partner_account_id), or the fiche's org (airtable_record_id) is in
// the account's org_ids. Mirrors the ownership rule that
// app/api/partner/fiches/route.ts uses to list a partner's fiches.
export async function partnerOwnsFiche(
  sb: SupabaseClient,
  partnerId: string,
  ficheId: string,
): Promise<boolean> {
  const { data: fiche } = await sb
    .from('fiches')
    .select('partner_account_id, airtable_record_id')
    .eq('id', ficheId)
    .maybeSingle()
  if (!fiche) return false
  if (fiche.partner_account_id === partnerId) return true
  if (!fiche.airtable_record_id) return false
  const { data: account } = await sb
    .from('partner_accounts')
    .select('org_ids')
    .eq('id', partnerId)
    .single()
  const orgIds: string[] = account?.org_ids || []
  return orgIds.includes(fiche.airtable_record_id)
}
