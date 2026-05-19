// Simple in-memory rate limiter for login endpoints
const loginAttempts = new Map<string, { count: number; resetAt: number }>();

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

// Separate rate limiter for unauthenticated chat endpoints (30 req / 15 min per IP)
const chatRequests = new Map<string, { count: number; resetAt: number }>();

export function checkChatRateLimit(ip: string): boolean {
  const now = Date.now();
  const windowMs = 15 * 60 * 1000;
  const record = chatRequests.get(ip);

  if (!record || now > record.resetAt) {
    chatRequests.set(ip, { count: 1, resetAt: now + windowMs });
    return true;
  }

  record.count++;
  return record.count <= 30;
}
