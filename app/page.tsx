"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Header } from "@/components/header"
import { ReportCard } from "@/components/report-card"

export default function Home() {
  const [reports, setReports] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [sessionId] = useState(() => Math.random().toString(36).slice(2))

  useEffect(() => {
    fetchReports()
  }, [])

  async function fetchReports() {
    try {
      const res = await fetch("/api/reports?limit=20&offset=0")
      const data = await res.json()
      setReports(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Failed to fetch reports:", error)
      setReports([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-background">
      <Header />

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold mb-4">ScamShield</h1>
          <p className="text-lg text-muted-foreground mb-6">
            Community-driven dating scam evidence database. Share reports, protect others.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/report">
              <Button size="lg" className="bg-primary hover:bg-primary/90">
                Report a Scam
              </Button>
            </Link>
            <Link href="/browse">
              <Button size="lg" variant="outline">
                Browse Reports
              </Button>
            </Link>
          </div>
        </div>

        {/* Recent Reports */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6">Recent Reports</h2>

          {loading ? (
            <div className="text-center py-12 text-muted-foreground">Loading reports...</div>
          ) : reports.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No reports yet. Be the first to share evidence.
            </div>
          ) : (
            <div className="space-y-4">
              {reports.map((report: any) => (
                <ReportCard key={report.id} report={report} sessionId={sessionId} />
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
