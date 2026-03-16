import Link from 'next/link'
import { getSupabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export default async function AdminDashboard() {
  const sb = getSupabaseAdmin()

  const { count: totalFiches } = await sb
    .from('fiches')
    .select('*', { count: 'exact', head: true })

  const { count: liveFiches } = await sb
    .from('fiches')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'live')

  const { count: draftFiches } = await sb
    .from('fiches')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'draft')

  return (
    <div className="p-8">
      <h1 className="font-heading text-2xl font-semibold text-green mb-8">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-[8px] border border-gray-200 p-6">
          <p className="text-sm text-gray-500 font-body">Total Fiches</p>
          <p className="text-3xl font-heading font-semibold text-green mt-1">{totalFiches || 0}</p>
        </div>
        <div className="bg-white rounded-[8px] border border-gray-200 p-6">
          <p className="text-sm text-gray-500 font-body">Live</p>
          <p className="text-3xl font-heading font-semibold text-green mt-1">{liveFiches || 0}</p>
        </div>
        <div className="bg-white rounded-[8px] border border-gray-200 p-6">
          <p className="text-sm text-gray-500 font-body">Drafts</p>
          <p className="text-3xl font-heading font-semibold text-gold mt-1">{draftFiches || 0}</p>
        </div>
      </div>

      <div className="flex gap-4">
        <Link
          href="/admin/fiches"
          className="inline-flex items-center justify-center rounded-[4px] bg-green text-white px-6 py-3 font-body font-medium hover:bg-green-light transition-colors"
        >
          Manage Fiches
        </Link>
      </div>
    </div>
  )
}
