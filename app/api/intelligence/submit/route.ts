import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

export const dynamic = 'force-dynamic'

const FROM_EMAIL = process.env.FROM_EMAIL || 'jeeves@thegatekeepers.club'
const ADMIN_EMAIL = 'jeeves@thegatekeepers.club'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, submittedAt, corridor, market, brief, client } = body

    if (!type || !client?.email) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const resend = new Resend(process.env.RESEND_API_KEY)
    const submittedDate = new Date(submittedAt || Date.now()).toLocaleString('en-GB', {
      timeZone: 'Europe/Paris',
      dateStyle: 'medium',
      timeStyle: 'short',
    })

    // Build notification email body
    let subject = ''
    let htmlBody = ''

    if (type === 'transport') {
      subject = `Intelligence brief: Transport — ${corridor?.name || 'Unknown corridor'}`
      htmlBody = `
        <h2 style="font-family: Georgia, serif; color: #1a1815;">New Transport Intelligence Brief</h2>
        <p style="font-family: Arial, sans-serif; color: #444;"><strong>Submitted:</strong> ${submittedDate}</p>

        <h3 style="font-family: Georgia, serif; color: #5a4a2a;">Corridor</h3>
        <p style="font-family: Arial, sans-serif;">${corridor?.name || 'Not specified'}<br/>
        Default mode: ${corridor?.defaultMode || 'Not specified'}</p>

        <h3 style="font-family: Georgia, serif; color: #5a4a2a;">Journey Brief</h3>
        <table style="font-family: Arial, sans-serif; font-size: 14px; border-collapse: collapse;">
          <tr><td style="padding: 4px 12px 4px 0; color: #888;">Purpose</td><td>${brief?.purpose || '-'}</td></tr>
          <tr><td style="padding: 4px 12px 4px 0; color: #888;">Travellers</td><td>${brief?.travellers || '-'}</td></tr>
          <tr><td style="padding: 4px 12px 4px 0; color: #888;">Luggage</td><td>${brief?.luggage || '-'}</td></tr>
          <tr><td style="padding: 4px 12px 4px 0; color: #888;">Frequency</td><td>${brief?.frequency || '-'}</td></tr>
          <tr><td style="padding: 4px 12px 4px 0; color: #888;">Priority</td><td>${brief?.priority || '-'}</td></tr>
          <tr><td style="padding: 4px 12px 4px 0; color: #888;">Flexibility</td><td>${brief?.flexibility || '-'}</td></tr>
          <tr><td style="padding: 4px 12px 4px 0; color: #888;">Travel date</td><td>${client?.travelDate || '-'}</td></tr>
          <tr><td style="padding: 4px 12px 4px 0; color: #888;">Return date</td><td>${client?.returnDate || '-'}</td></tr>
        </table>

        <h3 style="font-family: Georgia, serif; color: #5a4a2a;">Client</h3>
        <table style="font-family: Arial, sans-serif; font-size: 14px; border-collapse: collapse;">
          <tr><td style="padding: 4px 12px 4px 0; color: #888;">Name</td><td>${client?.name || '-'}</td></tr>
          <tr><td style="padding: 4px 12px 4px 0; color: #888;">Email</td><td><a href="mailto:${client?.email}">${client?.email}</a></td></tr>
          <tr><td style="padding: 4px 12px 4px 0; color: #888;">Phone</td><td>${client?.phone || '-'}</td></tr>
        </table>
        ${client?.message ? `<p style="font-family: Arial, sans-serif;"><strong>Notes:</strong> ${client.message}</p>` : ''}
      `
    } else if (type === 'realestate') {
      subject = `Intelligence brief: Real Estate — ${market?.name || brief?.territory || 'Enquiry'}`
      htmlBody = `
        <h2 style="font-family: Georgia, serif; color: #1a1815;">New Real Estate Intelligence Brief</h2>
        <p style="font-family: Arial, sans-serif; color: #444;"><strong>Submitted:</strong> ${submittedDate}</p>

        <h3 style="font-family: Georgia, serif; color: #5a4a2a;">Market</h3>
        <p style="font-family: Arial, sans-serif;">${market?.name || brief?.territory || 'Not specified'}</p>

        <h3 style="font-family: Georgia, serif; color: #5a4a2a;">Mandate</h3>
        <table style="font-family: Arial, sans-serif; font-size: 14px; border-collapse: collapse;">
          <tr><td style="padding: 4px 12px 4px 0; color: #888;">Direction</td><td>${brief?.direction || '-'}</td></tr>
          <tr><td style="padding: 4px 12px 4px 0; color: #888;">Property type</td><td>${brief?.propertyType || '-'}</td></tr>
          <tr><td style="padding: 4px 12px 4px 0; color: #888;">Budget</td><td>${brief?.budgetMin ? `€${brief.budgetMin}M – €${brief.budgetMax}M` : '-'}</td></tr>
          <tr><td style="padding: 4px 12px 4px 0; color: #888;">Timeline</td><td>${brief?.timeline || '-'}</td></tr>
          <tr><td style="padding: 4px 12px 4px 0; color: #888;">Confidentiality</td><td>${brief?.confidentiality || '-'}</td></tr>
          <tr><td style="padding: 4px 12px 4px 0; color: #888;">Non-negotiables</td><td>${brief?.nonNegotiables || '-'}</td></tr>
        </table>

        ${brief?.structuring ? `
        <h3 style="font-family: Georgia, serif; color: #5a4a2a;">Structuring</h3>
        <table style="font-family: Arial, sans-serif; font-size: 14px; border-collapse: collapse;">
          <tr><td style="padding: 4px 12px 4px 0; color: #888;">Vehicle</td><td>${brief.structuring.vehicle || '-'}</td></tr>
          <tr><td style="padding: 4px 12px 4px 0; color: #888;">Tax residence</td><td>${brief.structuring.taxResidence || '-'}</td></tr>
          <tr><td style="padding: 4px 12px 4px 0; color: #888;">Notes</td><td>${brief.structuring.notes || '-'}</td></tr>
        </table>
        ` : ''}

        <h3 style="font-family: Georgia, serif; color: #5a4a2a;">Client</h3>
        <table style="font-family: Arial, sans-serif; font-size: 14px; border-collapse: collapse;">
          <tr><td style="padding: 4px 12px 4px 0; color: #888;">Name</td><td>${client?.name || '-'}</td></tr>
          <tr><td style="padding: 4px 12px 4px 0; color: #888;">Email</td><td><a href="mailto:${client?.email}">${client?.email}</a></td></tr>
          <tr><td style="padding: 4px 12px 4px 0; color: #888;">Phone</td><td>${client?.phone || '-'}</td></tr>
          <tr><td style="padding: 4px 12px 4px 0; color: #888;">Tax residence</td><td>${client?.taxResidence || '-'}</td></tr>
        </table>
      `
    } else if (type === 'wellness') {
      subject = `Intelligence brief: Wellness — ${client?.name || 'Enquiry'}`
      htmlBody = `
        <h2 style="font-family: Georgia, serif; color: #1a1815;">New Wellness Intelligence Brief</h2>
        <p style="font-family: Arial, sans-serif; color: #444;"><strong>Submitted:</strong> ${submittedDate}</p>

        <h3 style="font-family: Georgia, serif; color: #5a4a2a;">Health Brief</h3>
        <table style="font-family: Arial, sans-serif; font-size: 14px; border-collapse: collapse;">
          <tr><td style="padding: 4px 12px 4px 0; color: #888;">Goal</td><td>${brief?.goal || '-'}</td></tr>
          <tr><td style="padding: 4px 12px 4px 0; color: #888;">Duration</td><td>${brief?.duration || '-'}</td></tr>
          <tr><td style="padding: 4px 12px 4px 0; color: #888;">Style</td><td>${brief?.style || '-'}</td></tr>
          <tr><td style="padding: 4px 12px 4px 0; color: #888;">Travelling with</td><td>${brief?.companion || '-'}</td></tr>
          <tr><td style="padding: 4px 12px 4px 0; color: #888;">Location</td><td>${brief?.location || '-'}</td></tr>
          <tr><td style="padding: 4px 12px 4px 0; color: #888;">Budget</td><td>${brief?.budget || '-'}</td></tr>
        </table>

        <h3 style="font-family: Georgia, serif; color: #5a4a2a;">Client</h3>
        <table style="font-family: Arial, sans-serif; font-size: 14px; border-collapse: collapse;">
          <tr><td style="padding: 4px 12px 4px 0; color: #888;">Name</td><td>${client?.name || '-'}</td></tr>
          <tr><td style="padding: 4px 12px 4px 0; color: #888;">Email</td><td><a href="mailto:${client?.email}">${client?.email}</a></td></tr>
          <tr><td style="padding: 4px 12px 4px 0; color: #888;">Phone</td><td>${client?.phone || '-'}</td></tr>
        </table>
        ${client?.message ? `<p style="font-family: Arial, sans-serif;"><strong>Notes:</strong> ${client.message}</p>` : ''}
      `
    } else if (type === 'events-production') {
      const flowLabels: Record<string, string> = { private: 'Private', corporate: 'Corporate', mice: 'MICE' }
      subject = `Intelligence brief: Events Production — ${body.eventType?.replace(/-/g, ' ') || 'Enquiry'} · ${client?.name || ''}`
      htmlBody = `
        <h2 style="font-family: Georgia, serif; color: #1a1815;">New Events Production Brief</h2>
        <p style="font-family: Arial, sans-serif; color: #444;"><strong>Reference:</strong> ${body.mandateId || '-'}</p>
        <p style="font-family: Arial, sans-serif; color: #444;"><strong>Submitted:</strong> ${submittedDate}</p>

        <h3 style="font-family: Georgia, serif; color: #5a4a2a;">Event</h3>
        <table style="font-family: Arial, sans-serif; font-size: 14px; border-collapse: collapse;">
          <tr><td style="padding: 4px 12px 4px 0; color: #888;">Flow family</td><td>${flowLabels[body.flowFamily] || body.flowFamily || '-'}</td></tr>
          <tr><td style="padding: 4px 12px 4px 0; color: #888;">Event type</td><td>${body.eventType?.replace(/-/g, ' ') || '-'}</td></tr>
          <tr><td style="padding: 4px 12px 4px 0; color: #888;">Catchment</td><td>${body.catchment?.replace(/-/g, ' ') || '-'}</td></tr>
          <tr><td style="padding: 4px 12px 4px 0; color: #888;">Guests</td><td>${brief?.guestCount || '-'}</td></tr>
          <tr><td style="padding: 4px 12px 4px 0; color: #888;">Date</td><td>${brief?.date || '-'}</td></tr>
          <tr><td style="padding: 4px 12px 4px 0; color: #888;">Timeline</td><td>${brief?.timeline || '-'}</td></tr>
          <tr><td style="padding: 4px 12px 4px 0; color: #888;">Budget</td><td>${brief?.budget || '-'}</td></tr>
          <tr><td style="padding: 4px 12px 4px 0; color: #888;">Confidentiality</td><td>${brief?.confidentiality || '-'}</td></tr>
        </table>

        ${body.love ? `<h3 style="font-family: Georgia, serif; color: #5a4a2a;">What they'd love</h3><p style="font-family: Arial, sans-serif;">${body.love}</p>` : ''}
        ${body.hate ? `<h3 style="font-family: Georgia, serif; color: #5a4a2a;">What they'd hate</h3><p style="font-family: Arial, sans-serif;">${body.hate}</p>` : ''}
        ${brief?.notes ? `<h3 style="font-family: Georgia, serif; color: #5a4a2a;">Notes</h3><p style="font-family: Arial, sans-serif;">${brief.notes}</p>` : ''}

        <h3 style="font-family: Georgia, serif; color: #5a4a2a;">Moment Sketch</h3>
        <pre style="font-family: Georgia, serif; font-size: 14px; white-space: pre-wrap; background: #fdf6e9; padding: 16px; border-left: 3px solid #8b6f3e;">${body.momentSketch || '-'}</pre>

        <h3 style="font-family: Georgia, serif; color: #5a4a2a;">Client</h3>
        <table style="font-family: Arial, sans-serif; font-size: 14px; border-collapse: collapse;">
          <tr><td style="padding: 4px 12px 4px 0; color: #888;">Name</td><td>${client?.name || '-'}</td></tr>
          <tr><td style="padding: 4px 12px 4px 0; color: #888;">Email</td><td><a href="mailto:${client?.email}">${client?.email}</a></td></tr>
          <tr><td style="padding: 4px 12px 4px 0; color: #888;">Phone</td><td>${client?.phone || '-'}</td></tr>
          <tr><td style="padding: 4px 12px 4px 0; color: #888;">Organisation</td><td>${client?.organisation || '-'}</td></tr>
        </table>
      `
    } else if (type === 'vip-hospitality') {
      subject = `VIP Hospitality brief: ${body.event?.name || 'Event'} — ${client?.name || 'Enquiry'}`
      htmlBody = `
        <h2 style="font-family: Georgia, serif; color: #1a1815;">New VIP Hospitality Brief</h2>
        <p style="font-family: Arial, sans-serif; color: #444;"><strong>Reference:</strong> ${body.refId || '-'}</p>
        <p style="font-family: Arial, sans-serif; color: #444;"><strong>Submitted:</strong> ${submittedDate}</p>

        <h3 style="font-family: Georgia, serif; color: #5a4a2a;">Event</h3>
        <table style="font-family: Arial, sans-serif; font-size: 14px; border-collapse: collapse;">
          <tr><td style="padding: 4px 12px 4px 0; color: #888;">Event</td><td>${body.event?.name || '-'}</td></tr>
          <tr><td style="padding: 4px 12px 4px 0; color: #888;">Location</td><td>${body.event?.location || '-'}</td></tr>
          <tr><td style="padding: 4px 12px 4px 0; color: #888;">Dates</td><td>${body.event?.dates || '-'}</td></tr>
        </table>

        <h3 style="font-family: Georgia, serif; color: #5a4a2a;">Brief</h3>
        <table style="font-family: Arial, sans-serif; font-size: 14px; border-collapse: collapse;">
          <tr><td style="padding: 4px 12px 4px 0; color: #888;">Party</td><td>${brief?.party || '-'}</td></tr>
          <tr><td style="padding: 4px 12px 4px 0; color: #888;">Occasion</td><td>${brief?.occasion || '-'}</td></tr>
          <tr><td style="padding: 4px 12px 4px 0; color: #888;">Priorities</td><td>${Array.isArray(brief?.priorities) ? brief.priorities.join(', ') : '-'}</td></tr>
          <tr><td style="padding: 4px 12px 4px 0; color: #888;">Dates</td><td>${brief?.datesConfirmed || '-'}</td></tr>
          <tr><td style="padding: 4px 12px 4px 0; color: #888;">Budget</td><td>${brief?.budget || '-'}</td></tr>
        </table>
        ${brief?.notes ? `<p style="font-family: Arial, sans-serif;"><strong>Notes:</strong> ${brief.notes}</p>` : ''}

        <h3 style="font-family: Georgia, serif; color: #5a4a2a;">Client</h3>
        <table style="font-family: Arial, sans-serif; font-size: 14px; border-collapse: collapse;">
          <tr><td style="padding: 4px 12px 4px 0; color: #888;">Name</td><td>${client?.name || '-'}</td></tr>
          <tr><td style="padding: 4px 12px 4px 0; color: #888;">Email</td><td><a href="mailto:${client?.email}">${client?.email}</a></td></tr>
          <tr><td style="padding: 4px 12px 4px 0; color: #888;">Phone</td><td>${client?.phone || '-'}</td></tr>
        </table>
      `
    } else if (type === 'art-collectables') {
      const flagNames = (body.selectedFlags || body.category?.structuringFlags || []).join(', ')
      subject = `Intelligence brief: Art & Collectables — ${body.category?.name || 'Enquiry'} · ${client?.name || ''}`
      htmlBody = `
        <h2 style="font-family: Georgia, serif; color: #1a1815;">New Art & Collectables Brief</h2>
        <p style="font-family: Arial, sans-serif; color: #444;"><strong>Reference:</strong> ${body.refId || '-'}</p>
        <p style="font-family: Arial, sans-serif; color: #444;"><strong>Submitted:</strong> ${submittedDate}</p>

        <h3 style="font-family: Georgia, serif; color: #5a4a2a;">Category</h3>
        <p style="font-family: Arial, sans-serif;">${body.category?.name || 'Not specified'}</p>

        <h3 style="font-family: Georgia, serif; color: #5a4a2a;">Mandate</h3>
        <table style="font-family: Arial, sans-serif; font-size: 14px; border-collapse: collapse;">
          <tr><td style="padding: 4px 12px 4px 0; color: #888;">Direction</td><td>${body.direction || '-'}</td></tr>
          <tr><td style="padding: 4px 12px 4px 0; color: #888;">Channel</td><td>${body.channel || '-'}</td></tr>
          <tr><td style="padding: 4px 12px 4px 0; color: #888;">Budget</td><td>${body.budget || '-'}</td></tr>
        </table>

        ${flagNames ? `<h3 style="font-family: Georgia, serif; color: #5a4a2a;">Structuring flags</h3><p style="font-family: Arial, sans-serif;">${flagNames}</p>` : ''}

        <h3 style="font-family: Georgia, serif; color: #5a4a2a;">Brief</h3>
        <table style="font-family: Arial, sans-serif; font-size: 14px; border-collapse: collapse;">
          <tr><td style="padding: 4px 12px 4px 0; color: #888;">Specific interest</td><td>${brief?.specific || '-'}</td></tr>
          <tr><td style="padding: 4px 12px 4px 0; color: #888;">Timeline</td><td>${brief?.timeline || '-'}</td></tr>
          <tr><td style="padding: 4px 12px 4px 0; color: #888;">Existing collection</td><td>${brief?.existingCollection || '-'}</td></tr>
          <tr><td style="padding: 4px 12px 4px 0; color: #888;">Confidentiality</td><td>${brief?.confidentiality || '-'}</td></tr>
        </table>
        ${brief?.notes ? `<p style="font-family: Arial, sans-serif;"><strong>Notes:</strong> ${brief.notes}</p>` : ''}

        <h3 style="font-family: Georgia, serif; color: #5a4a2a;">Client</h3>
        <table style="font-family: Arial, sans-serif; font-size: 14px; border-collapse: collapse;">
          <tr><td style="padding: 4px 12px 4px 0; color: #888;">Name</td><td>${client?.name || '-'}</td></tr>
          <tr><td style="padding: 4px 12px 4px 0; color: #888;">Email</td><td><a href="mailto:${client?.email}">${client?.email}</a></td></tr>
          <tr><td style="padding: 4px 12px 4px 0; color: #888;">Phone</td><td>${client?.phone || '-'}</td></tr>
        </table>
      `
    } else {
      subject = `Intelligence brief: ${type} — ${client?.name || 'Enquiry'}`
      htmlBody = `<pre style="font-family: monospace;">${JSON.stringify(body, null, 2)}</pre>`
    }

    // Send notification to admin
    await resend.emails.send({
      from: `The Gatekeepers Club <${FROM_EMAIL}>`,
      to: ADMIN_EMAIL,
      subject,
      html: `
        <div style="max-width: 600px; margin: 0 auto; padding: 32px 24px; background: #f5f1ea;">
          ${htmlBody}
          <hr style="border: none; border-top: 1px solid #d8d0c0; margin: 32px 0;" />
          <p style="font-family: Arial, sans-serif; font-size: 12px; color: #999;">
            Submitted via TGC Intelligence Suite — ${type} tool
          </p>
        </div>
      `,
    })

    // Send confirmation to the client (if email provided and not a test)
    if (client?.email && !client.email.includes('test')) {
      await resend.emails.send({
        from: `The Gatekeepers Club <${FROM_EMAIL}>`,
        to: client.email,
        subject: 'Your brief has been received',
        html: `
          <div style="max-width: 560px; margin: 0 auto; padding: 40px 24px; background: #f5f1ea; font-family: Georgia, serif;">
            <p style="font-size: 13px; letter-spacing: 0.12em; text-transform: uppercase; color: #8b6f3e;">The Gatekeepers Club</p>
            <h2 style="font-weight: 400; font-size: 28px; line-height: 1.2; color: #1a1815; margin: 16px 0;">
              We have your brief, ${(client.name || '').split(' ')[0] || 'thank you'}.
            </h2>
            <p style="font-size: 16px; font-style: italic; color: #6b645a; line-height: 1.6;">
              Your Gatekeeper will review it and be in touch shortly.
            </p>
            <p style="font-size: 14px; color: #6b645a; margin-top: 32px; line-height: 1.6;">
              In the meantime, if anything changes or you have further context to share,
              reply to this email or write to <a href="mailto:christian@thegatekeepers.club" style="color: #5a4a2a;">christian@thegatekeepers.club</a>.
            </p>
            <hr style="border: none; border-top: 1px solid #d8d0c0; margin: 32px 0;" />
            <p style="font-size: 12px; color: #aaa; font-family: Arial, sans-serif;">
              The Gatekeepers Club &middot; thegatekeepers.club
            </p>
          </div>
        `,
      })
    }

    // Airtable CRM sync — log as Interaction (non-blocking)
    if (process.env.AIRTABLE_API_KEY && process.env.AIRTABLE_BASE_ID) {
      const today = new Date().toISOString().split('T')[0]
      const summary = `Intelligence brief: ${type} — ${client?.name || 'Unknown'} (${client?.email || ''})`
      try {
        await fetch(`https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/Interactions`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            records: [{
              fields: {
                Summary: summary,
                Date: today,
                Subject: subject,
                Notes: JSON.stringify(body, null, 2),
                Type: ['Note'],
                Direction: 'Inbound',
                Channel: ['Portal'],
                Purpose: 'Service Request',
                Status: 'Pending Response',
                'Created By': 'System',
                'Follow-up Required': true,
                Sentiment: 'Neutral',
              },
            }],
          }),
        })
      } catch (airtableErr) {
        console.error('Airtable CRM sync failed (non-blocking):', airtableErr)
      }
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Intelligence submit error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
