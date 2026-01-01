import { createHash } from "crypto"

export interface BrowserFingerprintData {
  canvas: string
  webgl: string
  fonts: string
  audio: string
  screen: string
  navigator: string
  timezone: number
  language: string
  platform: string
  hardwareConcurrency: number
  deviceMemory: number
  colorDepth: number
}

/**
 * Generate a privacy-preserving fingerprint hash from IP address and browser characteristics
 * We don't store the raw values - only the hash
 * This makes it very hard to spoof while maintaining privacy
 */
export function generateFingerprint(ip: string, browserData: BrowserFingerprintData): string {
  // Normalize IP (remove IPv6 prefix if present)
  const normalizedIp = ip.replace(/^::ffff:/, "")

  // Create a comprehensive fingerprint string combining all data
  const fingerprintData = [
    `ip:${normalizedIp}`,
    `canvas:${browserData.canvas}`,
    `webgl:${browserData.webgl}`,
    `fonts:${browserData.fonts}`,
    `audio:${browserData.audio}`,
    `screen:${browserData.screen}`,
    `nav:${browserData.navigator}`,
    `tz:${browserData.timezone}`,
    `lang:${browserData.language}`,
    `plat:${browserData.platform}`,
    `hw:${browserData.hardwareConcurrency}`,
    `mem:${browserData.deviceMemory}`,
    `color:${browserData.colorDepth}`,
  ].join("|")

  // Hash using SHA-256 for privacy
  const hash = createHash("sha256").update(fingerprintData).digest("hex")

  return hash
}

/**
 * Extract IP address from request headers
 * Checks common proxy headers first, falls back to socket
 */
export function getClientIp(request: Request): string {
  // Check common proxy headers
  const forwardedFor = request.headers.get("x-forwarded-for")
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim()
  }

  const realIp = request.headers.get("x-real-ip")
  if (realIp) {
    return realIp
  }

  // Fallback to a default for local development
  return "127.0.0.1"
}

/**
 * Hash IP address for rate limiting
 * Separate from full fingerprint to enable IP-based rate limiting
 */
export function hashIpAddress(ip: string): string {
  const normalizedIp = ip.replace(/^::ffff:/, "")
  return createHash("sha256").update(`ip-rate-limit:${normalizedIp}`).digest("hex")
}
