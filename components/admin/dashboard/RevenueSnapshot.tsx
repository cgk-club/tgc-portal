import Link from 'next/link'
import { formatCurrency } from '@/lib/quote'

export interface RevenueData {
  pipelineTotal: number
  feesPending: number
  collected: number
  outstanding: number
  currency: string
}

export default function RevenueSnapshot({ revenue }: { revenue: RevenueData }) {
  const cards = [
    { label: 'Pipeline Value', value: revenue.pipelineTotal, color: 'text-green', filter: 'pipeline' },
    { label: 'Fees Pending', value: revenue.feesPending, color: 'text-gold', filter: 'fees' },
    { label: 'Collected', value: revenue.collected, color: 'text-green', filter: 'collected' },
    { label: 'Outstanding', value: revenue.outstanding, color: 'text-red-600', filter: 'outstanding' },
  ]

  return (
    <div>
      <h2 className="text-sm font-medium text-gray-500 font-body uppercase tracking-wider mb-3">
        Revenue
      </h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {cards.map((c) => (
          <Link
            key={c.label}
            href={`/admin/revenue?filter=${c.filter}`}
            className="bg-white rounded-[8px] border border-gray-200 p-4 hover:border-green/40 hover:shadow-sm transition-all cursor-pointer group"
          >
            <p className="text-xs text-gray-500 font-body">{c.label}</p>
            <p className={`text-lg sm:text-xl font-heading font-semibold mt-1 ${c.color}`}>
              {formatCurrency(c.value, revenue.currency)}
            </p>
            <p className="text-[10px] text-gray-400 font-body mt-1.5 group-hover:text-green transition-colors">
              View details &rarr;
            </p>
          </Link>
        ))}
      </div>
    </div>
  )
}
