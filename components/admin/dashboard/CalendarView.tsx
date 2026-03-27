'use client'

import { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

export interface CalendarEvent {
  date: string // YYYY-MM-DD
  label: string
  type: 'trip_start' | 'trip_end' | 'payment_deadline' | 'gcal' | 'task'
  itineraryId?: string
  time?: string // e.g. "10:00"
  taskId?: string
}

type ViewMode = 'day' | 'week' | 'month'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]
const HOURS = Array.from({ length: 13 }, (_, i) => i + 8) // 8:00 - 20:00

function dotColor(type: CalendarEvent['type']): string {
  switch (type) {
    case 'trip_start':
    case 'trip_end':
      return 'bg-green'
    case 'payment_deadline':
      return 'bg-gold'
    case 'gcal':
      return 'bg-blue-500'
    case 'task':
      return 'bg-purple-500'
    default:
      return 'bg-gray-400'
  }
}

function eventBgColor(type: CalendarEvent['type']): string {
  switch (type) {
    case 'trip_start':
    case 'trip_end':
      return 'bg-green/10 border-green/30 text-green'
    case 'payment_deadline':
      return 'bg-gold/10 border-gold/30 text-gold'
    case 'gcal':
      return 'bg-blue-50 border-blue-200 text-blue-700'
    case 'task':
      return 'bg-purple-50 border-purple-200 text-purple-700'
    default:
      return 'bg-gray-50 border-gray-200 text-gray-600'
  }
}

function typeLabel(type: CalendarEvent['type']): string {
  switch (type) {
    case 'trip_start': return 'Trip starts'
    case 'trip_end': return 'Trip ends'
    case 'payment_deadline': return 'Payment due'
    case 'gcal': return 'Calendar'
    case 'task': return 'Task'
    default: return ''
  }
}

function toDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function getMonday(d: Date): Date {
  const result = new Date(d)
  const day = result.getDay()
  const diff = day === 0 ? -6 : 1 - day
  result.setDate(result.getDate() + diff)
  return result
}

