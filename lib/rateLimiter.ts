/**
 * Client-side rate limiter to prevent abuse
 * This is a defense-in-depth measure; real enforcement happens server-side
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const limits = new Map<string, RateLimitEntry>();

/**
 * Check if an action is rate-limited
 * @param key - Unique key for the action (e.g., 'humanize', 'login')
 * @param maxRequests - Max requests allowed in the window
 * @param windowMs - Time window in milliseconds
 * @returns true if the action is allowed, false if rate-limited
 */
export function checkRateLimit(key: string, maxRequests: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = limits.get(key);

  if (!entry || now > entry.resetAt) {
    limits.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (entry.count >= maxRequests) {
    return false;
  }

  entry.count++;
  return true;
}

/**
 * Pre-configured rate limits for common actions
 */
export const RateLimits = {
  /** Humanize: max 10 requests per minute */
  humanize: () => checkRateLimit('humanize', 10, 60_000),
  /** Login attempts: max 5 per 5 minutes */
  login: () => checkRateLimit('login', 5, 300_000),
  /** Contact form: max 3 per 10 minutes */
  contact: () => checkRateLimit('contact', 3, 600_000),
  /** Feedback: max 5 per 5 minutes */
  feedback: () => checkRateLimit('feedback', 5, 300_000),
} as const;
