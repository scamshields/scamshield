import { createScamReport, getScamReports } from "@/lib/db"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "20")
    const offset = Number.parseInt(searchParams.get("offset") || "0")

    const reports = await getScamReports(limit, offset)
    return Response.json(Array.isArray(reports) ? reports : [])
  } catch (error: any) {
    console.error("Failed to fetch reports:", error.message)
    return Response.json([])
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const result = await createScamReport({
      userId: null,
      anonymousName: body.isAnonymous ? `Anonymous User ${Math.random().toString(36).slice(7)}` : null,
      scammerName: body.scammerName || null,
      scammerAge: body.scammerAge || null,
      platforms: body.platforms || [],
      durationMonths: body.durationMonths || null,
      amountLost: body.amountLost || null,
      description: body.description,
      photosUrls: body.photosUrls || [],
      chatLogs: body.chatLogs || null,
      warningSigns: body.warningSigns || null,
      platformHandles: body.platformHandles || [],
      externalReportUrl: body.externalReportUrl || null,
    })

    return Response.json(result, { status: 201 })
  } catch (error) {
    console.error("Failed to create report:", error)
    return Response.json({ error: "Failed to create report" }, { status: 500 })
  }
}
