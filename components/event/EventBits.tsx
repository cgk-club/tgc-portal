import { ITEM_TYPE_LABELS, STATUS_LABELS, VISIBILITY_LABELS, type ItemStatus, type Visibility } from '@/lib/event-vocab'

const STATUS_STYLES: Record<ItemStatus, string> = {
  planned: 'text-gray-500 border-gray-300',
  requested: 'text-amber-700 border-amber-400',
  confirmed: 'text-emerald-700 border-emerald-500',
  paid: 'text-green border-green',
  changed: 'text-orange-700 border-orange-500 bg-orange-50',
  done: 'text-gray-400 border-gray-200 bg-gray-50',
  cancelled: 'text-gray-400 border-gray-300 line-through',
}

export function StatusChip({ status, className = '' }: { status: ItemStatus; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2 py-0.5 text-[11px] font-medium font-body ${STATUS_STYLES[status]} ${className}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
      {STATUS_LABELS[status]}
    </span>
  )
}

const VIS_SHORT: Record<Visibility, string> = { team: 'Team', client: 'Client', guests: 'Guests' }

export function VisibilityTag({ visibility }: { visibility: Visibility }) {
  return (
    <span
      title={VISIBILITY_LABELS[visibility]}
      className={`inline-block whitespace-nowrap rounded-[4px] border px-1.5 py-0.5 text-[10px] uppercase tracking-wider font-body ${
        visibility === 'team' ? 'border-green/30 bg-green-muted text-green' : 'border-gray-200 text-gray-500'
      }`}
    >
      {VIS_SHORT[visibility]}
    </span>
  )
}

export function TypeLabel({ type }: { type: string }) {
  return <span className="text-[11px] uppercase tracking-wider text-gold-muted font-body">{ITEM_TYPE_LABELS[type] || type}</span>
}
