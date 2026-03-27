import { cn } from '@/lib/utils'

export interface UpcomingDeadlineItem {
  serviceName: string
  supplierName: string
  clientName: string
  amount: number
  currency: string
  depositDeadline: string
  daysUntil: number
  paymentStatus: string
  itineraryId: string
}

function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

function urgencyBadge(daysUntil: number): { color: string; label: string } {
  if (daysUntil < 0) return { color: 'bg-red-100 text-red-700', label: `${Math.abs(daysUntil)}d overdue` }
  if (daysUntil === 0) return { color: 'bg-red-100 text-red-700', label: 'Today' }
  if (daysUntil <= 3) return { color: 'bg-red-50 text-red-600', label: `${daysUntil}d` }
  if (daysUntil <= 7) return { color: 'bg-amber-50 text-amber-700', label: `${daysUntil}d` }
  return { color: 'bg-gray-100 text-gray-600', label: `${daysUntil}d` }
}

function statusLabel(status: string): { color: string; text: string } {
  switch (status) {
    case 'pending': return { color: 'bg-gold/20 text-gold', text: 'Pending' }
    case 'deposit_paid': return { color: 'bg-blue-50 text-blue-700', text: 'Deposit paid' }
    case 'partially_paid': return { color: 'bg-amber-50 text-amber-700', text: 'Partial' }
    default: return { color: 'bg-gray-100 text-gray-600', text: status }
  }
}

export default function UpcomingDeadlines({ deadlines }: { deadlines: UpcomingDeadlineItem[] }) {
  if (deadlines.length === 0) {
    return (
      <div>
        <h2 className="text-sm font-medium text-gray-500 font-body uppercase tracking-wider mb-3">
          Upcoming Deadlines
        </h2>
        <div className="bg-white rounded-[8px] border border-gray-200 p-4 text-center">
          <p className="text-sm text-gray-400 font-body">No upcoming deadlines</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-sm font-medium text-gray-500 font-body uppercase tracking-wider mb-3">
        Upcoming Deadlines <span className="text-[10px] text-gray-400 normal-case">(next 14 days)</span>
      </h2>
      <div className="bg-white rounded-[8px] border border-gray-200">
        {deadlines.map((d, i) => {
          const urgency = urgencyBadge(d.daysUntil)
          const status = statusLabel(d.paymentStatus)
          const dateStr = new Date(d.depositDeadline).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
          })

          return (
            <div
              key={`${d.itineraryId}-${d.serviceName}-${i}`}
              className={cn(
                'p-3',
                i < deadlines.length - 1 && 'border-b border-gray-50'
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 font-body font-medium truncate">{d.serviceName}</p>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    <span className="text-[10px] text-gray-400 font-body">{d.supplierName}</span>
                    <span className="text-[10px] text-gray-300">|</span>
                    <span className="text-[10px] text-gray-500 font-body">{d.clientName}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-medium text-gray-800 font-body">
                      {formatCurrency(d.amount, d.currency)}
                    </span>
                    <span className="text-[10px] text-gray-400 font-body">due {dateStr}</span>
                    <span className={cn(
                      'text-[10px] font-medium px-1.5 py-0.5 rounded',
                      status.color
                    )}>
                      {status.text}
                    </span>
                  </div>
                </div>
                <span className={cn(
                  'text-[10px] font-bold px-2 py-1 rounded shrink-0',
                  urgency.color
                )}>
                  {urgency.label}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
