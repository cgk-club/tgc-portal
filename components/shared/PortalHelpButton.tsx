'use client'

import { useState, useRef, useCallback } from 'react'

interface PortalHelpButtonProps {
  userType: 'client' | 'partner'
}

const FEEDBACK_TYPES = [
  { value: 'bug', label: 'Bug', color: 'bg-red-100 text-red-700 border-red-200' },
  { value: 'question', label: 'Question', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  { value: 'suggestion', label: 'Suggestion', color: 'bg-amber-100 text-amber-700 border-amber-200' },
] as const

export default function PortalHelpButton({ userType }: PortalHelpButtonProps) {
  const [open, setOpen] = useState(false)
  const [feedbackType, setFeedbackType] = useState<string>('bug')
  const [message, setMessage] = useState('')
  const [screenshotUrl, setScreenshotUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const resetForm = useCallback(() => {
    setFeedbackType('bug')
    setMessage('')
    setScreenshotUrl(null)
    setError('')
    setSubmitted(false)
  }, [])

  const handleClose = useCallback(() => {
    setOpen(false)
    // Reset after animation
    setTimeout(() => resetForm(), 300)
  }, [resetForm])

  async function handleFileUpload(file: File) {
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file.')
      return
    }

    setUploading(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('file', file)

      // Use the partner upload endpoint (works for both since it just uploads to storage)
      const res = await fetch('/api/partner/upload', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        // If partner upload fails (not a partner), try admin upload
        const adminRes = await fetch('/api/admin/upload', {
          method: 'POST',
          body: formData,
        })
        if (!adminRes.ok) {
          throw new Error('Upload failed. You can still submit without a screenshot.')
        }
        const { url } = await adminRes.json()
        setScreenshotUrl(url)
      } else {
        const { url } = await res.json()
        setScreenshotUrl(url)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) handleFileUpload(file)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function handlePaste(e: React.ClipboardEvent) {
    const items = e.clipboardData?.items
    if (!items) return
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith('image/')) {
        const file = items[i].getAsFile()
        if (file) {
          e.preventDefault()
          handleFileUpload(file)
        }
        break
      }
    }
  }

  async function handleSubmit() {
    if (!message.trim()) {
      setError('Please describe the issue.')
      return
    }

    setSubmitting(true)
    setError('')

    try {
      const browserInfo = `${navigator.userAgent} | ${window.innerWidth}x${window.innerHeight}`

      const res = await fetch('/api/portal/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_type: userType,
          feedback_type: feedbackType,
          message: message.trim(),
          screenshot_url: screenshotUrl,
          page_url: window.location.href,
          browser_info: browserInfo,
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to submit feedback')
      }

      setSubmitted(true)
      // Auto-close after showing success
      setTimeout(() => handleClose(), 2500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => {
          if (open) {
            handleClose()
          } else {
            resetForm()
            setOpen(true)
          }
        }}
        className={`fixed bottom-6 right-6 w-12 h-12 rounded-full shadow-lg z-40 flex items-center justify-center transition-all duration-300 ${
          open
            ? 'bg-gray-500 hover:bg-gray-600 rotate-45'
            : 'bg-green hover:bg-green-light'
        }`}
        aria-label={open ? 'Close help' : 'Help and feedback'}
      >
        {open ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        ) : (
          <span className="text-white text-lg font-bold font-body">?</span>
        )}
      </button>

      {/* Panel */}
      {open && (
        <div
          className={`fixed bottom-20 right-6 w-80 bg-white rounded-lg shadow-xl border border-green/10 z-40 transition-all duration-300 ${
            open ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
          onPaste={handlePaste}
        >
          {/* Header */}
          <div className="px-4 py-3 border-b border-green/10">
            <h3 className="font-heading text-sm font-semibold text-green">
              Help & Feedback
            </h3>
            <p className="text-[11px] text-gray-400 font-body mt-0.5">
              Report a bug, ask a question, or suggest an improvement.
            </p>
          </div>

          {submitted ? (
            /* Success state */
            <div className="p-6 text-center">
              <div className="w-10 h-10 bg-green/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-sm text-green font-body font-medium">Thank you.</p>
              <p className="text-xs text-gray-400 font-body mt-1">We will look into this.</p>
            </div>
          ) : (
            /* Form */
            <div className="p-4 space-y-3">
              {/* Type selector */}
              <div>
                <label className="block text-[11px] text-gray-500 font-body mb-1.5">Type</label>
                <div className="flex gap-2">
                  {FEEDBACK_TYPES.map((t) => (
                    <button
                      key={t.value}
                      onClick={() => setFeedbackType(t.value)}
                      className={`px-3 py-1.5 text-[11px] font-body rounded border transition-colors ${
                        feedbackType === t.value
                          ? t.color
                          : 'bg-gray-50 text-gray-400 border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="block text-[11px] text-gray-500 font-body mb-1.5">Message</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe what happened or what you need..."
                  rows={3}
                  className="w-full px-3 py-2 border border-green/20 rounded-md text-sm font-body focus:outline-none focus:ring-1 focus:ring-green/30 resize-none placeholder:text-gray-300"
                />
              </div>

              {/* Screenshot */}
              <div>
                <label className="block text-[11px] text-gray-500 font-body mb-1.5">
                  Screenshot (optional)
                </label>
                {screenshotUrl ? (
                  <div className="relative rounded border border-green/10 overflow-hidden">
                    <img src={screenshotUrl} alt="Screenshot" className="w-full h-24 object-cover" />
                    <button
                      onClick={() => setScreenshotUrl(null)}
                      className="absolute top-1 right-1 w-5 h-5 bg-white/90 rounded-full flex items-center justify-center text-gray-500 hover:text-red-500 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="w-full px-3 py-2 border border-dashed border-green/20 rounded-md text-[11px] font-body text-gray-400 hover:border-green/40 hover:text-gray-500 transition-colors text-center"
                  >
                    {uploading ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-3 h-3 border border-green/30 border-t-green rounded-full animate-spin" />
                        Uploading...
                      </span>
                    ) : (
                      'Click to upload or paste from clipboard'
                    )}
                  </button>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>

              {/* Error */}
              {error && (
                <p className="text-[11px] text-red-500 font-body">{error}</p>
              )}

              {/* Submit */}
              <button
                onClick={handleSubmit}
                disabled={submitting || !message.trim()}
                className="w-full py-2 bg-green text-white text-sm font-body font-medium rounded-md hover:bg-green-light transition-colors disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          )}
        </div>
      )}
    </>
  )
}
