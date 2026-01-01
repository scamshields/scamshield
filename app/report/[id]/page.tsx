import { notFound } from "next/navigation"
import { getScamReportById } from "@/lib/db"
import { Header } from "@/components/header"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { ReportActions } from "@/components/report-actions"

export default async function ReportDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const report = await getScamReportById(id)

  if (!report) {
    notFound()
  }

  return (
    <main className="min-h-screen bg-background">
      <Header />

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Report a Suspected Dating Scam
          </h1>
          <p className="text-lg text-foreground mt-2">
            {report.scammer_name || report.anonymous_name || "Anonymous Report"}
          </p>
          <p className="text-muted-foreground">
            Reported on {new Date(report.created_at).toLocaleDateString("en-IN", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          {/* Scammer Information */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Reported Profile Information</h2>

            <div className="space-y-4">
              {report.scammer_name && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Profile Name/Alias</p>
                  <p className="text-foreground">{report.scammer_name}</p>
                </div>
              )}

              {report.scammer_age && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Age Claimed</p>
                  <p className="text-foreground">{report.scammer_age}</p>
                </div>
              )}

              {report.platforms && report.platforms.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Platforms Used</p>
                  <div className="flex flex-wrap gap-2">
                    {report.platforms.map((platform: string) => (
                      <Badge key={platform} variant="secondary">
                        {platform}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {report.platform_handles && report.platform_handles.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Platform Handles</p>
                  <div className="flex flex-wrap gap-2">
                    {report.platform_handles.map((handle: string) => (
                      <Badge key={handle} variant="outline" className="text-xs text-muted-foreground" title="User-reported handle. Do not use to contact or harass.">
                        @{handle}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    ⚠️ Handles are user-reported and unverified. Do not contact or harass individuals mentioned in reports.
                  </p>
                </div>
              )}

              {report.duration_months && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Duration of Interaction</p>
                  <p className="text-foreground">{report.duration_months} month{report.duration_months > 1 ? "s" : ""}</p>
                </div>
              )}

              {report.amount_lost && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Approximate Amount Lost</p>
                  <p className="text-foreground text-xl font-semibold text-destructive">
                    ₹{Number.parseFloat(report.amount_lost).toLocaleString("en-IN")}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Amounts are self-reported estimates and may not reflect actual loss. Self-reported and unverified.
                  </p>
                </div>
              )}
            </div>
          </Card>

          {/* Description */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Description of Scam</h2>
            <p className="text-foreground whitespace-pre-wrap leading-relaxed">{report.description}</p>
          </Card>

          {/* Warning Signs */}
          {report.warning_signs && (
            <Card className="p-6 border-amber-500/30 bg-amber-500/5">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <span>⚠️</span>
                Warning Signs & Red Flags
              </h2>
              <p className="text-foreground whitespace-pre-wrap leading-relaxed">{report.warning_signs}</p>
            </Card>
          )}

          {/* Chat Logs */}
          {report.chat_logs && (
            <Card className="p-6 bg-muted/30">
              <h2 className="text-xl font-semibold mb-4">Chat Logs</h2>
              <div className="bg-background rounded-lg p-4 font-mono text-sm">
                <p className="whitespace-pre-wrap">{report.chat_logs}</p>
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                Note: Private information has been redacted or removed
              </p>
            </Card>
          )}

          {/* External Report Link */}
          {report.external_report_url && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Previous Public Report</h2>
              <p className="text-sm text-muted-foreground mb-2">
                This scam has been reported elsewhere:
              </p>
              <a
                href={report.external_report_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline break-all"
              >
                {report.external_report_url}
              </a>
              <p className="text-xs text-muted-foreground mt-2">
                Links are shown for reference only and are not verified by ScamShield
              </p>
            </Card>
          )}

          {/* Disclaimer */}
          <Card className="p-6 bg-muted/50 border border-border">
            <p className="text-sm font-semibold mb-2">Disclaimer</p>
            <p className="text-xs text-muted-foreground">
              This is a user-submitted allegation and has not been independently verified. ScamShield does not
              confirm or assert wrongdoing. Information should be used for awareness purposes only.
            </p>
          </Card>

          {/* No Contact Warning */}
          <Card className="p-6 bg-amber-500/10 border-amber-500/30">
            <p className="text-sm font-semibold mb-2 flex items-center gap-2">
              <span>⚠️</span>
              Do Not Contact or Harass
            </p>
            <p className="text-xs text-muted-foreground">
              Do not contact, harass, or confront individuals mentioned in reports. ScamShield does not encourage direct action. Use this information for awareness and personal protection only.
            </p>
          </Card>

          {/* Actions (Voting and Flagging) */}
          <ReportActions report={report} />
        </div>
      </div>
    </main>
  )
}
