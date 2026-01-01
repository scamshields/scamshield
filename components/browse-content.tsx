"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ReportCard } from "@/components/report-card"
import { Search } from "lucide-react"

export function BrowseContent() {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("recent")
  const [sessionId] = useState(() => Math.random().toString(36).slice(2))

  useEffect(() => {
    fetchReports()
  }, [])

  async function fetchReports() {
    setLoading(true)
    try {
      const url = searchTerm ? `/api/search?q=${encodeURIComponent(searchTerm)}` : "/api/reports?limit=50&offset=0"

      const res = await fetch(url)
      const data = await res.json()
      setReports(data)
    } catch (error) {
      console.error("Failed to fetch reports:", error)
    } finally {
      setLoading(false)
    }
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    fetchReports()
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-6">Browse Reports</h1>

        {/* Search */}
        <form onSubmit={handleSearch} className="mb-6">
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Search by scammer name, platform, or details..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" variant="outline">
              <Search className="w-4 h-4" />
            </Button>
          </div>
        </form>

        {/* Sort */}
        <div className="flex gap-2 mb-6">
          <Button variant={sortBy === "recent" ? "default" : "outline"} onClick={() => setSortBy("recent")}>
            Most Recent
          </Button>
          <Button variant={sortBy === "trending" ? "default" : "outline"} onClick={() => setSortBy("trending")}>
            Most Voted
          </Button>
          <Button variant={sortBy === "flagged" ? "default" : "outline"} onClick={() => setSortBy("flagged")}>
            Most Flagged
          </Button>
        </div>
      </div>

      {/* Reports List */}
      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Loading reports...</div>
      ) : reports.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">No reports found</div>
      ) : (
        <div className="space-y-4">
          {reports.map((report: any) => (
            <ReportCard key={report.id} report={report} sessionId={sessionId} />
          ))}
        </div>
      )}
    </div>
  )
}
