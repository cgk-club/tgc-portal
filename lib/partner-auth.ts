import { SignJWT, jwtVerify } from 'jose'

const PARTNER_COOKIE_NAME = 'tgc_partner_session'
const THIRTY_DAYS = 30 * 24 * 60 * 60

function getSecret(): Uint8Array {
  const secret = process.env.ADMIN_SESSION_SECRET
  if (!secret) throw new Error('ADMIN_SESSION_SECRET environment variable is required')
  return new TextEncoder().encode(secret)
}

export async function createPartnerSession(partnerId: string, userId: string, email: string): Promise<string> {
  const token = await new SignJWT({ role: 'partner', partnerId, userId, email })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${THIRTY_DAYS}s`)
    .sign(getSecret())
  return token
}

export async function verifyPartnerSession(token: string): Promise<{ partnerId: string; userId: string; email: string } | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret())
    if (payload.role !== 'partner') return null
    return {
      partnerId: payload.partnerId as string,
      userId: payload.userId as string,
      email: payload.email as string,
    }
  } catch {
    return null
  }
}

export { PARTNER_COOKIE_NAME }
