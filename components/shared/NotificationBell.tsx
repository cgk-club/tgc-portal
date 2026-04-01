'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

interface NotificationItem {
  id: string
  title: string
  body: string | null
  type: string
  link: string | null
  read: boolean
  created_at: string
}

function relativeTime(date: string): string {
  const diff = Date.now() - new Date(date).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days === 1) return 'yesterday'
  if (days < 7) return `${days}d ago`
  return new Date(date).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
  })
}

export default function NotificationBell() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Fetch notifications
  async function fetchNotifications() {
    try {
      const res = await fetch('/api/notifications?limit=10', { cache: 'no-store' })
      if (!res.ok) return
      const data = await res.json()
      setNotifications(data.notifications || [])
      setUnreadCount(data.unread_count || 0)
    } catch {
      // Silently fail
    }
  }

  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [])

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  async function handleNotificationClick(notif: NotificationItem) {
    // Mark as read
    if (!notif.read) {
      await fetch(`/api/notifications/${notif.id}/read`, { method: 'PATCH' })
      setNotifications((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n))
      )
      setUnreadCount((c) => Math.max(0, c - 1))
    }

    // Navigate if link present
    if (notif.link) {
      setOpen(false)
      router.push(notif.link)
    }
  }

  async function handleMarkAllRead() {
    setLoading(true)
    await fetch('/api/notifications/mark-all-read', { method: 'POST' })
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    setUnreadCount(0)
    setLoading(false)
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => {
          setOpen(!open)
          if (!open) fetchNotifications()
        }}
        className="relative p-1.5 text-gray-500 hover:text-green transition-colors"
        aria-label="Notifications"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-[16px] bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center px-0.5 leading-none">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-green/10 rounded-lg shadow-lg z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-green/10 flex items-center justify-between">
            <h3 className="font-heading text-sm font-semibold text-green">
              Notifications
            </h3>
            {unreadCount > 0 && (
              <span className="text-[10px] text-gray-400 font-body">
                {unreadCount} unread
              </span>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <p className="text-sm text-gray-400 font-body">
                  No notifications yet.
                </p>
              </div>
            ) : (
              notifications.map((notif) => (
                <button
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`w-full text-left px-4 py-3 border-b border-green/5 last:border-0 hover:bg-green/5 transition-colors ${
                    !notif.read ? 'bg-green/[0.02]' : ''
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {!notif.read && (
                      <span className="mt-1.5 w-2 h-2 rounded-full bg-green flex-shrink-0" />
                    )}
                    <div className={!notif.read ? '' : 'ml-4'}>
                      <p className={`text-sm font-body leading-snug ${
                        !notif.read ? 'text-gray-800 font-medium' : 'text-gray-600'
                      }`}>
                        {notif.title}
                      </p>
                      {notif.body && (
                        <p className="text-xs text-gray-400 font-body mt-0.5 line-clamp-2">
                          {notif.body}
                        </p>
                      )}
                      <p className="text-[10px] text-gray-300 font-body mt-1">
                        {relativeTime(notif.created_at)}
                      </p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>

          {notifications.length > 0 && unreadCount > 0 && (
            <div className="px-4 py-2 border-t border-green/10 bg-gray-50/50">
              <button
                onClick={handleMarkAllRead}
                disabled={loading}
                className="w-full text-center text-xs text-green hover:text-green-light font-body font-medium py-1 disabled:opacity-50"
              >
                {loading ? 'Marking...' : 'Mark all as read'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
