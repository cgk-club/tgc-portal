import { Resend } from 'resend'

let _resend: Resend

function getResend(): Resend {
  if (!_resend) {
    _resend = new Resend(process.env.RESEND_API_KEY)
  }
  return _resend
}

const FROM_EMAIL = process.env.FROM_EMAIL || 'hello@thegatekeepers.club'

export async function sendMagicLink(to: string, name: string, token: string) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://portal.thegatekeepers.club'
  const link = `${appUrl}/client/auth/${token}`

  await getResend().emails.send({
    from: `The Gatekeepers Club <${FROM_EMAIL}>`,
    to,
    subject: 'Your TGC portal access',
    text: `${name},\n\nYour portal is ready.\n\nAccess my portal: ${link}\n\nThis link is valid for 24 hours. If you didn't request this, you can safely ignore it.\n\nThe Gatekeepers Club\nthegatekeepers.club`,
    html: `<div style="font-family: Georgia, serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
      <p style="font-size: 10px; letter-spacing: 3px; color: #c8aa4a; text-transform: uppercase; margin-bottom: 30px;">THE GATEKEEPERS CLUB</p>
      <p style="color: #333; font-size: 16px; line-height: 1.6;">${name},</p>
      <p style="color: #333; font-size: 16px; line-height: 1.6;">Your portal is ready.</p>
      <p style="margin: 30px 0;"><a href="${link}" style="display: inline-block; background: #0e4f51; color: white; text-decoration: none; padding: 12px 24px; font-size: 14px; letter-spacing: 1px;">Access my portal</a></p>
      <p style="color: #888; font-size: 13px; line-height: 1.6;">This link is valid for 24 hours. If you didn't request this, you can safely ignore it.</p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
      <p style="font-size: 10px; letter-spacing: 3px; color: #c8aa4a; text-transform: uppercase;">The Gatekeepers Club</p>
      <p style="color: #999; font-size: 12px;">thegatekeepers.club</p>
    </div>`,
  })
}

export async function sendPartnerMagicLink(to: string, name: string, token: string) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://portal.thegatekeepers.club'
  const link = `${appUrl}/partner/auth/${token}`

  await getResend().emails.send({
    from: `The Gatekeepers Club <${FROM_EMAIL}>`,
    to,
    subject: 'Your TGC partner portal access',
    text: `${name},\n\nYour partner portal is ready.\n\nAccess my portal: ${link}\n\nThis link is valid for 24 hours. If you didn't request this, you can safely ignore it.\n\nThe Gatekeepers Club\nthegatekeepers.club`,
    html: `<div style="font-family: Georgia, serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
      <p style="font-size: 10px; letter-spacing: 3px; color: #c8aa4a; text-transform: uppercase; margin-bottom: 30px;">THE GATEKEEPERS CLUB</p>
      <p style="color: #333; font-size: 16px; line-height: 1.6;">${name},</p>
      <p style="color: #333; font-size: 16px; line-height: 1.6;">Your partner portal is ready.</p>
      <p style="margin: 30px 0;"><a href="${link}" style="display: inline-block; background: #0e4f51; color: white; text-decoration: none; padding: 12px 24px; font-size: 14px; letter-spacing: 1px;">Access my portal</a></p>
      <p style="color: #888; font-size: 13px; line-height: 1.6;">This link is valid for 24 hours. If you didn't request this, you can safely ignore it.</p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
      <p style="font-size: 10px; letter-spacing: 3px; color: #c8aa4a; text-transform: uppercase;">The Gatekeepers Club</p>
      <p style="color: #999; font-size: 12px;">thegatekeepers.club</p>
    </div>`,
  })
}

function bodyToHtml(body: string): string {
  const blocks = body.split('\n\n')
  return blocks.map(block => {
    const lines = block.split('\n')
    const isBulletList = lines.every(l => l.startsWith('- ') || l.trim() === '')
    if (isBulletList && lines.some(l => l.startsWith('- '))) {
      const items = lines
        .filter(l => l.startsWith('- '))
        .map(l => `<li style="margin-bottom: 6px;">${l.slice(2)}</li>`)
        .join('')
      return `<ul style="color: #333; font-size: 15px; line-height: 1.7; padding-left: 20px; margin: 16px 0;">${items}</ul>`
    }
    const escaped = block.replace(/\n/g, '<br />')
    return `<p style="color: #333; font-size: 15px; line-height: 1.7;">${escaped}</p>`
  }).join('')
}

