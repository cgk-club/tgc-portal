import { notFound } from 'next/navigation'
import { audienceLabel, dayLabel, ITEM_TYPE_LABELS, loadEvent, STATUS_LABELS, timeRange } from '@/lib/events'
import PrintButton from '@/components/event/PrintButton'

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

// The team's paper copy of a day (or the whole event): everything, team lines included.
// Behind the admin login, like the rest of /admin.
export default async function PrintRunOfShow({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ day?: string }> }) {
  const { id } = await params
  const { day } = await searchParams
  const event = await loadEvent(id)
  if (!event) notFound()
  const days = event.days.filter((d) => !day || d.id === day)

  return (
    <div className="min-h-screen bg-white p-6 font-body text-ink print:p-0">
      <div className="mb-4 flex items-center justify-between print:hidden">
        <p className="text-sm text-gray-500">Run of show, printable</p>
        <PrintButton />
      </div>
      {days.map((d, i) => (
        <section key={d.id} className={i > 0 ? 'mt-10 break-before-page' : ''}>
          <header className="mb-3 border-b-2 border-ink pb-2">
            <p className="text-[11px] uppercase tracking-[0.14em] text-gray-500">{event.title} · {event.client_name}</p>
            <h1 className="font-heading text-xl font-semibold">{d.date ? dayLabel(d.date) : `Day ${d.day_number}`}{d.title ? `, ${d.title}` : ''}</h1>
          </header>
          <table className="w-full text-[12px]">
            <thead className="text-left text-[10px] uppercase tracking-wider text-gray-500">
              <tr><th className="py-1 pr-2">Time</th><th className="py-1 pr-2">What</th><th className="py-1 pr-2">Who</th><th className="py-1 pr-2">Where</th><th className="py-1 pr-2">Logistics</th><th className="py-1">Status</th></tr>
            </thead>
            <tbody>
              {d.items.map((item) => (
                <tr key={item.id} className="border-t border-gray-200 align-top">
                  <td className="whitespace-nowrap py-1.5 pr-2 font-mono">{timeRange(item) || '·'}</td>
                  <td className="py-1.5 pr-2">{item.custom_title || ITEM_TYPE_LABELS[item.item_type]}{item.visibility === 'team' ? ' (team)' : ''}{item.custom_note ? <span className="block text-gray-500">{item.custom_note}</span> : null}</td>
                  <td className="py-1.5 pr-2">{audienceLabel(item, event.guests)}</td>
                  <td className="py-1.5 pr-2">{item.location}{item.location && !item.location_confirmed ? ' (unconfirmed)' : ''}</td>
                  <td className="py-1.5 pr-2 text-gray-600">
                    {[
                      item.logistics?.pickup_place && `From ${item.logistics.pickup_place}${item.logistics.dropoff_place ? ` to ${item.logistics.dropoff_place}` : ''}`,
                      item.logistics?.vehicle,
                      item.logistics?.driver_name && `${item.logistics.driver_name}${item.logistics.driver_phone ? ` ${item.logistics.driver_phone}` : ''}`,
                      item.logistics?.covers ? `${item.logistics.covers} covers` : null,
                      item.logistics?.venue_contact,
                    ].filter(Boolean).join(' · ')}
                  </td>
                  <td className="py-1.5">{STATUS_LABELS[item.status]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ))}
    </div>
  )
}
