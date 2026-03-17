import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { sendOutreachEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  const { fiche_id, airtable_record_id, supplier_name, supplier_email, subject, body } = await request.json()

  if (!supplier_email || !subject || !body) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  try {
    await sendOutreachEmail(supplier_email, subject, body)
  } catch (err) {
    console.error('Outreach email failed:', err)
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
  }

  // Log the outreach
  const sb = getSupabaseAdmin()
  await sb.from('outreach_log').insert({
    fiche_id: fiche_id || null,
    airtable_record_id: airtable_record_id || null,
    supplier_name: supplier_name || null,
    supplier_email,
    subject,
  })

  // Try to write back to Airtable Interactions table
  const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY
  const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID
  if (AIRTABLE_API_KEY && AIRTABLE_BASE_ID && airtable_record_id) {
    try {
      await fetch(
        `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent('Interactions')}`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${AIRTABLE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            records: [{
              fields: {
                Organization: [airtable_record_id],
                Type: 'Email',
                Notes: `Outreach email sent via TGC Portal: ${subject}`,
                Date: new Date().toISOString().split('T')[0],
              },
            }],
          }),
        }
      )
    } catch {
      // Airtable write-back is optional, don't fail the request
      console.error('Airtable interaction write-back failed')
    }
  }

  return NextResponse.json({ ok: true })
}
