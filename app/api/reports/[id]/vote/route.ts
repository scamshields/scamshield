import { updateVote } from "@/lib/db"

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { voteType, sessionId } = await request.json()

    if (!voteType || !sessionId) {
      return Response.json({ error: "Missing required fields" }, { status: 400 })
    }

    if (voteType !== "up" && voteType !== "down") {
      return Response.json({ error: "Invalid vote type" }, { status: 400 })
    }

    const result = await updateVote(id, null, sessionId, voteType)

    if (!result) {
      return Response.json({ error: "Failed to update vote" }, { status: 500 })
    }

    return Response.json(result, { status: 200 })
  } catch (error) {
    console.error("Vote failed:", error)
    return Response.json({ error: "Vote failed" }, { status: 500 })
  }
}
