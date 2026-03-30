'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

interface NotificationCounts {
  approvals: number
  requests: number
  feedback: number
  marketplace_review: number
}

const navItems = [
  { label: 'Dashboard', href: '/admin', badgeKey: null },
  { label: 'Fiches', href: '/admin/fiches', badgeKey: null },
  { label: 'Itineraries', href: '/admin/itineraries', badgeKey: null },
  { label: 'Clients', href: '/admin/clients', badgeKey: null },
  { label: 'Projects', href: '/admin/projects', badgeKey: null },
  { label: 'Revenue', href: '/admin/revenue', badgeKey: null },
  { label: 'Partners', href: '/admin/partners', badgeKey: null },
  { label: 'Approvals', href: '/admin/approvals', badgeKey: 'approvals' as const },
  { label: 'Marketplace', href: '/admin/marketplace', badgeKey: 'marketplace_review' as const },
  { label: 'Feedback', href: '/admin/feedback', badgeKey: 'feedback' as const },
  { label: 'Rates', href: '/admin/rates', badgeKey: null },
  { label: 'Events', href: '/admin/events', badgeKey: null },
  { label: 'Requests', href: '/admin/requests', badgeKey: 'requests' as const },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [counts, setCounts] = useState<NotificationCounts>({
    approvals: 0,
    requests: 0,
    feedback: 0,
    marketplace_review: 0,
  })

  useEffect(() => {
    let cancelled = false

    async function fetchCounts() {
      try {
        const res = await fetch('/api/admin/notifications', { cache: 'no-store' })
        if (!res.ok) return
        const data = await res.json()
        if (!cancelled) setCounts(data)
      } catch {
        // Silently fail
      }
    }

    fetchCounts()
    const interval = setInterval(fetchCounts, 60000)

    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [])

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setOpen(false)
  }, [pathname])

  async function handleLogout() {
    await fetch('/api/admin/auth', { method: 'DELETE' })
    router.push('/admin/login')
    router.refresh()
  }

  const navContent = (
    <>
      <div className="p-6 flex items-center justify-between">
        <span className="font-heading text-sm font-semibold tracking-wider text-gold">
          TGC ADMIN
        </span>
        {/* Close button: mobile only */}
        <button
          onClick={() => setOpen(false)}
          className="md:hidden text-white/70 hover:text-white p-1"
          aria-label="Close menu"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      <nav className="flex-1 px-3 overflow-y-auto">
        {navItems.map((item) => {
          const active = item.href === '/admin'
            ? pathname === '/admin'
            : pathname.startsWith(item.href)

          const badgeCount = item.badgeKey ? counts[item.badgeKey] : 0

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center justify-between px-3 py-2 rounded-[4px] text-sm font-body mb-1 transition-colors',
                active
                  ? 'bg-white/15 text-white'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              )}
            >
              <span>{item.label}</span>
              {badgeCount > 0 && (
                <span className="min-w-[18px] h-[18px] bg-gold text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                  {badgeCount}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      <div className="p-3">
        <button
          onClick={handleLogout}
          className="block w-full text-left px-3 py-2 rounded-[4px] text-sm font-body text-white/50 hover:text-white hover:bg-white/10 transition-colors"
        >
          Sign out
        </button>
      </div>
    </>
  )

  return (
    <>
      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-green h-14 flex items-center px-4 shadow-sm">
        <button
          onClick={() => setOpen(true)}
          className="text-white p-1 mr-3"
          aria-label="Open menu"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <span className="font-heading text-sm font-semibold tracking-wider text-gold">
          TGC ADMIN
        </span>
      </div>

      {/* Mobile overlay */}
      {open && (
        <div
          className="md:hidden fixed inset-0 z-50 bg-black/50"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Mobile slide-out sidebar */}
      <aside
        className={cn(
          'md:hidden fixed top-0 left-0 z-50 w-64 bg-green h-full flex flex-col transition-transform duration-200 ease-in-out',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {navContent}
      </aside>

      {/* Desktop sidebar (always visible) */}
      <aside className="hidden md:flex w-64 bg-green min-h-screen flex-col flex-shrink-0">
        {navContent}
      </aside>
    </>
  )
}
