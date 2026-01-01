"use client"

import { useEffect } from "react"

interface GraphCommentProps {
  uid?: string // unique identifier for the comments thread (optional)
}

export function GraphComment({ uid }: GraphCommentProps) {
  useEffect(() => {
    // Configuration
    const params = {
      graphcommentId: "scamshield",
      behaviour: uid ? { uid } : {},
    }

    // Initialize GraphComment
    function onload() {
      if (typeof (window as any).__semio__gc_graphlogin === "function") {
        ;(window as any).__semio__gc_graphlogin(params)
      }
    }

    // Load script
    const script = document.createElement("script")
    script.type = "text/javascript"
    script.async = true
    script.defer = true
    script.src = `https://integration.graphcomment.com/gc_graphlogin.js?${Date.now()}`
    script.onload = onload

    const target = document.getElementsByTagName("head")[0] || document.getElementsByTagName("body")[0]
    target.appendChild(script)

    // Cleanup
    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script)
      }
    }
  }, [uid])

  return <div id="graphcomment" />
}
