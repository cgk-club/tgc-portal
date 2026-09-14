'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import PartnerNav from '@/components/partner/PartnerNav'
import { dayLabel } from '@/lib/event-vocab'

interface EventCard { id: string; title: string; client_name: string; first_date: string | null; last_date: string | null }

export default function OnLocationListPage() {
  const router = useRouter()
  const [events, setEvents] = useState<EventCard[] | null>(null)

  useEffect(() => {
    fetch('/api/partner/on-location', { cache: 'no-store' }).then(async (res) => {
      if (res.status === 401) { router.push('/partner/login'); return }
      const data = await res.json().catch(() => ({ events: [] }))
      setEvents(data.events || [])
    })
  }, [router])

  return (
    <div className="min-h-screen bg-pearl">
      <PartnerNav active="on-location" />
      <main className="mx-auto max-w-2xl px-4 py-8 font-body">
        <h1 className="font-heading text-xl font-semibold text-green">On location</h1>
        <p className="mt-1 text-sm text-gray-500">The events you are working on, with the day&apos;s run of show, guests and movements.</p>
        <div className="mt-6 space-y-3">
          {events === null && <p className="text-sm text-gray-400">Loading...</p>}
          {events?.length === 0 && <p className="rounded-[8px] border border-gray-200 bg-white p-5 text-sm text-gray-500">You are not on any event at the moment.</p>}
          {events?.map((e) => (
            <Link key={e.id} href={`/partner/on-location/${e.id}`} className="block rounded-[8px] border border-gray-200 bg-white p-5 hover:border-green">
              <p className="text-xs uppercase tracking-[0.14em] text-gold-muted">{e.client_name}</p>
              <p className="mt-1 font-heading text-lg text-ink">{e.title}</p>
              {e.first_date && (
                <p className="mt-1 text-sm text-gray-500">
                  {dayLabel(e.first_date, { weekday: 'short' })}{e.last_date && e.last_date !== e.first_date ? ` to ${dayLabel(e.last_date, { weekday: 'short' })}` : ''}
                </p>
              )}
            </Link>
          ))}
        </div>
      </main>
    </div>
  )
}
