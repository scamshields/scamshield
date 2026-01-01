/**
 * Client-side browser fingerprinting
 * Collects hard-to-fake browser characteristics for abuse prevention
 * This code runs in the browser and sends data to the server
 */

export interface BrowserFingerprint {
  canvas: string
  webgl: string
  fonts: string
  audio: string
  screen: string
  navigator: string
  timezone: number
  language: string
  platform: string
  hardwareConcurrency: number
  deviceMemory: number
  colorDepth: number
}

/**
 * Generate a canvas fingerprint (hard to spoof)
 */
function getCanvasFingerprint(): string {
  try {
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    if (!ctx) return "no-canvas"

    canvas.width = 200
    canvas.height = 50

    // Draw text with various styles
    ctx.textBaseline = "top"
    ctx.font = "14px 'Arial'"
    ctx.textBaseline = "alphabetic"
    ctx.fillStyle = "#f60"
    ctx.fillRect(125, 1, 62, 20)
    ctx.fillStyle = "#069"
    ctx.fillText("ScamShield 🛡️", 2, 15)
    ctx.fillStyle = "rgba(102, 204, 0, 0.7)"
    ctx.fillText("ScamShield 🛡️", 4, 17)

    return canvas.toDataURL().substring(0, 100)
  } catch {
    return "canvas-error"
  }
}

/**
 * Get WebGL fingerprint (renderer and vendor info)
 */
function getWebGLFingerprint(): string {
  try {
    const canvas = document.createElement("canvas")
    const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl")
    if (!gl) return "no-webgl"

    const debugInfo = (gl as any).getExtension("WEBGL_debug_renderer_info")
    if (debugInfo) {
      const vendor = (gl as any).getParameter(debugInfo.UNMASKED_VENDOR_WEBGL)
      const renderer = (gl as any).getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
      return `${vendor}|${renderer}`.substring(0, 100)
    }
    return "webgl-no-debug"
  } catch {
    return "webgl-error"
  }
}

/**
 * Get available fonts fingerprint
 */
function getFontsFingerprint(): string {
  try {
    const baseFonts = ["monospace", "sans-serif", "serif"]
    const testFonts = [
      "Arial",
      "Courier New",
      "Georgia",
      "Times New Roman",
      "Verdana",
      "Comic Sans MS",
      "Impact",
      "Trebuchet MS",
    ]

    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    if (!ctx) return "no-canvas"

    const detected: string[] = []
    for (const font of testFonts) {
      let detected_font = false
      for (const baseFont of baseFonts) {
        ctx.font = `72px ${baseFont}`
        const baseWidth = ctx.measureText("mmmmmmmmmmlli").width

        ctx.font = `72px ${font}, ${baseFont}`
        const testWidth = ctx.measureText("mmmmmmmmmmlli").width

        if (baseWidth !== testWidth) {
          detected_font = true
          break
        }
      }
      if (detected_font) detected.push(font)
    }

    return detected.join(",")
  } catch {
    return "fonts-error"
  }
}

/**
 * Get audio context fingerprint
 */
function getAudioFingerprint(): string {
  try {
    const AudioContext = (window as any).AudioContext || (window as any).webkitAudioContext
    if (!AudioContext) return "no-audio"

    const context = new AudioContext()
    const oscillator = context.createOscillator()
    const analyser = context.createAnalyser()
    const gainNode = context.createGain()
    const scriptProcessor = context.createScriptProcessor(4096, 1, 1)

    gainNode.gain.value = 0 // Mute
    oscillator.connect(analyser)
    analyser.connect(scriptProcessor)
    scriptProcessor.connect(gainNode)
    gainNode.connect(context.destination)
    oscillator.start(0)

    const data = new Float32Array(analyser.frequencyBinCount)
    analyser.getFloatFrequencyData(data)

    oscillator.stop()
    context.close()

    return data.slice(0, 10).join(",")
  } catch {
    return "audio-error"
  }
}

/**
 * Collect all browser fingerprint data
 */
export async function collectBrowserFingerprint(): Promise<BrowserFingerprint> {
  return {
    canvas: getCanvasFingerprint(),
    webgl: getWebGLFingerprint(),
    fonts: getFontsFingerprint(),
    audio: getAudioFingerprint(),
    screen: `${window.screen.width}x${window.screen.height}x${window.screen.colorDepth}`,
    navigator: window.navigator.userAgent,
    timezone: new Date().getTimezoneOffset(),
    language: navigator.language,
    platform: navigator.platform,
    hardwareConcurrency: navigator.hardwareConcurrency || 0,
    deviceMemory: (navigator as any).deviceMemory || 0,
    colorDepth: window.screen.colorDepth,
  }
}
