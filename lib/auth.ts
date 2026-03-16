import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'

const COOKIE_NAME = 'tgc_admin_session'
const ONE_WEEK = 7 * 24 * 60 * 60

function getSecret(): Uint8Array {
  const secret = process.env.ADMIN_SESSION_SECRET || 'dev-secret-change-me'
  return new TextEncoder().encode(secret)
}

export async function createSession(): Promise<string> {
  const token = await new SignJWT({ role: 'admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${ONE_WEEK}s`)
    .sign(getSecret())

  return token
}

export async function verifySession(token: string): Promise<boolean> {
  try {
    await jwtVerify(token, getSecret())
    return true
  } catch {
    return false
  }
}

export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  if (!token) return false
  return verifySession(token)
}

export { COOKIE_NAME }
