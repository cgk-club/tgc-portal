'use client'

import { useState } from 'react'
import Link from 'next/link'

export interface FicheInboxItem {
  id: string
  slug: string
  headline: string | null
  heroMissing: boolean
  headlineMissing: boolean
  descriptionMissing: boolean
  highlightsMissing: boolean
  galleryMissing: boolean
  tagsMissing: boolean
  isComplete: boolean
  missingCount: number
}

interface Props {
  fiches: FicheInboxItem[]
  totalDrafts: number
}

export default function FicheInbox({ fiches: initialFiches, totalDrafts }: Props) {
  const [fiches, setFiches] = useState(initialFiches)
  const [settingLive, setSettingLive] = useState<string | null>(null)

  async function handleSetLive(id: string) {
    setSettingLive(id)
    try {
      const res = await fetch(`/api/admin/fiches/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'live' }),
      })
      if (res.ok) {
        setFiches((prev) => prev.filter((f) => f.id !== id))
      }
    } finally {
      setSettingLive(null)
    }
  }

  if (fiches.length === 0) return null

  const missingPills: { key: keyof FicheInboxItem; label: string }[] = [
    { key: 'heroMissing', label: 'hero' },
    { key: 'headlineMissing', label: 'headline' },
    { key: 'descriptionMissing', label: 'description' },
    { key: 'highlightsMissing', label: 'highlights' },
    { key: 'galleryMissing', label: 'gallery' },
    { key: 'tagsMissing', label: 'tags' },
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-medium text-gray-500 font-body uppercase tracking-wider">
          Fiche Inbox
        </h2>
        <span className="text-xs text-gold font-medium font-body bg-gold-light px-2 py-0.5 rounded-full">
          {totalDrafts} drafts
        </span>
      </div>
      <div className="bg-white rounded-[8px] border border-gray-200 divide-y divide-gray-100">
        {fiches.map((f) => (
          <div
            key={f.id}
            className="p-3 sm:p-4 flex items-center justify-between gap-3"
          >
            <Link
              href={`/admin/fiches/${f.id}`}
              className="min-w-0 hover:text-green transition-colors"
            >
              <p className="text-sm font-medium text-gray-900 truncate">
                {f.headline || f.slug}
              </p>
              {!f.isComplete && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {missingPills.map(
                    (pill) =>
                      f[pill.key] && (
                        <span
                          key={pill.label}
                          className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-red-50 text-red-600"
                        >
                          {pill.label}
                        </span>
                      )
                  )}
                </div>
              )}
            </Link>
            {f.isComplete && (
              <button
                onClick={(e) => {
                  e.preventDefault()
                  handleSetLive(f.id)
                }}
                disabled={settingLive === f.id}
                className="shrink-0 text-xs font-medium px-3 py-1.5 rounded-[4px] bg-green text-white hover:bg-green-light transition-colors disabled:opacity-50"
              >
                {settingLive === f.id ? 'Setting...' : 'Set Live'}
              </button>
            )}
          </div>
        ))}
      </div>
      {totalDrafts > 10 && (
        <Link
          href="/admin/fiches?status=draft"
          className="block text-center text-sm text-green hover:text-green-light font-medium font-body mt-3"
        >
          View all drafts
        </Link>
      )}
    </div>
  )
}
