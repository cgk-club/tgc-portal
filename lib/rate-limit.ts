// Simple in-memory rate limiter for login endpoints
const loginAttempts = new Map<string, { count: number; resetAt: number }>();

/**
 * Check if an IP address has exceeded the rate limit.
 * @returns true if the request is allowed, false if rate limited.
 */
export function checkRateLimit(
  ip: string,
  maxAttempts = 5,
  windowMs = 15 * 60 * 1000
): boolean {
  const now = Date.now();
  const record = loginAttempts.get(ip);

  if (!record || now > record.resetAt) {
    loginAttempts.set(ip, { count: 1, resetAt: now + windowMs });
    return true;
  }

  record.count++;
  return record.count <= maxAttempts;
}
