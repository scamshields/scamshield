"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ThumbsUp, ThumbsDown, Flag } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function ReportActions({ report }: { report: any }) {
  const [upvotes, setUpvotes] = useState(report.upvotes || 0)
  const [downvotes, setDownvotes] = useState(report.downvotes || 0)
  const [userVote, setUserVote] = useState<"up" | "down" | null>(null)
  const [sessionId] = useState(() => Math.random().toString(36).slice(2))
  const { toast } = useToast()

  async function handleVote(type: "up" | "down") {
    try {
      const res = await fetch(`/api/reports/${report.id}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ voteType: type, sessionId }),
      })

      if (res.ok) {
        if (type === "up") {
          if (userVote === "up") {
            setUpvotes(upvotes - 1)
          } else {
            setUpvotes(upvotes + 1)
            if (userVote === "down") {
              setDownvotes(downvotes - 1)
            }
          }
        } else {
          if (userVote === "down") {
            setDownvotes(downvotes - 1)
          } else {
            setDownvotes(downvotes + 1)
            if (userVote === "up") {
              setUpvotes(upvotes - 1)
            }
          }
        }
        setUserVote(userVote === type ? null : type)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit vote",
        variant: "destructive",
      })
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
        toast({
          title: "Report flagged",
          description:
            "Thank you for helping keep the community safe. Reports with 15+ flags after 24 hours are automatically hidden.",
        })
      } else if (res.status === 409) {
        toast({
          title: "Already flagged",
          description: "You have already flagged this report",
          variant: "destructive",
        })
      } else if (res.status === 429) {
        const data = await res.json()
        toast({
          title: "Rate limit exceeded",
          description: data.error || "Too many flag attempts. Please try again later.",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Error",
          description: "Failed to flag report",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to flag report",
        variant: "destructive",
      })
    }
  }

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">Community Feedback</h2>

      <div className="mb-4 p-3 bg-muted/50 rounded-lg border border-border">
        <p className="text-xs font-medium mb-1">Content Visibility Notice</p>
        <p className="text-xs text-muted-foreground">
          Report visibility is determined automatically based on anonymous community feedback. ScamShield does not review or verify reports.
        </p>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Button
            size="lg"
            variant={userVote === "up" ? "default" : "outline"}
            onClick={() => handleVote("up")}
            className="gap-2"
          >
            <ThumbsUp className="w-5 h-5" />
            <span>{upvotes}</span>
          </Button>

          <Button
            size="lg"
            variant={userVote === "down" ? "destructive" : "outline"}
            onClick={() => handleVote("down")}
            className="gap-2"
          >
            <ThumbsDown className="w-5 h-5" />
            <span>{downvotes}</span>
          </Button>
        </div>

        <div className="ml-auto">
          <Button size="lg" variant="outline" onClick={handleFlag} className="gap-2">
            <Flag className="w-5 h-5" />
            Flag for Review
          </Button>
        </div>
      </div>

      <p className="text-xs text-muted-foreground mt-4">
        Upvote if this report seems credible and helpful. Downvote if it seems suspicious or misleading.
        Flag if it violates community guidelines.
      </p>
    </Card>
  )
}
