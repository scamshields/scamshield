import { neon } from "@neondatabase/serverless"

let sqlClient: ReturnType<typeof neon> | null = null

function getSqlClient() {
  if (!sqlClient) {
    const dbUrl = process.env.DATABASE_URL
    if (!dbUrl) {
      throw new Error("DATABASE_URL is not set")
    }
    sqlClient = neon(dbUrl)
  }
  return sqlClient
}

export async function query(text: string, params: any[] = []) {
  const sql = getSqlClient()
  // Neon v1.x: use sql.query() for conventional parameterized queries
  if ((sql as any).query) {
    const result = await (sql as any).query(text, params)
    return result.rows || result
  } else {
    // Fallback for older versions
    const result = await sql([text] as any, params as any)
    return result
  }
}

export async function getScamReports(limit = 20, offset = 0) {
  try {
    const result = await query(
      `SELECT id, user_id, anonymous_name, scammer_name, platforms, amount_lost,
              description, status, upvotes, downvotes, flagged_count, created_at,
              platform_handles, external_report_url
       FROM scam_reports
       WHERE is_public = true AND is_hidden = false
       ORDER BY created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset],
    )
    return Array.isArray(result) ? result : []
  } catch (error) {
    console.error("[v0] Error fetching reports:", error)
    return []
  }
}

export async function getScamReportById(id: string) {
  try {
    const result = await query(`SELECT * FROM scam_reports WHERE id = $1`, [id])
    const rows = Array.isArray(result) ? result : []
    return rows[0] || null
  } catch (error) {
    console.error("[v0] Error fetching report:", error)
    return null
  }
}

export async function createScamReport(data: any) {
  const {
    userId,
    anonymousName,
    scammerName,
    scammerAge,
    platforms,
    durationMonths,
    amountLost,
    description,
    photosUrls,
    chatLogs,
    warningSigns,
    platformHandles,
    externalReportUrl,
  } = data

  try {
    const result = await query(
      `INSERT INTO scam_reports (
        user_id, anonymous_name, scammer_name, scammer_age, platforms,
        duration_months, amount_lost, description, photos_urls, chat_logs, warning_signs,
        platform_handles, external_report_url
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING id, created_at`,
      [
        userId,
        anonymousName,
        scammerName,
        scammerAge,
        platforms && platforms.length > 0 ? platforms : null,
        durationMonths,
        amountLost,
        description,
        photosUrls && photosUrls.length > 0 ? photosUrls : null,
        chatLogs,
        warningSigns,
        platformHandles && platformHandles.length > 0 ? platformHandles : null,
        externalReportUrl || null,
      ],
    )

    const rows = Array.isArray(result) ? result : []
    return rows[0] || null
  } catch (error) {
    console.error("[v0] Error creating report:", error)
    return null
  }
}

export async function updateVote(reportId: string, userId: string | null, sessionId: string, voteType: "up" | "down") {
  try {
    const existingVote = await query(
      `SELECT * FROM votes WHERE report_id = $1 AND (user_id = $2 OR session_id = $3) LIMIT 1`,
      [reportId, userId || null, sessionId],
    )

    const votes = Array.isArray(existingVote) ? existingVote : []

    if (votes.length > 0) {
      // Update existing vote
      await query(`UPDATE votes SET vote_type = $1 WHERE id = $2`, [voteType, votes[0].id])
    } else {
      // Insert new vote
      await query(
        `INSERT INTO votes (report_id, user_id, session_id, vote_type)
         VALUES ($1, $2, $3, $4)`,
        [reportId, userId || null, sessionId, voteType],
      )
    }

    // Update vote counts
    await query(
      `UPDATE scam_reports
       SET upvotes = (SELECT COUNT(*) FROM votes WHERE report_id = $1 AND vote_type = 'up'),
           downvotes = (SELECT COUNT(*) FROM votes WHERE report_id = $1 AND vote_type = 'down')
       WHERE id = $1`,
      [reportId],
    )

    return { vote_type: voteType }
  } catch (error) {
    console.error("[v0] Error updating vote:", error)
    return null
  }
}

export async function flagReport(
  reportId: string,
  userId: string | null,
  fingerprintHash: string,
  reason: string,
): Promise<{ inserted: boolean }> {
  try {
    // Try to insert the flag - returns inserted row or empty array if conflict
    const result = await query(
      `INSERT INTO flags (report_id, user_id, fingerprint_hash, reason)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (report_id, fingerprint_hash) DO NOTHING
       RETURNING id`,
      [reportId, userId || null, fingerprintHash, reason],
    )

    const rows = Array.isArray(result) ? result : []
    const wasInserted = rows.length > 0

    if (wasInserted) {
      // Update flag count only if flag was actually inserted
      await query(
        `UPDATE scam_reports
         SET flagged_count = (SELECT COUNT(*) FROM flags WHERE report_id = $1)
         WHERE id = $1`,
        [reportId],
      )

      // Check if report should be auto-hidden (15+ flags, 24h+ old)
      await query(`SELECT check_and_hide_flagged_reports()`)
    }

    return { inserted: wasInserted }
  } catch (error) {
    console.error("[v0] Error flagging report:", error)
    throw error
  }
}

export async function searchReports(searchTerm: string, limit = 20, offset = 0) {
  try {
    const result = await query(
      `SELECT id, user_id, anonymous_name, scammer_name, platforms, amount_lost,
              description, status, upvotes, downvotes, flagged_count, created_at,
              platform_handles, external_report_url
       FROM scam_reports
       WHERE is_public = true AND is_hidden = false AND (
         scammer_name ILIKE $1 OR
         description ILIKE $1 OR
         EXISTS (
           SELECT 1 FROM unnest(platforms) AS platform
           WHERE platform ILIKE $1
         )
       )
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [`%${searchTerm}%`, limit, offset],
    )
    return Array.isArray(result) ? result : []
  } catch (error) {
    console.error("[v0] Error searching reports:", error)
    return []
  }
}
