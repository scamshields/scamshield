import { flagReport } from "@/lib/db"
import {
  generateFingerprint,
  getClientIp,
  hashIpAddress,
  type BrowserFingerprintData,
} from "@/lib/fingerprint"
import { checkRateLimit } from "@/lib/rate-limiter"

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { reason, fingerprint } = await request.json()

    if (!reason || !fingerprint) {
      return Response.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Validate fingerprint data structure
    const browserData = fingerprint as BrowserFingerprintData
    if (!browserData.canvas || !browserData.webgl || !browserData.navigator) {
      return Response.json({ error: "Invalid fingerprint data" }, { status: 400 })
    }

    // Get client IP address
    const clientIp = getClientIp(request)

    // Hash IP for rate limiting (only exists in memory, never stored in DB)
    const ipHash = hashIpAddress(clientIp)

    // Check in-memory rate limit (max 3 flags per hour from same IP)
    const allowedByRateLimit = checkRateLimit(ipHash, id)
    if (!allowedByRateLimit) {
      return Response.json(
        {
          error: "Rate limit exceeded. You can only flag 3 reports per hour. Please try again later.",
        },
        { status: 429 }, // Too Many Requests
      )
    }

    // Generate privacy-preserving fingerprint hash from IP + browser characteristics
    const fingerprintHash = generateFingerprint(clientIp, browserData)

    // Try to flag the report - returns whether it was actually inserted
    const result = await flagReport(id, null, fingerprintHash, reason)

    if (!result.inserted) {
      // Flag already exists for this fingerprint
      return Response.json({ error: "You have already flagged this report" }, { status: 409 })
    }

    return Response.json({
      success: true,
      message: "Report flagged successfully. Community moderation in effect.",
    })
  } catch (error: any) {
    console.error("Flag failed:", error)
    return Response.json({ error: "Failed to flag report" }, { status: 500 })
  }
}