export default function CalendarView({ events }: { events: CalendarEvent[] }) {
  const router = useRouter()
  const today = new Date()
  const todayStr = toDateStr(today)

  const [viewMode, setViewMode] = useState<ViewMode>('month')
  const [currentDate, setCurrentDate] = useState(today)
  const [gcalEvents, setGcalEvents] = useState<CalendarEvent[]>([])

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  // Fetch Google Calendar events when the visible range changes
  useEffect(() => {
    const monthStr = `${year}-${String(month + 1).padStart(2, '0')}`
    let cancelled = false

    async function fetchGcal() {
      try {
        const res = await fetch(`/api/admin/calendar?month=${monthStr}`)
        if (!res.ok) {
          setGcalEvents([])
          return
        }
        const data = await res.json()
        if (cancelled) return

        const mapped: CalendarEvent[] = (data.events || []).map(
          (ev: { id: string; summary: string; start: string; allDay: boolean }) => {
            const startDate = ev.start.substring(0, 10)
            let time: string | undefined
            if (!ev.allDay && ev.start.length > 10) {
              time = ev.start.substring(11, 16)
            }
            return {
              date: startDate,
              label: ev.summary,
              type: 'gcal' as const,
              time,
            }
          }
        )
        setGcalEvents(mapped)
      } catch {
        if (!cancelled) setGcalEvents([])
      }
    }

    fetchGcal()
    return () => { cancelled = true }
  }, [year, month])

  const allEvents = useMemo(() => [...events, ...gcalEvents], [events, gcalEvents])

  const eventsByDate = useMemo(() => {
    const map: Record<string, CalendarEvent[]> = {}
    for (const ev of allEvents) {
      if (!map[ev.date]) map[ev.date] = []
      map[ev.date].push(ev)
    }
    // Sort each day's events by time
    for (const key of Object.keys(map)) {
      map[key].sort((a, b) => {
        if (a.time && !b.time) return -1
        if (!a.time && b.time) return 1
        if (a.time && b.time) return a.time.localeCompare(b.time)
        return 0
      })
    }
    return map
  }, [allEvents])

  function handleEventClick(ev: CalendarEvent) {
    if (ev.itineraryId) {
      router.push(`/admin/itineraries/${ev.itineraryId}`)
    }
  }

  // Navigation
  function navigatePrev() {
    const d = new Date(currentDate)
    if (viewMode === 'month') d.setMonth(d.getMonth() - 1)
    else if (viewMode === 'week') d.setDate(d.getDate() - 7)
    else d.setDate(d.getDate() - 1)
    setCurrentDate(d)
  }

  function navigateNext() {
    const d = new Date(currentDate)
    if (viewMode === 'month') d.setMonth(d.getMonth() + 1)
    else if (viewMode === 'week') d.setDate(d.getDate() + 7)
    else d.setDate(d.getDate() + 1)
    setCurrentDate(d)
  }

  function goToToday() {
    setCurrentDate(new Date())
  }

  // Header label
  function headerLabel(): string {
    if (viewMode === 'month') return `${MONTHS[month]} ${year}`
    if (viewMode === 'week') {
      const mon = getMonday(currentDate)
      const sun = new Date(mon)
      sun.setDate(sun.getDate() + 6)
      const fmtD = (d: Date) => `${d.getDate()} ${MONTHS[d.getMonth()].substring(0, 3)}`
      return `${fmtD(mon)} - ${fmtD(sun)} ${sun.getFullYear()}`
    }
    // day
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    return `${dayNames[currentDate.getDay()]}, ${currentDate.getDate()} ${MONTHS[month]} ${year}`
  }

  // ── Month View ──
  function renderMonthView() {
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const totalDays = lastDay.getDate()
    const startOffset = (firstDay.getDay() + 6) % 7

    const cells: (number | null)[] = []
    for (let i = 0; i < startOffset; i++) cells.push(null)
    for (let d = 1; d <= totalDays; d++) cells.push(d)
    while (cells.length % 7 !== 0) cells.push(null)

    return (
      <div>
        <div className="grid grid-cols-7 mb-1">
          {DAYS.map((d) => (
            <div key={d} className="text-[10px] font-medium text-gray-400 text-center py-1">
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {cells.map((day, i) => {
            if (day === null) return <div key={i} className="h-12" />

            const ds = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
            const dayEvents = eventsByDate[ds] || []
            const isToday = ds === todayStr

            return (
              <div
                key={i}
                className={cn(
                  'h-12 flex flex-col items-center justify-start pt-1 rounded cursor-default transition-colors',
                  isToday && 'bg-green-muted',
                  dayEvents.length > 0 && 'cursor-pointer hover:bg-gray-50'
                )}
                onClick={() => {
                  if (dayEvents.length > 0) {
                    setCurrentDate(new Date(year, month, day))
                    setViewMode('day')
                  }
                }}
                title={dayEvents
                  .map((e) => {
                    const prefix = typeLabel(e.type)
                    const timeStr = e.time ? ` (${e.time})` : ''
                    return `${prefix}: ${e.label}${timeStr}`
                  })
                  .join('\n')}
              >
                <span className={cn(
                  'text-xs font-body',
                  isToday ? 'font-semibold text-green' : 'text-gray-700'
                )}>
                  {day}
                </span>
                {dayEvents.length > 0 && (
                  <div className="flex gap-0.5 mt-0.5">
                    {dayEvents.slice(0, 3).map((ev, j) => (
                      <span key={j} className={`w-1.5 h-1.5 rounded-full ${dotColor(ev.type)}`} />
                    ))}
                    {dayEvents.length > 3 && (
                      <span className="text-[8px] text-gray-400 leading-none ml-0.5">
                        +{dayEvents.length - 3}
                      </span>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  // ── Week View ──
  function renderWeekView() {
    const monday = getMonday(currentDate)
    const weekDays: Date[] = []
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday)
      d.setDate(d.getDate() + i)
      weekDays.push(d)
    }

    return (
      <div className="grid grid-cols-7 gap-1">
        {weekDays.map((d, i) => {
          const ds = toDateStr(d)
          const dayEvents = eventsByDate[ds] || []
          const isToday = ds === todayStr

          return (
            <div key={i} className="min-h-[120px]">
              <div
                className={cn(
                  'text-center py-1 rounded-t text-xs font-body',
                  isToday ? 'bg-green text-white font-semibold' : 'bg-gray-50 text-gray-500'
                )}
              >
                <div>{DAYS[i]}</div>
                <div className={cn('text-sm', isToday ? 'text-white' : 'text-gray-800')}>{d.getDate()}</div>
              </div>
              <div className="border border-t-0 border-gray-100 rounded-b p-1 space-y-1">
                {dayEvents.length === 0 && (
                  <div className="h-8" />
                )}
                {dayEvents.slice(0, 4).map((ev, j) => (
                  <button
                    key={j}
                    onClick={() => handleEventClick(ev)}
                    className={cn(
                      'w-full text-left px-1.5 py-0.5 rounded text-[10px] font-body border truncate',
                      eventBgColor(ev.type),
                      ev.itineraryId ? 'cursor-pointer' : 'cursor-default'
                    )}
                    title={`${typeLabel(ev.type)}: ${ev.label}${ev.time ? ` (${ev.time})` : ''}`}
                  >
                    {ev.time && <span className="font-medium mr-0.5">{ev.time}</span>}
                    {ev.label}
                  </button>
                ))}
                {dayEvents.length > 4 && (
                  <button
                    onClick={() => {
                      setCurrentDate(d)
                      setViewMode('day')
                    }}
                    className="text-[10px] text-gray-400 hover:text-gray-600 font-body w-full text-left px-1"
                  >
                    +{dayEvents.length - 4} more
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  // ── Day View ──
  function renderDayView() {
    const ds = toDateStr(currentDate)
    const dayEvents = eventsByDate[ds] || []
    const timedEvents = dayEvents.filter((e) => e.time)
    const allDayEvents = dayEvents.filter((e) => !e.time)

    return (
      <div>
        {/* All-day events */}
        {allDayEvents.length > 0 && (
          <div className="mb-3 space-y-1">
            <p className="text-[10px] text-gray-400 font-body uppercase tracking-wider mb-1">All day</p>
            {allDayEvents.map((ev, i) => (
              <button
                key={i}
                onClick={() => handleEventClick(ev)}
                className={cn(
                  'w-full text-left px-2 py-1.5 rounded text-xs font-body border',
                  eventBgColor(ev.type),
                  ev.itineraryId ? 'cursor-pointer' : 'cursor-default'
                )}
              >
                <span className={`inline-block w-1.5 h-1.5 rounded-full ${dotColor(ev.type)} mr-1.5`} />
                {ev.label}
                <span className="text-[10px] ml-1 opacity-70">{typeLabel(ev.type)}</span>
              </button>
            ))}
          </div>
        )}

        {/* Hour grid */}
        <div className="border border-gray-100 rounded">
          {HOURS.map((hour) => {
            const hourStr = String(hour).padStart(2, '0')
            const eventsThisHour = timedEvents.filter((e) => e.time && e.time.startsWith(hourStr))

            return (
              <div
                key={hour}
                className="flex border-b border-gray-50 last:border-b-0 min-h-[36px]"
              >
                <div className="w-12 shrink-0 text-[10px] text-gray-400 font-body py-1 text-right pr-2 border-r border-gray-100">
                  {hourStr}:00
                </div>
                <div className="flex-1 p-0.5 space-y-0.5">
                  {eventsThisHour.map((ev, i) => (
                    <button
                      key={i}
                      onClick={() => handleEventClick(ev)}
                      className={cn(
                        'w-full text-left px-2 py-1 rounded text-xs font-body border',
                        eventBgColor(ev.type),
                        ev.itineraryId ? 'cursor-pointer' : 'cursor-default'
                      )}
                    >
                      <span className="font-medium mr-1">{ev.time}</span>
                      {ev.label}
                    </button>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        {/* Events without specific time that aren't "all day" events with type */}
        {dayEvents.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-8 font-body">No events this day</p>
        )}
      </div>
    )
  }

  // ── Mobile list for current view ──
  function renderMobileList() {
    let relevantEvents: CalendarEvent[] = []

    if (viewMode === 'month') {
      relevantEvents = allEvents.filter((ev) => {
        const d = new Date(ev.date)
        return d.getFullYear() === year && d.getMonth() === month
      })
    } else if (viewMode === 'week') {
      const monday = getMonday(currentDate)
      const sunday = new Date(monday)
      sunday.setDate(sunday.getDate() + 6)
      const monStr = toDateStr(monday)
      const sunStr = toDateStr(sunday)
      relevantEvents = allEvents.filter((ev) => ev.date >= monStr && ev.date <= sunStr)
    } else {
      const ds = toDateStr(currentDate)
      relevantEvents = allEvents.filter((ev) => ev.date === ds)
    }

    relevantEvents.sort((a, b) => {
      const dateCmp = a.date.localeCompare(b.date)
      if (dateCmp !== 0) return dateCmp
      if (a.time && !b.time) return -1
      if (!a.time && b.time) return 1
      if (a.time && b.time) return a.time.localeCompare(b.time)
      return 0
    })

    if (relevantEvents.length === 0) {
      return <p className="text-sm text-gray-400 text-center py-4">No events</p>
    }

    return (
      <div className="space-y-2">
        {relevantEvents.map((ev, i) => {
          const d = new Date(ev.date)
          const dayNum = d.getDate()
          const dayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()]
          const isClickable = !!ev.itineraryId

          return (
            <button
              key={i}
              onClick={() => handleEventClick(ev)}
              className={cn(
                'w-full flex items-center gap-3 p-2 rounded transition-colors text-left',
                isClickable ? 'hover:bg-gray-50 cursor-pointer' : 'cursor-default'
              )}
            >
              <div className="text-center w-10 shrink-0">
                <p className="text-lg font-heading font-semibold text-gray-900">{dayNum}</p>
                <p className="text-[10px] text-gray-400 uppercase">{dayName}</p>
              </div>
              <div className="flex items-center gap-2 min-w-0">
                <span className={`w-2 h-2 rounded-full shrink-0 ${dotColor(ev.type)}`} />
                <div className="min-w-0">
                  <p className="text-sm text-gray-700 truncate">
                    {ev.time && <span className="text-gray-400 mr-1">{ev.time}</span>}
                    {ev.label}
                  </p>
                  <p className="text-[10px] text-gray-400">{typeLabel(ev.type)}</p>
                </div>
              </div>
            </button>
          )
        })}
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-sm font-medium text-gray-500 font-body uppercase tracking-wider mb-3">
        Calendar
      </h2>
      <div className="bg-white rounded-[8px] border border-gray-200 p-4">
        {/* View toggle + navigation */}
        <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
          <div className="flex items-center gap-1">
            <button
              onClick={navigatePrev}
              className="p-1.5 hover:bg-gray-100 rounded transition-colors text-gray-600"
              aria-label="Previous"
            >
              &#8249;
            </button>
            <button
              onClick={goToToday}
              className="px-2 py-1 text-[10px] font-medium text-green hover:bg-green-muted rounded transition-colors font-body"
            >
              Today
            </button>
            <button
              onClick={navigateNext}
              className="p-1.5 hover:bg-gray-100 rounded transition-colors text-gray-600"
              aria-label="Next"
            >
              &#8250;
            </button>
          </div>

          <span className="text-sm font-heading font-semibold text-gray-900">
            {headerLabel()}
          </span>

          <div className="flex items-center bg-gray-100 rounded-[4px] p-0.5">
            {(['day', 'week', 'month'] as ViewMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={cn(
                  'px-2.5 py-1 text-[10px] font-medium font-body rounded-[3px] transition-colors capitalize',
                  viewMode === mode
                    ? 'bg-white text-green shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                )}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>

        {/* Desktop views */}
        <div className="hidden sm:block">
          {viewMode === 'month' && renderMonthView()}
          {viewMode === 'week' && renderWeekView()}
          {viewMode === 'day' && renderDayView()}
        </div>

        {/* Mobile list */}
        <div className="sm:hidden">
          {renderMobileList()}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-100 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green" />
            <span className="text-[10px] text-gray-400">Trips</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-gold" />
            <span className="text-[10px] text-gray-400">Deadlines</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            <span className="text-[10px] text-gray-400">Calendar</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
            <span className="text-[10px] text-gray-400">Tasks</span>
          </div>
        </div>
      </div>
    </div>
  )
}
