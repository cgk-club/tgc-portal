import { dayLabel, ITEM_TYPE_LABELS, timeRange, type ItemStatus } from '@/lib/event-vocab'
import { StatusChip } from '@/components/event/EventBits'

interface PublicLine {
  id: string
  item_type: string
  custom_title: string | null
  custom_note: string | null
  exact_time: string | null
  end_time?: string | null
  location?: string | null
  location_confirmed?: boolean
  status?: ItemStatus
}

interface Props {
  day: { id: string; day_number: number; date: string | null; title: string | null; items?: PublicLine[] }
  view: 'summary' | 'full'
}

// An event day as the client sees it. Summary: the times and what happens, with
// status. Full: the run of show, with places and notes. Team-only lines are
// removed before this component is ever reached. Status is always shown, so a
// planned line never reads as a booked one.
export default function ClientEventDay({ day, view }: Props) {
  const lines = [...(day.items || [])].sort((a, b) => (a.exact_time || '99').localeCompare(b.exact_time || '99'))
  return (
    <section className="mb-12">
      <div className="mb-5 border-b-2 border-green pb-2">
        <h3 className="font-heading text-base font-semibold text-green sm:text-lg">{day.date ? dayLabel(day.date) : `Day ${day.day_number}`}</h3>
        {day.title && <p className="mt-1 text-sm text-gray-500 font-body">{day.title}</p>}
      </div>
      <ol className="font-body">
        {lines.map((line) => (
          <li key={line.id} className={`grid grid-cols-[88px_1fr] gap-4 border-b border-gray-100 py-3 last:border-0 ${line.status === 'cancelled' ? 'opacity-60' : ''}`}>
            <span className="font-mono text-sm tabular-nums text-gray-600">{timeRange({ exact_time: line.exact_time, end_time: line.end_time || null }) || '·'}</span>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-[15px] text-gray-900">{line.custom_title || ITEM_TYPE_LABELS[line.item_type] || ''}</p>
                {line.status && <StatusChip status={line.status} />}
              </div>
              {view === 'full' && line.location && (
                <p className="text-sm text-gray-500">{line.location}{!line.location_confirmed ? ', to be confirmed' : ''}</p>
              )}
              {view === 'full' && line.custom_note && <p className="mt-0.5 text-sm text-gray-500">{line.custom_note}</p>}
            </div>
          </li>
        ))}
        {!lines.length && <li className="py-3 text-sm italic text-gray-400">Details to follow.</li>}
      </ol>
    </section>
  )
}
