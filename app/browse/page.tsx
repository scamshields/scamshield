import { Suspense } from "react"
import { BrowseContent } from "@/components/browse-content"
import { Header } from "@/components/header"

export default function BrowsePage() {
  return (
    <main className="min-h-screen bg-background">
      <Header />
      <Suspense
        fallback={<div className="max-w-4xl mx-auto px-4 py-12 text-center text-muted-foreground">Loading...</div>}
      >
        <BrowseContent />
      </Suspense>
    </main>
  )
}
