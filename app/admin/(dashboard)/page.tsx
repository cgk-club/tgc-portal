import Link from 'next/link'
import { getSupabaseAdmin } from '@/lib/supabase'
import { TEMPLATE_LABELS, FicheTemplate } from '@/lib/ficheTemplates'

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
    { data: fichesByTemplate },
  ] = await Promise.all([
    sb.from('fiches').select('*', { count: 'exact', head: true }),
    sb.from('fiches').select('*', { count: 'exact', head: true }).eq('status', 'live'),
    sb.from('fiches').select('*', { count: 'exact', head: true }).eq('status', 'draft'),
    sb.from('itineraries').select('*', { count: 'exact', head: true }),
    sb.from('itineraries').select('*', { count: 'exact', head: true }).eq('status', 'draft'),
    sb.from('itineraries').select('*', { count: 'exact', head: true }).eq('status', 'shared'),
    sb.from('client_accounts').select('*', { count: 'exact', head: true }),
    sb.from('fiches').select('template_type'),
  ])

  // Count fiches by template type
  const templateCounts: Record<string, number> = {}
  for (const row of fichesByTemplate || []) {
    const t = (row.template_type as string) || 'default'
    templateCounts[t] = (templateCounts[t] || 0) + 1
  }

  // Sort by count descending
  const sortedTemplates = Object.entries(templateCounts).sort((a, b) => b[1] - a[1])

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
