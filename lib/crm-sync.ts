// Fire-and-forget sync of a portal event into the CGK CRM via the `tgc-intake`
// edge function (Supabase kpzf). A CRM sync failure must NEVER break a portal
// flow (never-fail doctrine): this never throws into the caller and swallows
// all errors to the log. If TGC_INTAKE_SECRET is unset it no-ops silently, so
// the portal keeps working before/without the CRM link being provisioned.

const CRM_INTAKE_URL = 'https://kpzfplkoqqebgpxntrnt.supabase.co/functions/v1/tgc-intake'

export type CrmSyncPayload = {
  record_type?: 'client' | 'partner'
  person_name?: string
  org_name?: string
  email?: string
  phone?: string
  city?: string
  country?: string
  website?: string
  stage?: 'lead' | 'contact' | 'client'
  org_type?: string
  supplier_category?: string
  subject?: string
  summary?: string
  brief_ref?: string
  tag_labels?: string[]
}

export function syncToCrm(payload: CrmSyncPayload): void {
  const secret = process.env.TGC_INTAKE_SECRET
  if (!secret) return // link not provisioned in this environment — skip silently

  // Deliberately not awaited: the caller returns to the user immediately.
  fetch(CRM_INTAKE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-tgc-intake-secret': secret },
    body: JSON.stringify(payload),
  })
    .then(async (res) => {
      if (!res.ok) {
        console.error('[crm-sync] tgc-intake rejected:', res.status, await res.text().catch(() => ''))
      }
    })
    .catch((err) => console.error('[crm-sync] tgc-intake failed:', err))
}
