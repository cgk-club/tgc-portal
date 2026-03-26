'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

const navItems = [
  { label: 'Dashboard', href: '/admin' },
  { label: 'Fiches', href: '/admin/fiches' },
  { label: 'Itineraries', href: '/admin/itineraries' },
  { label: 'Clients', href: '/admin/clients' },
  { label: 'Partners', href: '/admin/partners' },
  { label: 'Approvals', href: '/admin/approvals' },
  { label: 'Rates', href: '/admin/rates' },
  { label: 'Events', href: '/admin/events' },
  { label: 'Requests', href: '/admin/requests' },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()

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
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'block px-3 py-2 rounded-[4px] text-sm font-body mb-1 transition-colors',
                active
                  ? 'bg-white/15 text-white'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              )}
            >
              {item.label}
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
