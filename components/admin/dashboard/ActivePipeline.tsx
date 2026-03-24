import Link from 'next/link'
import { formatCurrency } from '@/lib/quote'
import { formatDate } from '@/lib/utils'

export interface PipelineItem {
  id: string
  clientName: string
  title: string
  status: 'draft' | 'shared'
  startDate: string | null
  currency: string
  itemsPaid: number
  itemsTotal: number
  amountCollected: number
  amountTotal: number
  daysUntilTrip: number | null
  openChoices: number
}

export default function ActivePipeline({ pipeline }: { pipeline: PipelineItem[] }) {
  if (pipeline.length === 0) {
    return (
      <div className="mb-6">
        <h2 className="text-sm font-medium text-gray-500 font-body uppercase tracking-wider mb-3">
          Active Pipeline
        </h2>
        <div className="bg-white rounded-[8px] border border-gray-200 p-6 text-center">
          <p className="text-sm text-gray-400">No active itineraries</p>
        </div>
      </div>
    )
  }

  return (
    <div className="mb-6">
      <h2 className="text-sm font-medium text-gray-500 font-body uppercase tracking-wider mb-3">
        Active Pipeline
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {pipeline.map((p) => {
          const progressPct = p.amountTotal > 0
            ? Math.round((p.amountCollected / p.amountTotal) * 100)
            : 0

          return (
            <Link
              key={p.id}
              href={`/admin/itineraries/${p.id}`}
              className="bg-white rounded-[8px] border border-gray-200 p-4 sm:p-5 hover:border-green hover:shadow-sm transition-all group block"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900 group-hover:text-green truncate">
                    {p.clientName}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{p.title}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {p.daysUntilTrip !== null && (
                    <span className="text-xs text-gray-400 font-body">
                      {p.daysUntilTrip <= 0 ? 'Now' : `in ${p.daysUntilTrip}d`}
                    </span>
                  )}
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      p.status === 'shared'
                        ? 'bg-blue-50 text-blue-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {p.status === 'shared' ? 'Shared' : 'Draft'}
                  </span>
                </div>
              </div>

              {/* Dates */}
              {p.startDate && (
                <p className="text-xs text-gray-400 mb-3">
                  {formatDate(p.startDate)}
                </p>
              )}

              {/* Payment progress */}
              {p.itemsTotal > 0 && (
                <div>
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5">
                    <span>{p.itemsPaid}/{p.itemsTotal} items paid</span>
                    <span>{formatCurrency(p.amountCollected, p.currency)} / {formatCurrency(p.amountTotal, p.currency)}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-green transition-all"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Open choices */}
              {p.openChoices > 0 && (
                <p className="text-xs text-amber-600 mt-2">
                  {p.openChoices} open choice{p.openChoices > 1 ? 's' : ''} awaiting client
                </p>
              )}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
