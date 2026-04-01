'use client'

import { useState, useEffect } from 'react'
import Button from '@/components/ui/Button'

interface SentNotification {
  id: string
  user_type: string
  title: string
  body: string | null
  type: string
  link: string | null
  created_at: string
}

const TYPE_LABELS: Record<string, string> = {
  update: 'Update',
  approval: 'Approval',
  itinerary: 'Itinerary',
  new_partner: 'New Partner',
  general: 'General',
}

const USER_TYPE_LABELS: Record<string, string> = {
  client: 'Clients',
  partner: 'Partners',
}

export default function NotificationPanel() {
  const [sentNotifications, setSentNotifications] = useState<SentNotification[]>([])
  const [loading, setLoading] = useState(true)
  const [weeklyPartners, setWeeklyPartners] = useState(0)
  const [showBroadcast, setShowBroadcast] = useState(false)
  const [broadcasting, setBroadcasting] = useState(false)
  const [broadcastResult, setBroadcastResult] = useState<string | null>(null)

  // Broadcast form state
  const [targetType, setTargetType] = useState<'client' | 'partner'>('partner')
  const [notifTitle, setNotifTitle] = useState('')
  const [notifBody, setNotifBody] = useState('')
  const [notifType, setNotifType] = useState<string>('general')
  const [notifLink, setNotifLink] = useState('')

  useEffect(() => {
    async function load() {
      const [notifsRes, partnersRes] = await Promise.all([
        fetch('/api/admin/notifications?view=all&limit=20'),
        fetch('/api/admin/notifications?view=weekly-partners'),
      ])

      if (notifsRes.ok) {
        const data = await notifsRes.json()
        // De-duplicate by grouping same title+body+type+created_at (broadcasts create many rows)
        const seen = new Map<string, SentNotification>()
        for (const n of data) {
          const key = `${n.title}|${n.type}|${n.created_at.substring(0, 16)}`
          if (!seen.has(key)) {
            seen.set(key, n)
          }
        }
        setSentNotifications(Array.from(seen.values()))
      }

      if (partnersRes.ok) {
        const data = await partnersRes.json()
        setWeeklyPartners(data.count || 0)
      }

      setLoading(false)
    }
    load()
  }, [])

  async function handleBroadcast() {
    if (!notifTitle.trim()) return
    setBroadcasting(true)
    setBroadcastResult(null)

    const res = await fetch('/api/admin/notifications/broadcast', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_type: targetType,
        title: notifTitle.trim(),
        body: notifBody.trim() || null,
        type: notifType,
        link: notifLink.trim() || null,
      }),
    })

    if (res.ok) {
      const data = await res.json()
      setBroadcastResult(`Sent to ${data.sent} ${targetType === 'client' ? 'clients' : 'partners'}.`)
      setNotifTitle('')
      setNotifBody('')
      setNotifLink('')

      // Refresh list
      const notifsRes = await fetch('/api/admin/notifications?view=all&limit=20')
      if (notifsRes.ok) {
        const all = await notifsRes.json()
        const seen = new Map<string, SentNotification>()
        for (const n of all) {
          const key = `${n.title}|${n.type}|${n.created_at.substring(0, 16)}`
          if (!seen.has(key)) {
            seen.set(key, n)
          }
        }
        setSentNotifications(Array.from(seen.values()))
      }
    } else {
      const data = await res.json()
      setBroadcastResult(`Error: ${data.error || 'Failed to broadcast'}`)
    }

    setBroadcasting(false)
    setTimeout(() => setBroadcastResult(null), 5000)
  }

  function handleQuickPortalUpdate() {
    setTargetType('partner')
    setNotifTitle('Portal Update')
    setNotifBody('We have made improvements to the partner portal. Log in to see what is new.')
    setNotifType('update')
    setNotifLink('/partner')
    setShowBroadcast(true)
  }

  return (
    <div className="bg-white border border-green/10 rounded-lg overflow-hidden">
      <div className="px-5 py-4 border-b border-green/10 flex items-center justify-between">
        <h2 className="font-heading text-sm font-semibold text-green">Notifications</h2>
        <div className="flex items-center gap-3">
          {weeklyPartners > 0 && (
            <span className="text-xs font-body text-gray-500">
              <span className="font-medium text-green">{weeklyPartners}</span> new partner{weeklyPartners !== 1 ? 's' : ''} this week
            </span>
          )}
          <Button size="sm" onClick={() => setShowBroadcast(!showBroadcast)}>
            {showBroadcast ? 'Cancel' : 'Broadcast'}
          </Button>
        </div>
      </div>

      {/* Broadcast form */}
      {showBroadcast && (
        <div className="px-5 py-4 bg-green/[0.02] border-b border-green/10">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-xs text-gray-500 font-body mb-1">Send to</label>
              <select
                value={targetType}
                onChange={(e) => setTargetType(e.target.value as 'client' | 'partner')}
                className="w-full rounded-[4px] border border-gray-300 px-3 py-1.5 text-sm font-body focus:border-green focus:outline-none focus:ring-1 focus:ring-green"
              >
                <option value="partner">All Partners</option>
                <option value="client">All Clients</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 font-body mb-1">Type</label>
              <select
                value={notifType}
                onChange={(e) => setNotifType(e.target.value)}
                className="w-full rounded-[4px] border border-gray-300 px-3 py-1.5 text-sm font-body focus:border-green focus:outline-none focus:ring-1 focus:ring-green"
              >
                <option value="general">General</option>
                <option value="update">Update</option>
                <option value="approval">Approval</option>
                <option value="new_partner">New Partner</option>
              </select>
            </div>
          </div>
          <div className="mb-3">
            <label className="block text-xs text-gray-500 font-body mb-1">Title</label>
            <input
              value={notifTitle}
              onChange={(e) => setNotifTitle(e.target.value)}
              placeholder="Notification title"
              className="w-full rounded-[4px] border border-gray-300 px-3 py-1.5 text-sm font-body focus:border-green focus:outline-none focus:ring-1 focus:ring-green"
            />
          </div>
          <div className="mb-3">
            <label className="block text-xs text-gray-500 font-body mb-1">Body (optional)</label>
            <textarea
              value={notifBody}
              onChange={(e) => setNotifBody(e.target.value)}
              placeholder="Optional message body"
              rows={2}
              className="w-full rounded-[4px] border border-gray-300 px-3 py-1.5 text-sm font-body focus:border-green focus:outline-none focus:ring-1 focus:ring-green resize-none"
            />
          </div>
          <div className="mb-3">
            <label className="block text-xs text-gray-500 font-body mb-1">Link (optional)</label>
            <input
              value={notifLink}
              onChange={(e) => setNotifLink(e.target.value)}
              placeholder="/partner or /client/..."
              className="w-full rounded-[4px] border border-gray-300 px-3 py-1.5 text-sm font-body focus:border-green focus:outline-none focus:ring-1 focus:ring-green"
            />
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={handleBroadcast}
              disabled={broadcasting || !notifTitle.trim()}
            >
              {broadcasting ? 'Sending...' : `Send to all ${targetType === 'client' ? 'clients' : 'partners'}`}
            </Button>
            <button
              onClick={handleQuickPortalUpdate}
              className="text-xs text-green hover:text-green-light font-body font-medium"
            >
              Quick: Announce Portal Update
            </button>
          </div>
          {broadcastResult && (
            <p className={`text-xs font-body mt-2 ${broadcastResult.startsWith('Error') ? 'text-red-600' : 'text-green'}`}>
              {broadcastResult}
            </p>
          )}
        </div>
      )}

      {/* Sent notifications list */}
      <div className="max-h-64 overflow-y-auto">
        {loading ? (
          <div className="px-5 py-6 text-center">
            <p className="text-sm text-gray-400 font-body">Loading...</p>
          </div>
        ) : sentNotifications.length === 0 ? (
          <div className="px-5 py-6 text-center">
            <p className="text-sm text-gray-400 font-body">No notifications sent yet.</p>
          </div>
        ) : (
          sentNotifications.map((n) => (
            <div
              key={n.id}
              className="px-5 py-3 border-b border-green/5 last:border-0"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className={`inline-block px-1.5 py-0.5 text-[9px] rounded font-body font-medium ${
                      n.user_type === 'client' ? 'bg-blue-50 text-blue-600'
                        : n.user_type === 'partner' ? 'bg-gold/20 text-gold'
                        : 'bg-gray-100 text-gray-500'
                    }`}>
                      {USER_TYPE_LABELS[n.user_type] || n.user_type}
                    </span>
                    <span className="text-[9px] text-gray-300 font-body">
                      {TYPE_LABELS[n.type] || n.type}
                    </span>
                  </div>
                  <p className="text-sm text-gray-800 font-body font-medium truncate">{n.title}</p>
                  {n.body && (
                    <p className="text-xs text-gray-400 font-body truncate">{n.body}</p>
                  )}
                </div>
                <span className="text-[10px] text-gray-300 font-body whitespace-nowrap">
                  {new Date(n.created_at).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                  })}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
