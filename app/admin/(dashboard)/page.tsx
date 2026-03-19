import Link from 'next/link'
import { getSupabaseAdmin } from '@/lib/supabase'
import { getOrgById } from '@/lib/airtable'
import { TEMPLATE_LABELS, FicheTemplate, getTemplate } from '@/lib/ficheTemplates'

export const dynamic = 'force-dynamic'

export default async function AdminDashboard() {
  const sb = getSupabaseAdmin()

  // Fetch all counts in parallel
  const [
    { count: totalFiches },
    { count: liveFiches },
    { count: draftFiches },
    { count: totalItineraries },
    { count: draftItineraries },
    { count: sharedItineraries },
    { count: totalClients },
    { data: allFiches },
    { data: draftFichesForInbox },
  ] = await Promise.all([
    sb.from('fiches').select('*', { count: 'exact', head: true }),
    sb.from('fiches').select('*', { count: 'exact', head: true }).eq('status', 'live'),
    sb.from('fiches').select('*', { count: 'exact', head: true }).eq('status', 'draft'),
    sb.from('itineraries').select('*', { count: 'exact', head: true }),
    sb.from('itineraries').select('*', { count: 'exact', head: true }).eq('status', 'draft'),
    sb.from('itineraries').select('*', { count: 'exact', head: true }).eq('status', 'shared'),
    sb.from('client_accounts').select('*', { count: 'exact', head: true }),
    sb.from('fiches').select('id, airtable_record_id, template_type'),
    sb.from('fiches')
      .select('id, airtable_record_id, slug, hero_image_url, headline, description, highlights, gallery_urls, tags')
      .eq('status', 'draft')
      .order('created_at', { ascending: false })
      .limit(5),
  ])

  // For fiches still on 'default', look up Airtable category to compute real template
  const templateCounts: Record<string, number> = {}
  const backfillUpdates: { id: string; template_type: string }[] = []

  await Promise.all(
    (allFiches || []).map(async (fiche) => {
      let t = fiche.template_type as string
      if (!t || t === 'default') {
        // Look up the org to derive the template
        const org = await getOrgById(fiche.airtable_record_id)
        const derived = getTemplate(org?.categorySub)
        t = derived
        // Queue a backfill so we don't have to do this every time
        if (derived !== 'default' && derived !== fiche.template_type) {
          backfillUpdates.push({ id: fiche.id, template_type: derived })
        }
      }
      templateCounts[t] = (templateCounts[t] || 0) + 1
    })
  )

  // Backfill template_type in background (non-blocking)
  if (backfillUpdates.length > 0) {
    Promise.all(
      backfillUpdates.map((u) =>
        sb.from('fiches').update({ template_type: u.template_type }).eq('id', u.id)
      )
    ).catch(() => {})
  }

  // Sort by count descending
  const sortedTemplates = Object.entries(templateCounts).sort((a, b) => b[1] - a[1])

  // Enrichment score for inbox fiches
  function getEnrichmentScore(f: { hero_image_url?: string | null; description?: string | null; headline?: string | null; highlights?: unknown[]; gallery_urls?: unknown[]; tags?: unknown[] }): number {
    let score = 0
    if (f.hero_image_url) score += 30
    if (f.description) score += 25
    if (f.headline) score += 15
    if (f.highlights && f.highlights.length >= 3) score += 15
    if (f.gallery_urls && f.gallery_urls.length >= 3) score += 10
    if (f.tags && f.tags.length >= 3) score += 5
    return score
  }

  // Enrich inbox fiches with org names
  const inboxFiches = await Promise.all(
    (draftFichesForInbox || []).map(async (f) => {
      const org = await getOrgById(f.airtable_record_id)
      const score = getEnrichmentScore(f)
      return { ...f, orgName: org?.name || f.slug, orgCity: org?.city || '', score }
    })
  )

  return (
    <div className="p-8">
      <h1 className="font-heading text-2xl font-semibold text-green mb-8">Dashboard</h1>

      {/* Top-level stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-[8px] border border-gray-200 p-6">
          <p className="text-sm text-gray-500 font-body">Fiches</p>
          <p className="text-3xl font-heading font-semibold text-green mt-1">{totalFiches || 0}</p>
          <p className="text-xs text-gray-400 font-body mt-1">
            {liveFiches || 0} live · {draftFiches || 0} draft
          </p>
        </div>
        <div className="bg-white rounded-[8px] border border-gray-200 p-6">
          <p className="text-sm text-gray-500 font-body">Itineraries</p>
          <p className="text-3xl font-heading font-semibold text-green mt-1">{totalItineraries || 0}</p>
          <p className="text-xs text-gray-400 font-body mt-1">
            {sharedItineraries || 0} shared · {draftItineraries || 0} draft
          </p>
        </div>
        <div className="bg-white rounded-[8px] border border-gray-200 p-6">
          <p className="text-sm text-gray-500 font-body">Clients</p>
          <p className="text-3xl font-heading font-semibold text-green mt-1">{totalClients || 0}</p>
        </div>
        <div className="bg-white rounded-[8px] border border-gray-200 p-6">
          <p className="text-sm text-gray-500 font-body">Live rate</p>
          <p className="text-3xl font-heading font-semibold text-gold mt-1">
            {totalFiches ? Math.round(((liveFiches || 0) / totalFiches) * 100) : 0}%
          </p>
        </div>
      </div>

      {/* Fiches by template type */}
      <div className="bg-white rounded-[8px] border border-gray-200 p-6 mb-8">
        <h2 className="text-sm font-medium text-gray-500 font-body uppercase tracking-wider mb-4">
          Fiches by type
        </h2>
        <div className="space-y-3">
          {sortedTemplates.map(([template, count]) => {
            const label = TEMPLATE_LABELS[template as FicheTemplate] || template
            const pct = totalFiches ? Math.round((count / totalFiches) * 100) : 0
            return (
              <div key={template}>
                <div className="flex items-center justify-between text-sm font-body mb-1">
                  <span className="text-gray-700">{label}</span>
                  <span className="text-gray-500">{count} <span className="text-gray-400">({pct}%)</span></span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-green"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Fiche Inbox */}
      {inboxFiches.length > 0 && (
        <div className="bg-white rounded-[8px] border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium text-gray-500 font-body uppercase tracking-wider">
              Fiche Inbox
            </h2>
            <span className="text-xs text-gold font-medium font-body bg-gold-light px-2 py-0.5 rounded-full">
              {draftFiches || 0} drafts
            </span>
          </div>
          <div className="space-y-3">
            {inboxFiches.map((f) => (
              <Link
                key={f.id}
                href={`/admin/fiches/${f.id}`}
                className="flex items-center justify-between p-3 rounded-[4px] border border-gray-100 hover:border-green hover:bg-green-muted transition-colors group"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900 group-hover:text-green">{f.orgName}</p>
                  {f.orgCity && (
                    <p className="text-xs text-gray-400">{f.orgCity}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-green"
                      style={{ width: `${f.score}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-400 w-8 text-right">{f.score}%</span>
                </div>
              </Link>
            ))}
          </div>
          {(draftFiches || 0) > 5 && (
            <Link
              href="/admin/fiches?status=draft"
              className="block text-center text-sm text-green hover:text-green-light font-medium font-body mt-4"
            >
              View all drafts
            </Link>
          )}
        </div>
      )}

      {/* Quick links */}
      <div className="flex flex-wrap gap-4">
        <Link
          href="/admin/fiches"
          className="inline-flex items-center justify-center rounded-[4px] bg-green text-white px-6 py-3 font-body font-medium hover:bg-green-light transition-colors"
        >
          Manage Fiches
        </Link>
        <Link
          href="/admin/itineraries"
          className="inline-flex items-center justify-center rounded-[4px] border border-green text-green px-6 py-3 font-body font-medium hover:bg-green-muted transition-colors"
        >
          Manage Itineraries
        </Link>
        <Link
          href="/admin/clients"
          className="inline-flex items-center justify-center rounded-[4px] border border-green text-green px-6 py-3 font-body font-medium hover:bg-green-muted transition-colors"
        >
          Manage Clients
        </Link>
      </div>
    </div>
  )
}
