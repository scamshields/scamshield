/**
 * In-memory rate limiter for flag attempts
 * No database storage - completely ephemeral
 * Automatically cleans up old entries
 */

interface RateLimitEntry {
  attempts: number
  firstAttempt: number
  lastAttempt: number
}

// In-memory storage - will reset on server restart (which is fine for rate limiting)
const rateLimitMap = new Map<string, RateLimitEntry>()

// Configuration
const MAX_FLAGS_PER_HOUR = 3
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000 // 1 hour
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000 // Clean up every 5 minutes

/**
 * Clean up old entries to prevent memory leaks
 */
function cleanupOldEntries() {
  const now = Date.now()
  const cutoff = now - RATE_LIMIT_WINDOW_MS

  for (const [key, entry] of rateLimitMap.entries()) {
    if (entry.lastAttempt < cutoff) {
      rateLimitMap.delete(key)
    }
  }
}

// Start periodic cleanup
if (typeof setInterval !== "undefined") {
  setInterval(cleanupOldEntries, CLEANUP_INTERVAL_MS)
}

/**
 * Check if an IP+reportId combination is allowed to flag
 * @param ipHash - SHA256 hash of IP address
 * @param reportId - Report being flagged
 * @returns true if allowed, false if rate limited
 */
export function checkRateLimit(ipHash: string, reportId: string): boolean {
  const key = `${ipHash}:${reportId}`
  const now = Date.now()
  const entry = rateLimitMap.get(key)

  if (!entry) {
    // First attempt
    rateLimitMap.set(key, {
      attempts: 1,
      firstAttempt: now,
      lastAttempt: now,
    })
    return true
  }

  // Check if window has expired
  const windowStart = now - RATE_LIMIT_WINDOW_MS
  if (entry.firstAttempt < windowStart) {
    // Window expired, reset
    rateLimitMap.set(key, {
      attempts: 1,
      firstAttempt: now,
      lastAttempt: now,
    })
    return true
  }

  // Within window - check limit
  if (entry.attempts >= MAX_FLAGS_PER_HOUR) {
    // Update last attempt time but don't increment
    entry.lastAttempt = now
    return false
  }

  // Increment and allow
  entry.attempts++
  entry.lastAttempt = now
  return true
}

/**
 * Get current rate limit stats for debugging (optional)
 */
export function getRateLimitStats() {
  return {
    totalEntries: rateLimitMap.size,
    maxFlagsPerHour: MAX_FLAGS_PER_HOUR,
    windowMs: RATE_LIMIT_WINDOW_MS,
  }
}
