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
    { label: 'Pipeline Value', value: revenue.pipelineTotal, color: 'text-green' },
    { label: 'Fees Pending', value: revenue.feesPending, color: 'text-gold' },
    { label: 'Collected', value: revenue.collected, color: 'text-green' },
    { label: 'Outstanding', value: revenue.outstanding, color: 'text-red-600' },
  ]

  return (
    <div>
      <h2 className="text-sm font-medium text-gray-500 font-body uppercase tracking-wider mb-3">
        Revenue
      </h2>
      <div className="grid grid-cols-2 gap-3">
        {cards.map((c) => (
          <div key={c.label} className="bg-white rounded-[8px] border border-gray-200 p-4">
            <p className="text-xs text-gray-500 font-body">{c.label}</p>
            <p className={`text-lg sm:text-xl font-heading font-semibold mt-1 ${c.color}`}>
              {formatCurrency(c.value, revenue.currency)}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
