import Link from 'next/link'
import { formatCurrency } from '@/lib/quote'

export interface RevenueData {
  tgcRevenue: number
  commissionsEarned: number
  feesAndRetainers: number
  partnerRevenue: number
  currency: string
}

export default function RevenueSnapshot({ revenue }: { revenue: RevenueData }) {
  const cards = [
    { label: 'TGC Revenue', value: revenue.tgcRevenue, color: 'text-green', filter: 'tgc_revenue' },
    { label: 'Commissions', value: revenue.commissionsEarned, color: 'text-gold', filter: 'commissions' },
    { label: 'Fees & Retainers', value: revenue.feesAndRetainers, color: 'text-green', filter: 'fees' },
    { label: 'Partner Revenue', value: revenue.partnerRevenue, color: 'text-blue-600', filter: 'partner_revenue' },
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
