import { SignJWT, jwtVerify } from 'jose'

const CLIENT_COOKIE_NAME = 'tgc_client_session'
const THIRTY_DAYS = 30 * 24 * 60 * 60

function getSecret(): Uint8Array {
  const secret = process.env.ADMIN_SESSION_SECRET || 'dev-secret-change-me'
  return new TextEncoder().encode(secret)
}

export async function createClientSession(clientId: string, email: string): Promise<string> {
  const token = await new SignJWT({ role: 'client', clientId, email })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${THIRTY_DAYS}s`)
    .sign(getSecret())
  return token
}

export async function verifyClientSession(token: string): Promise<{ clientId: string; email: string } | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret())
    if (payload.role !== 'client') return null
    return { clientId: payload.clientId as string, email: payload.email as string }
  } catch {
    return null
  }
}

export { CLIENT_COOKIE_NAME }
