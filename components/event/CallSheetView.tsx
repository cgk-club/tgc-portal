import { dayLabel, ITEM_TYPE_LABELS, timeRange, type CallSheetData } from '@/lib/event-vocab'

// One guest's call sheet. Used by the guest's private link and by the admin's
// printable sheets, so both always say the same thing. A venue prints only once
// it is confirmed; until then the line says the address will follow.
export default function CallSheetView({ sheet, pageBreaks = false }: { sheet: CallSheetData; pageBreaks?: boolean }) {
  return (
    <>
      {sheet.days.map((day, i) => (
        <article
          key={day.id}
          className={`call-sheet bg-white border border-gray-200 rounded-[4px] p-6 sm:p-8 mb-6 ${pageBreaks && i > 0 ? 'break-before-page' : ''}`}
        >
          <header className="border-b-2 border-ink pb-3 mb-2">
            <p className="text-[11px] uppercase tracking-[0.14em] text-gray-500 font-body">
              Call sheet · {dayLabel(day.date)}
              {day.title ? ` · ${day.title}` : ''}
            </p>
            <h2 className="font-heading text-xl font-semibold text-ink mt-1">{sheet.guest.name}</h2>
            {(sheet.guest.hotel || sheet.guest.room) && (
              <p className="text-sm text-gray-500 font-body mt-0.5">
                {[sheet.guest.hotel, sheet.guest.room ? `room ${sheet.guest.room}` : null].filter(Boolean).join(', ')}
              </p>
            )}
          </header>
          <ol>
            {day.lines.map((line) => (
              <li key={line.id} className="grid grid-cols-[72px_1fr] gap-4 py-3 border-b border-dotted border-gray-200 last:border-0">
                <span className="font-mono text-sm tabular-nums text-ink">{timeRange(line) || '·'}</span>
                <div className="font-body">
                  <p className="text-[15px] text-ink">
                    {line.title || ITEM_TYPE_LABELS[line.item_type]}
                  </p>
                  {line.pickup && <p className="text-sm text-gray-500">From {line.pickup}</p>}
                  {line.location && <p className="text-sm text-gray-500">{line.location}</p>}
                  {line.location_pending && <p className="text-sm text-amber-700">Address to follow</p>}
                  {line.note && <p className="text-sm text-gray-500 mt-0.5">{line.note}</p>}
                </div>
              </li>
            ))}
          </ol>
          <footer className="mt-4 flex flex-wrap justify-between gap-2 text-xs text-gray-400 font-body">
            <span>{sheet.event.title}</span>
            <span>The Gatekeepers Club</span>
          </footer>
        </article>
      ))}
    </>
  )
}
