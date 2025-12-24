// frontend/src/modules/products/components/oscilloscope-line/index.tsx
"use client"
import React, { useRef, useEffect, useState, useCallback } from "react"
import { useAudioPlayer } from "@lib/context/audio-player"

type OscilloscopeLineProps = {
  images?: { url: string }[]
  productHandle?: string
}

const OscilloscopeLine: React.FC<OscilloscopeLineProps> = ({
  images,
  productHandle,
}) => {
  const { state } = useAudioPlayer()
  const currentTrack = state.currentTrack
  const isPlaying = state.isPlaying && currentTrack?.productSlug === productHandle
  
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number | null>(null)
  const dataArrayRef = useRef<Uint8Array | null>(null)
  const smoothedDataRef = useRef<number[]>(new Array(32).fill(128))
  const smoothedGainRef = useRef<number>(2.0)
  const smoothedCenterRef = useRef<number>(128)
  const canvasSetupRef = useRef(false)
  
  const [lineColor, setLineColor] = useState({ r: 255, g: 255, b: 255 })
  const [visible, setVisible] = useState(false)
  const [opacity, setOpacity] = useState(0)
  const fadeOutTimerRef = useRef<NodeJS.Timeout | null>(null)

  const getAnalyser = () => typeof window !== "undefined" ? (window as any).globalAudioState?.analyser : null


  useEffect(() => {
    if (!images || images.length === 0 || !images[0].url) return
    const proxyUrl = `/api/image-proxy?url=${encodeURIComponent(images[0].url)}`
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")
      if (!ctx) return
      canvas.width = 100
      canvas.height = 100
      ctx.drawImage(img, 0, 0, 100, 100)
      try {
        const imageData = ctx.getImageData(0, 0, 100, 100)
        const data = imageData.data
        const colorCounts: Map<string, { r: number; g: number; b: number; count: number }> = new Map()
        for (let i = 0; i < data.length; i += 4) {
          const r = Math.round(data[i] / 16) * 16
          const g = Math.round(data[i + 1] / 16) * 16
          const b = Math.round(data[i + 2] / 16) * 16
          const key = `${r},${g},${b}`
          const existing = colorCounts.get(key)
          if (existing) existing.count++
          else colorCounts.set(key, { r, g, b, count: 1 })
        }
        let dominant = { r: 128, g: 128, b: 128, count: 0, score: 0 }
        colorCounts.forEach((color) => {
          const { r, g, b, count } = color
          const brightness = (r + g + b) / 3
          const max = Math.max(r, g, b)
          const min = Math.min(r, g, b)
          const saturation = max === 0 ? 0 : (max - min) / max
          const isNearWhite = brightness > 200 || (brightness > 180 && saturation < 0.15)
          const isNearBlack = brightness < 40
          const isGray = saturation < 0.1
          if (isNearWhite || isNearBlack || isGray) return
          const satBoost = Math.pow(saturation, 0.5) * 10
          const score = count * satBoost
          if (score > dominant.score) dominant = { r, g, b, count, score }
        })
        if (dominant.score > 0) {
          let { r, g, b } = dominant
          const brightness = (r + g + b) / 3
          const targetBrightness = 180
          if (brightness > 0) {
            const factor = targetBrightness / brightness
            r = Math.min(255, Math.round(r * factor))
            g = Math.min(255, Math.round(g * factor))
            b = Math.min(255, Math.round(b * factor))
          }
          setLineColor({ r, g, b })
        } else {
          setLineColor({ r: 255, g: 255, b: 255 })
        }
      } catch {
        setLineColor({ r: 255, g: 255, b: 255 })
      }
    }
    img.onerror = () => setLineColor({ r: 255, g: 255, b: 255 })
    img.src = proxyUrl
  }, [images])

  useEffect(() => {
    if (isPlaying) {
      if (fadeOutTimerRef.current) {
        clearTimeout(fadeOutTimerRef.current)
        fadeOutTimerRef.current = null
      }
      setVisible(true)
      setOpacity(1)
    } else if (visible) {
      fadeOutTimerRef.current = setTimeout(() => {
        setOpacity(0)
        setTimeout(() => setVisible(false), 2500)
      }, 5000)
    }
    return () => {
      if (fadeOutTimerRef.current) clearTimeout(fadeOutTimerRef.current)
    }
  }, [isPlaying, visible])

  useEffect(() => {
    if (!visible) {
      canvasSetupRef.current = false
      return
    }
    
    const canvas = canvasRef.current
    if (!canvas) return

    const setupCanvas = () => {
      const rect = canvas.getBoundingClientRect()
      if (rect.width === 0) return
      const dpr = window.devicePixelRatio || 1
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      const ctx = canvas.getContext("2d")
      if (ctx) {
        ctx.setTransform(1, 0, 0, 1, 0, 0)
        ctx.scale(dpr, dpr)
      }
      canvasSetupRef.current = true
    }

    const timer = setTimeout(setupCanvas, 50)
    window.addEventListener("resize", setupCanvas)
    return () => {
      clearTimeout(timer)
      window.removeEventListener("resize", setupCanvas)
    }
  }, [visible])

  useEffect(() => {
    if (!visible) return

    const draw = () => {
      const canvas = canvasRef.current
      const ctx = canvas?.getContext("2d")
      if (!canvas || !ctx || !canvasSetupRef.current) {
        animationRef.current = requestAnimationFrame(draw)
        return
      }

      const rect = canvas.getBoundingClientRect()
      const width = rect.width
      const height = rect.height
      const centerY = height / 2

      ctx.fillStyle = "rgba(0, 0, 0, 0.08)"
      ctx.fillRect(0, 0, width, height)

      const analyser = getAnalyser()
      const globalState = (window as any).globalAudioState
      const currentlyPlaying = globalState?.isPlaying && globalState?.currentTrack?.productSlug === productHandle

      if (analyser && currentlyPlaying) {
        if (!dataArrayRef.current || dataArrayRef.current.length !== analyser.fftSize) {
          dataArrayRef.current = new Uint8Array(analyser.fftSize)
        }
        analyser.getByteTimeDomainData(dataArrayRef.current)

        const numPoints = 32
        const step = Math.floor(dataArrayRef.current.length / numPoints)
        for (let i = 0; i < numPoints; i++) {
          const rawVal = dataArrayRef.current[i * step] || 128
          smoothedDataRef.current[i] = smoothedDataRef.current[i] * 0.325 + rawVal * 0.65
        }

        const minVal = Math.min(...Array.from(dataArrayRef.current))
        const maxVal = Math.max(...Array.from(dataArrayRef.current))
        const peakDeviation = Math.max(Math.abs(maxVal - 128), Math.abs(128 - minVal))
        const targetDeviation = 40
        const targetGain = peakDeviation > 5 ? targetDeviation / peakDeviation : 2.0
        smoothedGainRef.current = smoothedGainRef.current * 0.95 + targetGain * 0.05
        const amplification = smoothedGainRef.current

        const smoothedMin = Math.min(...smoothedDataRef.current)
        const smoothedMax = Math.max(...smoothedDataRef.current)
        const dataCenter = (smoothedMin + smoothedMax) / 2
        const points = smoothedDataRef.current.map(val => centerY + ((val - dataCenter) / 128.0) * height * amplification)
        const { r, g, b } = lineColor
        const colorStr = `${r}, ${g}, ${b}`

        const drawCurve = (lineWidth: number, alpha: number) => {
          ctx.beginPath()
          ctx.lineWidth = lineWidth
          ctx.strokeStyle = `rgba(${colorStr}, ${alpha})`
          ctx.lineCap = "round"
          ctx.lineJoin = "round"
          const segW = width / (points.length - 1)
          ctx.moveTo(0, points[0])
          for (let i = 0; i < points.length - 1; i++) {
            const xMid = (i * segW + (i + 1) * segW) / 2
            const yMid = (points[i] + points[i + 1]) / 2
            ctx.quadraticCurveTo(i * segW, points[i], xMid, yMid)
          }
          ctx.lineTo(width, points[points.length - 1])
          ctx.stroke()
        }

        ctx.shadowColor = `rgb(${colorStr})`
        ctx.shadowBlur = 60
        drawCurve(30, 0.02)
        ctx.shadowBlur = 40
        drawCurve(18, 0.04)
        ctx.shadowBlur = 25
        drawCurve(10, 0.08)
        ctx.shadowBlur = 12
        drawCurve(4, 0.25)
        ctx.shadowBlur = 0
      }

      animationRef.current = requestAnimationFrame(draw)
    }

    animationRef.current = requestAnimationFrame(draw)
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
    }
  }, [visible, lineColor, productHandle])

  if (!visible && !isPlaying) return null

  return (
    <div
      className="absolute inset-0 z-[1] pointer-events-none flex items-center overflow-hidden bg-black"
      style={{ opacity, transition: "opacity 2500ms ease-in-out" }}
    >
      <div 
        className="absolute inset-0 z-10 pointer-events-none opacity-100" 
        style={{ 
          backgroundImage: "url('https://storage.googleapis.com/themixtapeshop/2022/12/noise.jpg')", 
          backgroundSize: "150px", 
          mixBlendMode: "multiply" 
        }} 
      />
      <canvas
        ref={canvasRef}
        className="w-full"
        style={{ height: "140px", transform: "scale(1.15)", filter: "blur(20px)" }}
      />
    </div>
  )
}

export default OscilloscopeLine