export async function sendEventEnquiryNotification(data: Record<string, unknown>) {
  const lines = [
    `Event: ${data.event_name || 'Not specified'}`,
    `Access type: ${data.access_type || 'Not specified'}`,
    `Group size: ${data.group_size || 'Not specified'}`,
    `Accommodation: ${data.accommodation_needs || 'None mentioned'}`,
    `Transfers: ${data.transfers_logistics || 'None mentioned'}`,
    `Dining: ${data.dining_preferences || 'None mentioned'}`,
    `Budget: ${data.budget_range || 'Not specified'}`,
    `Special requests: ${data.special_requests || 'None'}`,
    '',
    `Name: ${data.name}`,
    `Email: ${data.email}`,
    `Phone: ${data.phone || 'Not provided'}`,
    `Prefers: ${data.communication_pref || 'email'}`,
  ]

  const textBody = lines.join('\n')
  const htmlBody = lines.map(l => l ? `<p style="color: #333; font-size: 14px; line-height: 1.6; margin: 4px 0;">${l}</p>` : '<br />').join('')

  await getResend().emails.send({
    from: `TGC Events <${FROM_EMAIL}>`,
    to: 'christian@thegatekeepers.club',
    subject: `Event Enquiry: ${data.event_name || 'New enquiry'} - ${data.name}`,
    text: textBody,
    html: `<div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
      <p style="font-size: 10px; letter-spacing: 3px; color: #c8aa4a; text-transform: uppercase; margin-bottom: 30px;">NEW EVENT ENQUIRY</p>
      ${htmlBody}
      <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
      <p style="color: #999; font-size: 12px;">Submitted via portal.thegatekeepers.club/events/enquiry</p>
    </div>`,
  })
}

export async function sendClientRequestNotification(data: Record<string, unknown>) {
  const lines = [
    `Type: ${data.request_type || 'General'}`,
    `Summary: ${data.summary || 'See full chat below'}`,
    `Destination: ${data.destination || 'Not specified'}`,
    `Dates: ${data.dates || 'Not specified'}`,
    `Group: ${data.group_size || 'Not specified'}`,
    `Budget: ${data.budget_range || 'Not specified'}`,
    `Special requests: ${data.special_requests || 'None'}`,
    '',
    `Name: ${data.name}`,
    `Email: ${data.email}`,
    `Phone: ${data.phone || 'Not provided'}`,
    `Prefers: ${data.communication_pref || 'email'}`,
  ]

  const textBody = lines.join('\n')
  const htmlBody = lines.map(l => l ? `<p style="color: #333; font-size: 14px; line-height: 1.6; margin: 4px 0;">${l}</p>` : '<br />').join('')

  await getResend().emails.send({
    from: `TGC Portal <${FROM_EMAIL}>`,
    to: 'christian@thegatekeepers.club',
    subject: `Client Request: ${data.request_type || 'General'} - ${data.name}`,
    text: textBody,
    html: `<div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
      <p style="font-size: 10px; letter-spacing: 3px; color: #c8aa4a; text-transform: uppercase; margin-bottom: 30px;">NEW CLIENT REQUEST</p>
      ${htmlBody}
      <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
      <p style="color: #999; font-size: 12px;">Submitted via client portal conversation</p>
    </div>`,
  })
}

export async function sendOutreachEmail(to: string, subject: string, body: string) {
  await getResend().emails.send({
    from: `Christian de Jabrun <${FROM_EMAIL}>`,
    to,
    subject,
    text: body,
    html: `<div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
      <p style="font-size: 10px; letter-spacing: 3px; color: #c8aa4a; text-transform: uppercase; margin-bottom: 30px;">THE GATEKEEPERS CLUB</p>
      ${bodyToHtml(body)}
      <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
      <p style="font-size: 10px; letter-spacing: 3px; color: #c8aa4a; text-transform: uppercase;">The Gatekeepers Club</p>
      <p style="color: #999; font-size: 12px;">jeeves@thegatekeepers.club</p>
      <p style="color: #999; font-size: 12px;">thegatekeepers.club</p>
    </div>`,
  })
}
