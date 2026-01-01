"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ThumbsUp, ThumbsDown, Flag } from "lucide-react"
import Link from "next/link"

export function ReportCard({ report, sessionId }: { report: any; sessionId: string }) {
  const [upvotes, setUpvotes] = useState(report.upvotes || 0)
  const [downvotes, setDownvotes] = useState(report.downvotes || 0)
  const [userVote, setUserVote] = useState<"up" | "down" | null>(null)

  async function handleVote(type: "up" | "down") {
    try {
      const res = await fetch(`/api/reports/${report.id}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ voteType: type, sessionId }),
      })

      if (res.ok) {
        if (type === "up") {
          setUpvotes(userVote === "up" ? upvotes - 1 : upvotes + 1)
        } else {
          setDownvotes(userVote === "down" ? downvotes - 1 : downvotes + 1)
        }
        setUserVote(userVote === type ? null : type)
      }
    } catch (error) {
      console.error("Vote failed:", error)
    }
  }

  async function handleFlag() {
    const reason = prompt("Why are you flagging this report?")
    if (!reason) return

    try {
      // Import the fingerprint collector dynamically
      const { collectBrowserFingerprint } = await import("@/lib/browser-fingerprint")
      const fingerprint = await collectBrowserFingerprint()

      const res = await fetch(`/api/reports/${report.id}/flag`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reason,
          fingerprint,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        alert(data.message || "Report flagged for review. Thank you for helping keep the community safe!")
      } else if (res.status === 409) {
        alert("You have already flagged this report")
      } else if (res.status === 429) {
        const data = await res.json()
        alert(data.error || "Rate limit exceeded. Too many flag attempts. Please try again later.")
      } else {
        alert("Failed to flag report. Please try again.")
      }
    } catch (error) {
      console.error("Flag failed:", error)
      alert("Failed to flag report. Please try again.")
    }
  }

  return (
    <Card className="p-6 hover:shadow-lg transition">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-semibold text-lg">
            {report.scammer_name || report.anonymous_name || "Anonymous Report"}
          </h3>
          <p className="text-sm text-muted-foreground">
            {report.platform_met} •{" "}
            {report.created_at ? new Date(report.created_at).toLocaleDateString("en-IN") : "Unknown date"}
          </p>
        </div>
        {report.amount_lost && (
          <Badge variant="destructive">₹{Number.parseFloat(report.amount_lost).toLocaleString("en-IN")}</Badge>
        )}
      </div>

      <p className="text-foreground mb-4 line-clamp-3">{report.description}</p>

      <div className="flex items-center gap-3">
        <Button
          size="sm"
          variant={userVote === "up" ? "default" : "ghost"}
          onClick={() => handleVote("up")}
          className="gap-1"
        >
          <ThumbsUp className="w-4 h-4" />
          <span className="text-xs">{upvotes}</span>
        </Button>

        <Button
          size="sm"
          variant={userVote === "down" ? "destructive" : "ghost"}
          onClick={() => handleVote("down")}
          className="gap-1"
        >
          <ThumbsDown className="w-4 h-4" />
          <span className="text-xs">{downvotes}</span>
        </Button>

        <Button size="sm" variant="ghost" onClick={handleFlag} className="gap-1" title="Flag for Review">
          <Flag className="w-4 h-4" />
          <span className="text-xs">{report.flagged_count || 0}</span>
        </Button>

        <Link href={`/report/${report.id}`} className="ml-auto">
          <Button size="sm" variant="outline">
            View Details
          </Button>
        </Link>
      </div>
    </Card>
  )
}
