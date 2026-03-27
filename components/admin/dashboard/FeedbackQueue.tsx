'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface FeedbackItem {
  id: string
  feedback_type: string
  message: string
  user_name: string | null
  user_email: string | null
  status: string
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
  return new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

function typeBadge(type: string): string {
  switch (type) {
    case 'bug': return 'bg-red-50 text-red-600'
    case 'feature': return 'bg-blue-50 text-blue-700'
    case 'improvement': return 'bg-purple-50 text-purple-700'
    default: return 'bg-gray-100 text-gray-600'
  }
}

export default function FeedbackQueue() {
  const [items, setItems] = useState<FeedbackItem[]>([])
  const [newCount, setNewCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchFeedback() {
      try {
        const res = await fetch(`/api/admin/feedback?_t=${Date.now()}`, { cache: 'no-store' })
        if (!res.ok) return
        const data = await res.json()
        const feedbackArray = Array.isArray(data) ? data : []
        const newItems = feedbackArray.filter((f: FeedbackItem) => f.status === 'new')
        setNewCount(newItems.length)
        // Show latest 3 overall (any status)
        setItems(feedbackArray.slice(0, 3))
      } catch {
        // Fail silently
      } finally {
        setLoading(false)
      }
    }

    fetchFeedback()
  }, [])

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-medium text-gray-500 font-body uppercase tracking-wider">
            Feedback
          </h2>
          {newCount > 0 && (
            <span className="min-w-[18px] h-[18px] bg-gold text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
              {newCount}
            </span>
          )}
        </div>
        <Link
          href="/admin/feedback"
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
            <p className="text-sm text-gray-400 font-body">No feedback yet</p>
          </div>
        ) : (
          items.map((item, i) => (
            <div
              key={item.id}
              className={cn(
                'p-3',
                i < items.length - 1 && 'border-b border-gray-50'
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={cn(
                      'text-[10px] font-medium px-1.5 py-0.5 rounded',
                      typeBadge(item.feedback_type)
                    )}>
                      {item.feedback_type || 'general'}
                    </span>
                    {item.status === 'new' && (
                      <span className="w-1.5 h-1.5 rounded-full bg-gold" />
                    )}
                  </div>
                  <p className="text-sm text-gray-700 font-body line-clamp-2">
                    {item.message}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] text-gray-400 font-body">
                      {item.user_name || item.user_email || 'Anonymous'}
                    </span>
                    <span className="text-[10px] text-gray-300">|</span>
                    <span className="text-[10px] text-gray-400 font-body">
                      {relativeTime(item.created_at)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
