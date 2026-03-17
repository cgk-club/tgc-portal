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

export async function sendOutreachEmail(to: string, subject: string, body: string) {
  await getResend().emails.send({
    from: `Christian de Jabrun <${FROM_EMAIL}>`,
    to,
    subject,
    text: body,
    html: `<div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
      <p style="font-size: 10px; letter-spacing: 3px; color: #c8aa4a; text-transform: uppercase; margin-bottom: 30px;">THE GATEKEEPERS CLUB</p>
      ${body.split('\n\n').map(p => `<p style="color: #333; font-size: 15px; line-height: 1.7;">${p}</p>`).join('')}
      <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
      <p style="font-size: 10px; letter-spacing: 3px; color: #c8aa4a; text-transform: uppercase;">The Gatekeepers Club</p>
      <p style="color: #999; font-size: 12px;">hello@thegatekeepers.club</p>
      <p style="color: #999; font-size: 12px;">thegatekeepers.club</p>
    </div>`,
  })
}
