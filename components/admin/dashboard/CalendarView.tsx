'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'

export interface CalendarEvent {
  date: string // YYYY-MM-DD
  label: string
  type: 'trip_start' | 'trip_end' | 'payment_deadline'
  itineraryId: string
}

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

function dotColor(type: CalendarEvent['type']): string {
  switch (type) {
    case 'trip_start':
    case 'trip_end':
      return 'bg-green'
    case 'payment_deadline':
      return 'bg-gold'
    default:
      return 'bg-gray-400'
  }
}

function typeLabel(type: CalendarEvent['type']): string {
  switch (type) {
    case 'trip_start': return 'Trip starts'
    case 'trip_end': return 'Trip ends'
    case 'payment_deadline': return 'Payment due'
    default: return ''
  }
}

export default function CalendarView({ events }: { events: CalendarEvent[] }) {
  const router = useRouter()
  const today = new Date()
  const [currentMonth, setCurrentMonth] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  )

  const year = currentMonth.getFullYear()
  const month = currentMonth.getMonth()

  // Build event lookup by date string
  const eventsByDate = useMemo(() => {
    const map: Record<string, CalendarEvent[]> = {}
    for (const ev of events) {
      if (!map[ev.date]) map[ev.date] = []
      map[ev.date].push(ev)
    }
    return map
  }, [events])

  // Calendar grid
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const totalDays = lastDay.getDate()
  // getDay(): 0=Sun, we want Mon=0
  const startOffset = (firstDay.getDay() + 6) % 7

  const cells: (number | null)[] = []
  for (let i = 0; i < startOffset; i++) cells.push(null)
  for (let d = 1; d <= totalDays; d++) cells.push(d)
  // Pad to complete rows
  while (cells.length % 7 !== 0) cells.push(null)

  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

  function dateStr(day: number): string {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  }

  function prev() {
    setCurrentMonth(new Date(year, month - 1, 1))
  }
  function next() {
    setCurrentMonth(new Date(year, month + 1, 1))
  }

  // Events for current month (mobile list)
  const monthEvents = useMemo(() => {
    return events
      .filter((ev) => {
        const d = new Date(ev.date)
        return d.getFullYear() === year && d.getMonth() === month
      })
      .sort((a, b) => a.date.localeCompare(b.date))
  }, [events, year, month])

  return (
    <div>
      <h2 className="text-sm font-medium text-gray-500 font-body uppercase tracking-wider mb-3">
        Calendar
      </h2>
      <div className="bg-white rounded-[8px] border border-gray-200 p-4">
        {/* Month nav */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={prev}
            className="p-2 hover:bg-gray-100 rounded transition-colors text-gray-600"
            aria-label="Previous month"
          >
            &#8249;
          </button>
          <span className="text-sm font-heading font-semibold text-gray-900">
            {MONTHS[month]} {year}
          </span>
          <button
            onClick={next}
            className="p-2 hover:bg-gray-100 rounded transition-colors text-gray-600"
            aria-label="Next month"
          >
            &#8250;
          </button>
        </div>

        {/* Desktop grid */}
        <div className="hidden sm:block">
          <div className="grid grid-cols-7 mb-1">
            {DAYS.map((d) => (
              <div key={d} className="text-[10px] font-medium text-gray-400 text-center py-1">
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {cells.map((day, i) => {
              if (day === null) {
                return <div key={i} className="h-12" />
              }
              const ds = dateStr(day)
              const dayEvents = eventsByDate[ds] || []
              const isToday = ds === todayStr

              return (
                <div
                  key={i}
                  className={`h-12 flex flex-col items-center justify-start pt-1 rounded cursor-default transition-colors ${
                    isToday ? 'bg-green-muted' : ''
                  } ${dayEvents.length > 0 ? 'cursor-pointer hover:bg-gray-50' : ''}`}
                  onClick={() => {
                    if (dayEvents.length > 0) {
                      router.push(`/admin/itineraries/${dayEvents[0].itineraryId}`)
                    }
                  }}
                  title={dayEvents.map((e) => `${typeLabel(e.type)}: ${e.label}`).join('\n')}
                >
                  <span
                    className={`text-xs font-body ${
                      isToday ? 'font-semibold text-green' : 'text-gray-700'
                    }`}
                  >
                    {day}
                  </span>
                  {dayEvents.length > 0 && (
                    <div className="flex gap-0.5 mt-0.5">
                      {dayEvents.slice(0, 3).map((ev, j) => (
                        <span
                          key={j}
                          className={`w-1.5 h-1.5 rounded-full ${dotColor(ev.type)}`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Mobile list */}
        <div className="sm:hidden">
          {monthEvents.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">No events this month</p>
          ) : (
            <div className="space-y-2">
              {monthEvents.map((ev, i) => {
                const d = new Date(ev.date)
                const dayNum = d.getDate()
                const dayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()]
                return (
                  <button
                    key={i}
                    onClick={() => router.push(`/admin/itineraries/${ev.itineraryId}`)}
                    className="w-full flex items-center gap-3 p-2 rounded hover:bg-gray-50 transition-colors text-left"
                  >
                    <div className="text-center w-10 shrink-0">
                      <p className="text-lg font-heading font-semibold text-gray-900">{dayNum}</p>
                      <p className="text-[10px] text-gray-400 uppercase">{dayName}</p>
                    </div>
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`w-2 h-2 rounded-full shrink-0 ${dotColor(ev.type)}`} />
                      <div className="min-w-0">
                        <p className="text-sm text-gray-700 truncate">{ev.label}</p>
                        <p className="text-[10px] text-gray-400">{typeLabel(ev.type)}</p>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
