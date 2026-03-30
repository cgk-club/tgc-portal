'use client'

import { useState, useEffect, useRef } from 'react'

interface ClientOption {
  id: string
  name: string | null
  email: string
}

interface ClientSelectProps {
  value: string | null
  onChange: (clientId: string | null, client: ClientOption | null) => void
  label?: string
}

export default function ClientSelect({ value, onChange, label = 'Link to Client' }: ClientSelectProps) {
  const [clients, setClients] = useState<ClientOption[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch('/api/admin/clients')
      .then(res => res.json())
      .then(data => {
        setClients(
          (data || []).map((c: ClientOption) => ({
            id: c.id,
            name: c.name,
            email: c.email,
          }))
        )
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const selectedClient = clients.find(c => c.id === value) || null

  const filtered = clients.filter(c => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      (c.name && c.name.toLowerCase().includes(q)) ||
      c.email.toLowerCase().includes(q)
    )
  })

  function formatClient(c: ClientOption) {
    return c.name ? `${c.name} (${c.email})` : c.email
  }

  return (
    <div ref={wrapperRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      )}
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="w-full rounded-[4px] border border-gray-300 px-3 py-2 text-sm text-left focus:border-green focus:outline-none focus:ring-1 focus:ring-green bg-white"
        >
          {loading ? (
            <span className="text-gray-400">Loading clients...</span>
          ) : selectedClient ? (
            <span className="text-gray-900">{formatClient(selectedClient)}</span>
          ) : (
            <span className="text-gray-400">No client linked</span>
          )}
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">
            {open ? '\u25B2' : '\u25BC'}
          </span>
        </button>

        {open && (
          <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-[4px] shadow-lg max-h-60 overflow-hidden">
            <div className="p-2 border-b border-gray-100">
              <input
                type="text"
                placeholder="Search clients..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded focus:border-green focus:outline-none"
                autoFocus
              />
            </div>
            <div className="overflow-y-auto max-h-44">
              <button
                type="button"
                onClick={() => {
                  onChange(null, null)
                  setOpen(false)
                  setSearch('')
                }}
                className={`w-full text-left px-3 py-2 text-sm hover:bg-green-muted transition-colors ${
                  !value ? 'bg-green-muted text-green font-medium' : 'text-gray-500'
                }`}
              >
                No client linked
              </button>
              {filtered.map(c => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => {
                    onChange(c.id, c)
                    setOpen(false)
                    setSearch('')
                  }}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-green-muted transition-colors ${
                    value === c.id ? 'bg-green-muted text-green font-medium' : 'text-gray-900'
                  }`}
                >
                  {formatClient(c)}
                </button>
              ))}
              {filtered.length === 0 && (
                <p className="px-3 py-2 text-sm text-gray-400">No clients found</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
