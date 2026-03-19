'use client'

import { useState } from 'react'
import Button from '@/components/ui/Button'
import { FicheTemplate } from '@/lib/ficheTemplates'
import { generateOutreachBody, detectGaps } from '@/lib/outreachGaps'

interface OutreachModalProps {
  ficheId: string
  airtableRecordId: string
  supplierName: string
  supplierEmail: string | undefined
  ficheSlug: string
  templateType: FicheTemplate
  templateFields: Record<string, unknown> | null
  heroImageUrl: string | null
  galleryUrls: string[] | null
  onClose: () => void
  onSent: () => void
}

export default function OutreachModal({
  ficheId,
  airtableRecordId,
  supplierName,
  supplierEmail,
  ficheSlug,
  templateType,
  templateFields,
  heroImageUrl,
  galleryUrls,
  onClose,
  onSent,
}: OutreachModalProps) {
  const gaps = detectGaps(templateType, templateFields, heroImageUrl, galleryUrls)

  const [to, setTo] = useState(supplierEmail || '')
  const [subject, setSubject] = useState(`The Gatekeepers Club -- ${supplierName}`)
  const [body, setBody] = useState(
    generateOutreachBody(supplierName, templateType, templateFields, heroImageUrl, galleryUrls)
  )
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')

  async function handleSend() {
    if (!to.trim() || !subject.trim() || !body.trim()) return
    setSending(true)
    setError('')

    const res = await fetch('/api/admin/outreach', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fiche_id: ficheId,
        airtable_record_id: airtableRecordId,
        supplier_name: supplierName,
        supplier_email: to.trim(),
        subject: subject.trim(),
        body: body.trim(),
      }),
    })

    if (res.ok) {
      onSent()
      onClose()
    } else {
      const data = await res.json()
      setError(data.error || 'Failed to send email')
    }
    setSending(false)
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-[8px] w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-lg font-semibold text-green">
              Outreach to {supplierName}
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">
              &times;
            </button>
          </div>
          {gaps.length > 0 && (
            <p className="text-xs text-amber-600 mt-2">
              {gaps.length} missing field{gaps.length !== 1 ? 's' : ''} detected. Asking supplier to fill gaps.
            </p>
          )}
          {gaps.length === 0 && (
            <p className="text-xs text-emerald-600 mt-2">
              All template fields populated. Sending introduction only.
            </p>
          )}
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
            <input
              type="email"
              value={to}
              onChange={e => setTo(e.target.value)}
              placeholder="supplier@example.com"
              className="w-full rounded-[4px] border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-green focus:outline-none focus:ring-1 focus:ring-green"
            />
            {!supplierEmail && (
              <p className="text-xs text-amber-600 mt-1">No email found in Airtable. Please enter manually.</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
            <input
              value={subject}
              onChange={e => setSubject(e.target.value)}
              className="w-full rounded-[4px] border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-green focus:outline-none focus:ring-1 focus:ring-green"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
            <textarea
              value={body}
              onChange={e => setBody(e.target.value)}
              rows={18}
              className="w-full rounded-[4px] border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-green focus:outline-none focus:ring-1 focus:ring-green font-body leading-relaxed"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={onClose}>Cancel</Button>
            <Button onClick={handleSend} disabled={sending || !to.trim()}>
              {sending ? 'Sending...' : 'Send via Resend'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
