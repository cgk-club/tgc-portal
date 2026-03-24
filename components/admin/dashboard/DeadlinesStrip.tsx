import Link from 'next/link'

export interface DeadlineItem {
  type: 'payment_deadline' | 'payment_overdue' | 'choice_open'
  urgency: 'red' | 'amber'
  label: string
  clientName: string
  itineraryId: string
}

export default function DeadlinesStrip({ deadlines }: { deadlines: DeadlineItem[] }) {
  if (deadlines.length === 0) return null

  return (
    <div className="mb-6">
      <h2 className="text-sm font-medium text-gray-500 font-body uppercase tracking-wider mb-3">
        Attention Required
      </h2>
      <div className="space-y-2">
        {deadlines.map((d, i) => (
          <Link
            key={i}
            href={`/admin/itineraries/${d.itineraryId}`}
            className={`block bg-white rounded-[8px] border p-3 sm:p-4 hover:bg-gray-50 transition-colors ${
              d.urgency === 'red'
                ? 'border-l-4 border-l-red-500 border-gray-200'
                : 'border-l-4 border-l-amber-400 border-gray-200'
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{d.label}</p>
                <p className="text-xs text-gray-500 mt-0.5">{d.clientName}</p>
              </div>
              <span
                className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded-full ${
                  d.urgency === 'red'
                    ? 'bg-red-50 text-red-700'
                    : 'bg-amber-50 text-amber-700'
                }`}
              >
                {d.type === 'payment_overdue'
                  ? 'Overdue'
                  : d.type === 'payment_deadline'
                    ? 'Due soon'
                    : 'Awaiting decision'}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
