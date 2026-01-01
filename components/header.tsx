"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Shield } from "lucide-react"

export function Header() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <header className="border-b border-border bg-card">
      <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Shield className="w-6 h-6 text-primary" />
          <span className="font-bold text-lg">ScamShield</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link href="/browse" className="text-muted-foreground hover:text-foreground transition">
            Browse
          </Link>
          <Link href="/report" className="text-muted-foreground hover:text-foreground transition">
            Report
          </Link>
          <Link href="/about" className="text-muted-foreground hover:text-foreground transition">
            About
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <Link href="/report">
            <Button size="sm" className="bg-primary hover:bg-primary/90">
              Report Scam
            </Button>
          </Link>
        </div>
      </div>
    </header>
  )
}
