import { notFound } from 'next/navigation'
import { buildCallSheet, loadEvent } from '@/lib/events'
import CallSheetView from '@/components/event/CallSheetView'
import PrintButton from '@/components/event/PrintButton'

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

// Every guest's call sheet on paper, one page per guest per day. Works whether or
// not guest links are switched on, so a printed sheet is always possible.
export default async function PrintCallSheets({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ day?: string; guest?: string }> }) {
  const { id } = await params
  const { day, guest } = await searchParams
  const event = await loadEvent(id)
  if (!event) notFound()
  const sheets = event.guests
    .filter((g) => !guest || g.id === guest)
    .map((g) => buildCallSheet(event, g, day))
    .filter((s) => s.days.length)

  return (
    <div className="min-h-screen bg-pearl p-6 print:bg-white print:p-0">
      <div className="mx-auto mb-4 flex max-w-xl items-center justify-between font-body print:hidden">
        <p className="text-sm text-gray-500">{sheets.length} {sheets.length === 1 ? 'guest' : 'guests'} with lines to print</p>
        <PrintButton label="Print all" />
      </div>
      <div className="mx-auto max-w-xl">
        {sheets.map((s, i) => (
          <div key={i} className={i > 0 ? 'break-before-page' : ''}>
            <CallSheetView sheet={s} pageBreaks />
          </div>
        ))}
        {!sheets.length && <p className="font-body text-sm text-gray-500">No guest has a line marked for guests yet. A line appears on a call sheet when it is seen by everyone, guests included.</p>}
      </div>
    </div>
  )
}
