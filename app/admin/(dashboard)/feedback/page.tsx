'use client'

import { useState, useEffect } from 'react'

interface FeedbackItem {
  id: string
  user_type: 'client' | 'partner'
  user_id: string | null
  user_name: string | null
  user_email: string | null
  page_url: string | null
  feedback_type: 'bug' | 'question' | 'suggestion' | 'other'
  message: string
  screenshot_url: string | null
  browser_info: string | null
  status: 'new' | 'in_progress' | 'resolved' | 'closed'
  admin_note: string | null
  created_at: string
}

const TYPE_BADGES: Record<string, string> = {
  bug: 'bg-red-100 text-red-700',
  question: 'bg-blue-100 text-blue-700',
  suggestion: 'bg-amber-100 text-amber-700',
  other: 'bg-gray-100 text-gray-600',
}

const STATUS_BADGES: Record<string, string> = {
  new: 'bg-green/10 text-green',
  in_progress: 'bg-blue-100 text-blue-700',
  resolved: 'bg-gray-200 text-gray-600',
  closed: 'bg-gray-100 text-gray-400',
}

const STATUS_OPTIONS = [
  { value: 'new', label: 'New' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'closed', label: 'Closed' },
]

export default function AdminFeedbackPage() {
  const [items, setItems] = useState<FeedbackItem[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [editNote, setEditNote] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState<string | null>(null)
  const [filter, setFilter] = useState<string>('all')

  useEffect(() => {
    async function load() {
      const res = await fetch('/api/admin/feedback')
      if (res.ok) {
        setItems(await res.json())
      }
      setLoading(false)
    }
    load()
  }, [])

  async function updateStatus(id: string, status: string) {
    setSaving(id)
    const res = await fetch(`/api/admin/feedback/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    if (res.ok) {
      const updated = await res.json()
      setItems(prev => prev.map(item => item.id === id ? updated : item))
    }
    setSaving(null)
  }

  async function saveNote(id: string) {
    setSaving(id)
    const res = await fetch(`/api/admin/feedback/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ admin_note: editNote[id] || '' }),
    })
    if (res.ok) {
      const updated = await res.json()
      setItems(prev => prev.map(item => item.id === id ? updated : item))
    }
    setSaving(null)
  }

  const filtered = filter === 'all' ? items : items.filter(i => i.status === filter)

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-12">
        <p className="text-gray-400 font-body">Loading feedback...</p>
      </div>
    )
  }

  const counts = {
    all: items.length,
    new: items.filter(i => i.status === 'new').length,
    in_progress: items.filter(i => i.status === 'in_progress').length,
    resolved: items.filter(i => i.status === 'resolved').length,
    closed: items.filter(i => i.status === 'closed').length,
  }

  return (
    <div className="p-4 sm:p-6 lg:p-12 max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading text-2xl font-semibold text-green">Feedback</h1>
          <p className="text-sm text-gray-400 font-body mt-1">
            Bug reports, questions, and suggestions from portal users.
          </p>
        </div>
        {counts.new > 0 && (
          <span className="bg-red-100 text-red-700 text-xs font-body px-2.5 py-1 rounded-full">
            {counts.new} new
          </span>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 mb-6 overflow-x-auto">
        {[
          { value: 'all', label: 'All' },
          { value: 'new', label: 'New' },
          { value: 'in_progress', label: 'In Progress' },
          { value: 'resolved', label: 'Resolved' },
          { value: 'closed', label: 'Closed' },
        ].map(tab => (
          <button
            key={tab.value}
            onClick={() => setFilter(tab.value)}
            className={`text-xs font-body px-3 py-1.5 rounded-sm whitespace-nowrap transition-colors ${
              filter === tab.value
                ? 'bg-green/10 text-green font-medium'
                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
            }`}
          >
            {tab.label} ({counts[tab.value as keyof typeof counts]})
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white border border-green/10 rounded-lg p-8 text-center">
          <p className="text-sm text-gray-400 font-body">No feedback items yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(item => {
            const isExpanded = expanded === item.id
            const date = new Date(item.created_at)
            const dateStr = date.toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })
            const timeStr = date.toLocaleTimeString('en-GB', {
              hour: '2-digit',
              minute: '2-digit',
            })

            return (
              <div
                key={item.id}
                className="bg-white border border-green/10 rounded-lg overflow-hidden"
              >
                {/* Summary row */}
                <button
                  onClick={() => {
                    setExpanded(isExpanded ? null : item.id)
                    if (!isExpanded && item.admin_note !== null) {
                      setEditNote(prev => ({ ...prev, [item.id]: item.admin_note || '' }))
                    }
                  }}
                  className="w-full text-left px-5 py-4 hover:bg-gray-50/50 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    {/* Type badge */}
                    <span className={`text-[10px] font-body px-2 py-0.5 rounded ${TYPE_BADGES[item.feedback_type]}`}>
                      {item.feedback_type}
                    </span>

                    {/* Message preview */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-800 font-body line-clamp-1">
                        {item.message}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] text-gray-400 font-body">
                          {item.user_name || item.user_email || 'Anonymous'}
                        </span>
                        <span className="text-[10px] text-gray-300">|</span>
                        <span className={`text-[10px] font-body px-1.5 py-0.5 rounded ${
                          item.user_type === 'partner' ? 'bg-gold/10 text-gold' : 'bg-green/10 text-green'
                        }`}>
                          {item.user_type}
                        </span>
                        <span className="text-[10px] text-gray-300">|</span>
                        <span className="text-[10px] text-gray-400 font-body">{dateStr} {timeStr}</span>
                      </div>
                    </div>

                    {/* Status badge */}
                    <span className={`text-[10px] font-body px-2 py-0.5 rounded whitespace-nowrap ${STATUS_BADGES[item.status]}`}>
                      {item.status.replace('_', ' ')}
                    </span>

                    {/* Expand chevron */}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className={`h-4 w-4 text-gray-300 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>

                {/* Expanded detail */}
                {isExpanded && (
                  <div className="border-t border-green/5 px-5 py-4 space-y-4">
                    {/* Full message */}
                    <div>
                      <label className="block text-[10px] text-gray-400 uppercase tracking-wider font-body mb-1">Message</label>
                      <p className="text-sm text-gray-700 font-body whitespace-pre-wrap">{item.message}</p>
                    </div>

                    {/* Meta grid */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] text-gray-400 uppercase tracking-wider font-body mb-0.5">User</label>
                        <p className="text-xs text-gray-600 font-body">{item.user_name || '-'}</p>
                        <p className="text-[11px] text-gray-400 font-body">{item.user_email || '-'}</p>
                      </div>
                      <div>
                        <label className="block text-[10px] text-gray-400 uppercase tracking-wider font-body mb-0.5">Page</label>
                        <p className="text-xs text-gray-600 font-body break-all">{item.page_url || '-'}</p>
                      </div>
                      {item.browser_info && (
                        <div className="col-span-2">
                          <label className="block text-[10px] text-gray-400 uppercase tracking-wider font-body mb-0.5">Browser</label>
                          <p className="text-[11px] text-gray-400 font-body break-all">{item.browser_info}</p>
                        </div>
                      )}
                    </div>

                    {/* Screenshot */}
                    {item.screenshot_url && (
                      <div>
                        <label className="block text-[10px] text-gray-400 uppercase tracking-wider font-body mb-1">Screenshot</label>
                        <a href={item.screenshot_url} target="_blank" rel="noopener noreferrer">
                          <img
                            src={item.screenshot_url}
                            alt="Screenshot"
                            className="max-h-48 rounded border border-green/10 object-contain cursor-pointer hover:opacity-90 transition-opacity"
                          />
                        </a>
                      </div>
                    )}

                    {/* Status management */}
                    <div>
                      <label className="block text-[10px] text-gray-400 uppercase tracking-wider font-body mb-1.5">Status</label>
                      <div className="flex gap-2">
                        {STATUS_OPTIONS.map(opt => (
                          <button
                            key={opt.value}
                            onClick={() => updateStatus(item.id, opt.value)}
                            disabled={saving === item.id}
                            className={`text-[11px] font-body px-3 py-1.5 rounded border transition-colors ${
                              item.status === opt.value
                                ? STATUS_BADGES[opt.value] + ' border-transparent'
                                : 'bg-white text-gray-400 border-gray-200 hover:border-gray-300'
                            } ${saving === item.id ? 'opacity-50' : ''}`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Admin note */}
                    <div>
                      <label className="block text-[10px] text-gray-400 uppercase tracking-wider font-body mb-1.5">Admin Note</label>
                      <textarea
                        value={editNote[item.id] ?? item.admin_note ?? ''}
                        onChange={(e) => setEditNote(prev => ({ ...prev, [item.id]: e.target.value }))}
                        placeholder="Internal note..."
                        rows={2}
                        className="w-full px-3 py-2 border border-green/20 rounded-md text-sm font-body focus:outline-none focus:ring-1 focus:ring-green/30 resize-none placeholder:text-gray-300"
                      />
                      <button
                        onClick={() => saveNote(item.id)}
                        disabled={saving === item.id}
                        className="mt-1.5 px-3 py-1.5 text-xs font-body bg-green text-white rounded hover:bg-green-light transition-colors disabled:opacity-50"
                      >
                        {saving === item.id ? 'Saving...' : 'Save Note'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
