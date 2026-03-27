'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface PartnerSubmission {
  id: string
  type: 'fiche_edit' | 'offer' | 'event' | 'content'
  title: string
  partnerName: string
  status: string
  createdAt: string
}

function statusBadge(status: string) {
  switch (status) {
    case 'pending':
    case 'submitted':
      return 'bg-gold/20 text-gold'
    case 'approved':
    case 'active':
      return 'bg-green-muted text-green'
    case 'rejected':
      return 'bg-red-50 text-red-600'
    default:
      return 'bg-gray-100 text-gray-600'
  }
}

function typeIcon(type: PartnerSubmission['type']): string {
  switch (type) {
    case 'fiche_edit': return 'Edit'
    case 'offer': return 'Offer'
    case 'event': return 'Event'
    case 'content': return 'Content'
  }
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
  return new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

export default function PartnerActivity() {
  const [items, setItems] = useState<PartnerSubmission[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const ts = Date.now()
        const [feRes, ofRes, evRes, coRes] = await Promise.all([
          fetch(`/api/admin/fiche-edits?_t=${ts}`, { cache: 'no-store' }),
          fetch(`/api/admin/partner-offers?_t=${ts}`, { cache: 'no-store' }),
          fetch(`/api/admin/partner-events?_t=${ts}`, { cache: 'no-store' }),
          fetch(`/api/admin/partner-content?_t=${ts}`, { cache: 'no-store' }),
        ])

        const all: PartnerSubmission[] = []

        if (feRes.ok) {
          const data = await feRes.json()
          for (const fe of data.slice(0, 5)) {
            all.push({
              id: fe.id,
              type: 'fiche_edit',
              title: fe.fiche?.headline || fe.fiche?.slug || 'Fiche edit',
              partnerName: fe.partner?.org_name || fe.partner?.email || 'Unknown',
              status: fe.status,
              createdAt: fe.submitted_at || fe.created_at,
            })
          }
        }
        if (ofRes.ok) {
          const data = await ofRes.json()
          for (const o of data.slice(0, 5)) {
            all.push({
              id: o.id,
              type: 'offer',
              title: o.title,
              partnerName: o.partner?.org_name || o.partner?.email || 'Unknown',
              status: o.status,
              createdAt: o.created_at,
            })
          }
        }
        if (evRes.ok) {
          const data = await evRes.json()
          for (const ev of data.slice(0, 5)) {
            all.push({
              id: ev.id,
              type: 'event',
              title: ev.title,
              partnerName: ev.partner?.org_name || ev.partner?.email || 'Unknown',
              status: ev.status,
              createdAt: ev.created_at,
            })
          }
        }
        if (coRes.ok) {
          const data = await coRes.json()
          for (const c of data.slice(0, 5)) {
            all.push({
              id: c.id,
              type: 'content',
              title: c.title,
              partnerName: c.partner?.org_name || c.partner?.email || 'Unknown',
              status: c.status,
              createdAt: c.created_at,
            })
          }
        }

        all.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        setItems(all.slice(0, 5))
      } catch {
        // Fail silently
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-medium text-gray-500 font-body uppercase tracking-wider">
          Partner Activity
        </h2>
        <Link
          href="/admin/approvals"
          className="text-xs font-medium text-green hover:text-green-light transition-colors"
        >
          View all
        </Link>
      </div>
      <div className="bg-white rounded-[8px] border border-gray-200">
        {loading ? (
          <div className="p-4 text-center">
            <p className="text-sm text-gray-400 font-body">Loading...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="p-4 text-center">
            <p className="text-sm text-gray-400 font-body">No recent partner activity</p>
          </div>
        ) : (
          items.map((item, i) => (
            <div
              key={`${item.type}-${item.id}`}
              className={cn(
                'flex items-start gap-3 p-3',
                i < items.length - 1 && 'border-b border-gray-50'
              )}
            >
              <span className="text-[10px] font-medium text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded mt-0.5 shrink-0">
                {typeIcon(item.type)}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900 font-body truncate">{item.title}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] text-gray-400 font-body">{item.partnerName}</span>
                  <span className="text-[10px] text-gray-300">|</span>
                  <span className="text-[10px] text-gray-400 font-body">{relativeTime(item.createdAt)}</span>
                </div>
              </div>
              <span className={cn(
                'inline-block px-2 py-0.5 text-[10px] rounded-full font-medium shrink-0',
                statusBadge(item.status)
              )}>
                {item.status}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
