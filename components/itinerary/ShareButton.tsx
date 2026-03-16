'use client'

import { useState } from 'react'
import Button from '@/components/ui/Button'

interface ShareButtonProps {
  itineraryId: string
  shareToken: string | null
  onTokenGenerated: (token: string) => void
}

export default function ShareButton({ itineraryId, shareToken, onTokenGenerated }: ShareButtonProps) {
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const shareUrl = shareToken
    ? `${window.location.origin}/itinerary/${shareToken}`
    : null

  async function handleShare() {
    if (shareToken) {
      await navigator.clipboard.writeText(shareUrl!)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      return
    }

    setLoading(true)
    const res = await fetch(`/api/admin/itineraries/${itineraryId}/share`, {
      method: 'POST',
    })
    if (res.ok) {
      const data = await res.json()
      onTokenGenerated(data.share_token)
      const url = `${window.location.origin}/itinerary/${data.share_token}`
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
    setLoading(false)
  }

  return (
    <Button
      variant="secondary"
      size="sm"
      onClick={handleShare}
      disabled={loading}
    >
      {loading ? 'Generating...' : copied ? 'Copied!' : shareToken ? 'Copy link' : 'Share'}
    </Button>
  )
}
