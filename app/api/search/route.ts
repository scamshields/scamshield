import { searchReports } from "@/lib/db"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const q = searchParams.get("q") || ""
    const limit = Number.parseInt(searchParams.get("limit") || "50")
    const offset = Number.parseInt(searchParams.get("offset") || "0")

    if (!q) {
      return Response.json([])
    }

    const reports = await searchReports(q, limit, offset)
    return Response.json(reports)
  } catch (error) {
    console.error("Search failed:", error)
    return Response.json({ error: "Search failed" }, { status: 500 })
  }
}
