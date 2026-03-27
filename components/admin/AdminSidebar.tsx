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

  async function handleLogout() {
    await fetch('/api/admin/auth', { method: 'DELETE' })
    router.push('/admin/login')
    router.refresh()
  }

  return (
    <aside className="w-64 bg-green min-h-screen flex flex-col">
      <div className="p-6">
        <span className="font-heading text-sm font-semibold tracking-wider text-gold">
          TGC ADMIN
        </span>
      </div>

      <nav className="flex-1 px-3">
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
    </aside>
  )
}
