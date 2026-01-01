"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { TagInput } from "@/components/ui/tag-input"
import { Header } from "@/components/header"
import { useToast } from "@/hooks/use-toast"

const PLATFORM_SUGGESTIONS = [
  "Tinder",
  "Bumble",
  "TrulyMadly",
  "QuackQuack",
  "Aisle",
  "Happn",
  "Hinge",
  "OkCupid",
  "Shaadi.com",
  "BharatMatrimony",
  "Jeevansathi",
  "Facebook Dating",
  "Instagram",
  "WhatsApp",
  "Telegram",
  "Snapchat",
  "Other",
]

export default function ReportPage() {
  const [isAnonymous, setIsAnonymous] = useState(true)
  const [platforms, setPlatforms] = useState<string[]>([])
  const [platformHandles, setPlatformHandles] = useState<string[]>([])
  const [confirmationChecked, setConfirmationChecked] = useState(false)
  const [formData, setFormData] = useState({
    scammerName: "",
    scammerAge: "",
    durationMonths: "",
    amountLost: "",
    description: "",
    warningSigns: "",
    chatLogs: "",
    externalReportUrl: "",
  })
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          isAnonymous,
          platforms,
          platformHandles,
          durationMonths: formData.durationMonths ? Number.parseInt(formData.durationMonths) : null,
          amountLost: formData.amountLost ? Number.parseFloat(formData.amountLost) : null,
          chatLogs: formData.chatLogs ? formData.chatLogs.slice(0, 5000) : null,
        }),
      })

      if (res.ok) {
        toast({
          title: "Report submitted",
          description: "Thank you for helping protect the community.",
        })
        setFormData({
          scammerName: "",
          scammerAge: "",
          durationMonths: "",
          amountLost: "",
          description: "",
          warningSigns: "",
          chatLogs: "",
          externalReportUrl: "",
        })
        setPlatforms([])
        setPlatformHandles([])
        setConfirmationChecked(false)
      } else {
        toast({
          title: "Error",
          description: "Failed to submit report",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-background">
      <Header />

      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Report a Dating Scam</h1>
          <p className="text-muted-foreground">Share your experience to help others recognize potential scams</p>
        </div>

        <Card className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Anonymous Toggle */}
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="w-4 h-4"
                />
                <span>Post anonymously</span>
              </label>
            </div>

            {/* Scammer Information */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Scammer Information</h2>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Profile Name / Alias Used on Platform (optional)
                </label>
                <Input
                  type="text"
                  placeholder="e.g., TravelLover2024 or Raj_Mumbai"
                  value={formData.scammerName}
                  onChange={(e) => setFormData({ ...formData, scammerName: e.target.value })}
                />
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                  ⚠️ Do not enter real full names. Use only the name/username as shown on the app or platform.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Platforms/Apps Used <span className="text-muted-foreground text-xs">(Press Enter or comma to add)</span>
                </label>
                <TagInput
                  value={platforms}
                  onChange={setPlatforms}
                  placeholder="e.g., Tinder, TrulyMadly, Instagram..."
                  suggestions={PLATFORM_SUGGESTIONS}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Add all platforms where you encountered this scammer
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Age Claimed by the Person (optional)</label>
                  <Input
                    type="text"
                    placeholder="e.g., 35"
                    value={formData.scammerAge}
                    onChange={(e) => setFormData({ ...formData, scammerAge: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">How long did you interact (months)?</label>
                  <Input
                    type="number"
                    placeholder="e.g., 3"
                    value={formData.durationMonths}
                    onChange={(e) => setFormData({ ...formData, durationMonths: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Approximate Amount Lost in ₹ (optional)</label>
                <Input
                  type="number"
                  placeholder="e.g., 50000 or 1,00,000"
                  value={formData.amountLost}
                  onChange={(e) => setFormData({ ...formData, amountLost: e.target.value })}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Amount in Indian Rupees (₹). This is self-reported and unverified.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Platform Handles (No Links, optional){" "}
                  <span className="text-muted-foreground text-xs">(Press Enter or comma to add)</span>
                </label>
                <TagInput
                  value={platformHandles}
                  onChange={(handles) => {
                    // Strip URLs and @ symbols
                    const cleaned = handles.map((h) =>
                      h.replace(/^(https?:\/\/)?(www\.)?/gi, "").replace(/^@/, "").split("/")[0]
                    )
                    setPlatformHandles(cleaned)
                  }}
                  placeholder="e.g., username123 (Instagram handle only)"
                  suggestions={[]}
                />
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                  ⚠️ Usernames only - no URLs, no @ symbols. We will auto-strip links if pasted.
                </p>
              </div>
            </div>

            {/* Detailed Evidence */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Detailed Evidence</h2>

              <div>
                <label className="block text-sm font-medium mb-2">Description of Scam (required)</label>
                <Textarea
                  placeholder="Describe how the scam occurred, what they asked for, etc."
                  className="min-h-32"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Warning Signs & Red Flags (optional)</label>
                <Textarea
                  placeholder="e.g., Refused video call, asked for UPI/Paytm payment, claimed emergency, asked for gift cards"
                  className="min-h-24"
                  value={formData.warningSigns}
                  onChange={(e) => setFormData({ ...formData, warningSigns: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Chat Logs or Messages (optional)</label>
                <Textarea
                  placeholder="Paste relevant conversation excerpts"
                  className="min-h-24"
                  maxLength={5000}
                  value={formData.chatLogs}
                  onChange={(e) => setFormData({ ...formData, chatLogs: e.target.value })}
                />
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                  ⚠️ Do not include phone numbers, emails, payment details, or private images. Max 5000 characters.
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {formData.chatLogs.length}/5000 characters
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Previous Public Report Link (optional)
                </label>
                <Input
                  type="url"
                  placeholder="https://reddit.com/r/scams/... or other platform"
                  value={formData.externalReportUrl}
                  onChange={(e) => setFormData({ ...formData, externalReportUrl: e.target.value })}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  If you or someone else has already posted about this scam on Reddit, Twitter, or another platform.
                  Links are shown for reference only and are not verified by ScamShield.
                </p>
              </div>
            </div>

            {/* Mandatory Confirmation */}
            <div className="border border-amber-500/30 bg-amber-500/5 rounded-lg p-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={confirmationChecked}
                  onChange={(e) => setConfirmationChecked(e.target.checked)}
                  className="w-5 h-5 mt-0.5 shrink-0"
                  required
                />
                <span className="text-sm">
                  I confirm this report is based on my personal experience and does not include private personal
                  information, real names, or contact details of any individual.
                </span>
              </label>
            </div>

            {/* Disclaimer */}
            <div className="bg-muted/50 border border-border rounded-lg p-4">
              <p className="text-sm font-semibold mb-1">Disclaimer:</p>
              <p className="text-xs text-muted-foreground">
                Reports are user-submitted allegations and have not been independently verified. ScamShield does not
                confirm or assert wrongdoing.
              </p>
            </div>

            <Button
              type="submit"
              disabled={loading || !formData.description || platforms.length === 0 || !confirmationChecked}
              className="w-full bg-primary hover:bg-primary/90"
              size="lg"
            >
              {loading ? "Submitting..." : "Submit Report"}
            </Button>
          </form>
        </Card>
      </div>
    </main>
  )
}
