// frontend/src/modules/layout/components/header/now-playing-bar.tsx
"use client"

import { useEffect, useRef, useState, useMemo, useCallback } from "react"
import { useRouter, usePathname } from "next/navigation"
import { getGlobalAudioState } from "@lib/context/audio-player"

interface NowPlayingBarProps {
  variant?: "header" | "overlay"
  onClose?: () => void
  currentTrack?: {
    title?: string
    artist?: string
    album?: string
    productImage?: string
    productSlug?: string
    productUrl?: string
    audioUrl?: string
    url?: string
  } | null
  isPlaying?: boolean
}

const BAR_HEIGHT = 36
const BAR_WIDTH = 3
const BAR_GAP = 2
const CONTROLS_WIDTH = 70
const IMAGE_SIZE = 24
const TITLE_WIDTH = 180
const DEFAULT_PROGRESS_COLOR = { r: 255, g: 215, b: 0 }

function generateWaveformHeights(seed: string, count: number): number[] {
  const heights: number[] = []
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash) + seed.charCodeAt(i)
    hash = hash & hash
  }
  for (let i = 0; i < count; i++) {
    hash = ((hash << 5) - hash) + i
    hash = hash & hash
    const normalized = (Math.abs(hash) % 1000) / 1000
    const height = 0.3 + (normalized * 0.7)
    heights.push(height)
  }
  return heights
}

const pauseMixcloudPlayer = () => {
  try {
    const autoHide = (window as any).__autoHidePersistentPlayer
    if (autoHide) autoHide()
  } catch {}
}

export default function NowPlayingBar({ 
  variant,
  onClose,
  currentTrack,
  isPlaying,
}: NowPlayingBarProps) {
  const isHeader = variant === "header"
  const showImage = !!currentTrack?.productImage
  const router = useRouter()
  const pathname = usePathname()
  
  const [mounted, setMounted] = useState(false)
  const [visibleBars, setVisibleBars] = useState(50)
  const [currentProgress, setCurrentProgress] = useState(0)
  const [hasPlaylistControls, setHasPlaylistControls] = useState(false)
  const [progressColor, setProgressColor] = useState(DEFAULT_PROGRESS_COLOR)
  const waveformRef = useRef<HTMLDivElement>(null)
  const barsInitialized = useRef(false)

  const extractDominantColor = useCallback((imageUrl: string) => {
  const proxyUrl = "/api/image-proxy?url=" + encodeURIComponent(imageUrl)
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas")
        const ctx = canvas.getContext("2d")
        if (!ctx) {
          setProgressColor(DEFAULT_PROGRESS_COLOR)
          return
        }
        const size = 32
        canvas.width = size
        canvas.height = size
        ctx.drawImage(img, 0, 0, size, size)
        const imageData = ctx.getImageData(0, 0, size, size)
        const data = imageData.data
        const colorCounts = new Map<string, { r: number; g: number; b: number; count: number; score?: number }>()
        
        for (let i = 0; i < data.length; i += 4) {
          const r = Math.round(data[i] / 16) * 16
          const g = Math.round(data[i + 1] / 16) * 16
          const b = Math.round(data[i + 2] / 16) * 16
          
          const key = r + "," + g + "," + b
          const existing = colorCounts.get(key)
          if (existing) {
            existing.count++
          } else {
            colorCounts.set(key, { r, g, b, count: 1 })
          }
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
          
          if (isNearWhite || isNearBlack || isGray) {
            return
          }
          
          const satBoost = Math.pow(saturation, 0.5) * 10
          const score = count * satBoost
          
          if (score > dominant.score) {
            dominant = { r, g, b, count, score }
          }
        })
        
        if (dominant.score > 0) {
          let { r, g, b } = dominant
          const brightness = (r + g + b) / 3
          const targetBrightness = 140
          if (brightness > 0) {
            const factor = targetBrightness / brightness
            r = Math.min(255, Math.round(r * factor))
            g = Math.min(255, Math.round(g * factor))
            b = Math.min(255, Math.round(b * factor))
          }
          setProgressColor({ r, g, b })
        } else {
          setProgressColor(DEFAULT_PROGRESS_COLOR)
        }
      } catch {
        setProgressColor(DEFAULT_PROGRESS_COLOR)
      }
    }
    img.onerror = () => setProgressColor(DEFAULT_PROGRESS_COLOR)
    img.src = proxyUrl
  }, [])

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (currentTrack?.productImage) {
      extractDominantColor(currentTrack.productImage)
    } else {
      setProgressColor(DEFAULT_PROGRESS_COLOR)
    }
  }, [currentTrack?.productImage, extractDominantColor])

  const updateVisibleBars = useCallback(() => {
    if (waveformRef.current) {
      const containerWidth = waveformRef.current.clientWidth
      const barTotalWidth = BAR_WIDTH + BAR_GAP
      const count = Math.max(1, Math.floor(containerWidth / barTotalWidth))
      if (!barsInitialized.current || Math.abs(count - visibleBars) > 5) {
        setVisibleBars(count)
        barsInitialized.current = true
      }
    }
  }, [visibleBars])

  useEffect(() => {
    if (!mounted || !waveformRef.current) return

    const timer = setTimeout(updateVisibleBars, 100)
    
    const resizeObserver = new ResizeObserver(() => {
      updateVisibleBars()
    })
    resizeObserver.observe(waveformRef.current)

    return () => {
      clearTimeout(timer)
      resizeObserver.disconnect()
    }
  }, [mounted, updateVisibleBars])

  useEffect(() => {
    if (!mounted) return

    const updateTrackInfo = () => {
      const globalState = getGlobalAudioState()

      const controlsAvailable = globalState.playHistory && globalState.playHistory.length > 1
      setHasPlaylistControls(controlsAvailable)

      const duration = globalState.duration || 0
      const currentTime = globalState.currentTime || 0
      if (duration > 0 && currentTime >= 0) {
        const progress = (currentTime / duration) * 100
        setCurrentProgress(progress)
      } else {
        setCurrentProgress(0)
      }
    }

    updateTrackInfo()
    const interval = setInterval(updateTrackInfo, 100)
    const globalState = getGlobalAudioState()
    globalState.listeners.add(updateTrackInfo)

    return () => {
      clearInterval(interval)
      globalState.listeners.delete(updateTrackInfo)
    }
  }, [mounted])

  const waveformHeights = useMemo(() => {
    const seed = currentTrack?.title || currentTrack?.audioUrl || currentTrack?.url || "default"
    return generateWaveformHeights(seed, visibleBars)
  }, [currentTrack?.title, currentTrack?.audioUrl, currentTrack?.url, visibleBars])

  const handleImageClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (currentTrack?.productSlug || currentTrack?.productUrl) {
      const href = currentTrack.productUrl || "/product/" + currentTrack.productSlug
      router.push(href)
    }
  }

  const handlePlayPause = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const globalState = getGlobalAudioState()
    if (globalState.audioRef) {
      if (globalState.isPlaying) {
        globalState.audioRef.pause()
      } else {
        pauseMixcloudPlayer()
        globalState.audioRef.play()
      }
    }
  }

  const handleWaveformClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!waveformRef.current) return
    e.preventDefault()
    e.stopPropagation()

    const rect = waveformRef.current.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const progressPercent = (clickX / rect.width) * 100
    const clampedPercent = Math.max(0, Math.min(100, progressPercent))

    const globalState = getGlobalAudioState()

    if (globalState.duration && globalState.audioRef) {
      const targetTime = (clampedPercent / 100) * globalState.duration

      if (globalState.audioRef.ended || !isPlaying) {
        pauseMixcloudPlayer()
        globalState.audioRef.currentTime = targetTime
        globalState.currentTime = targetTime
        globalState.audioRef.play().catch(() => {})
      } else {
        globalState.audioRef.currentTime = targetTime
        globalState.currentTime = targetTime
      }

      globalState.listeners.forEach((listener) => listener())
    }
  }

  const playTrackAtIndex = (index: number) => {
    const globalState = getGlobalAudioState()
    const track = globalState.playHistory[index]
    if (!track) return

    pauseMixcloudPlayer()
    globalState.currentTrackIndex = index
    globalState.currentTrack = track
    globalState.isPlaying = true
    globalState.currentTime = 0
    globalState.duration = 0
    globalState.listeners.forEach((l) => l())

    if (globalState.audioRef) {
      const oldAudio = globalState.audioRef
      globalState.audioRef = null
      oldAudio.pause()
    }

    const audioUrl = track.audioUrl || track.url
    if (audioUrl) {
      const audio = new Audio()
      audio.crossOrigin = "anonymous"
      audio.src = audioUrl

      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
        if (!globalState.audioContext) {
          globalState.audioContext = new AudioContextClass()
        }
        const ctx = globalState.audioContext!
        if (ctx.state === "suspended") ctx.resume()
        const source = ctx.createMediaElementSource(audio)
        const analyser = ctx.createAnalyser()
        analyser.fftSize = 128
        analyser.smoothingTimeConstant = 0.85
        source.connect(analyser)
        analyser.connect(ctx.destination)
        globalState.analyser = analyser
        globalState.sourceNode = source
        ;(window as unknown as { globalAudioState: typeof globalState }).globalAudioState = globalState
        globalState.listeners.forEach((l) => l())
      } catch (e) { console.error("Web Audio setup failed:", e) }
      globalState.audioRef = audio

      audio.addEventListener("loadedmetadata", () => {
        if (globalState.audioRef === audio) {
          globalState.duration = audio.duration
          globalState.listeners.forEach((l) => l())
        }
      })

      audio.addEventListener("timeupdate", () => {
        if (globalState.audioRef === audio) {
          globalState.currentTime = audio.currentTime
          globalState.listeners.forEach((l) => l())
        }
      })

      audio.addEventListener("ended", () => {
        if (globalState.audioRef === audio) {
          if (globalState.currentTrackIndex < globalState.playHistory.length - 1) {
            playTrackAtIndex(globalState.currentTrackIndex + 1)
          } else {
            globalState.isPlaying = false
            globalState.listeners.forEach((l) => l())
          }
        }
      })

      audio.addEventListener("play", () => {
        if (globalState.audioRef === audio) {
          globalState.isPlaying = true
          globalState.listeners.forEach((l) => l())
        }
      })

      audio.addEventListener("pause", () => {
        if (globalState.audioRef === audio) {
          globalState.isPlaying = false
          globalState.listeners.forEach((l) => l())
        }
      })

      audio.play().catch(() => {})
    }
  }

  const handlePreviousTrack = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const globalState = getGlobalAudioState()
    if (globalState.currentTrackIndex > 0) {
      playTrackAtIndex(globalState.currentTrackIndex - 1)
    }
  }

  const handleNextTrack = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const globalState = getGlobalAudioState()
    if (globalState.currentTrackIndex < globalState.playHistory.length - 1) {
      playTrackAtIndex(globalState.currentTrackIndex + 1)
    }
  }

const handleClose = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const globalState = getGlobalAudioState()
    if (globalState.audioRef) {
      const audio = globalState.audioRef
      const startVolume = audio.volume
      const fadeDuration = 400
      const fadeSteps = 20
      const fadeInterval = fadeDuration / fadeSteps
      const volumeStep = startVolume / fadeSteps
      let step = 0

      const fadeOut = setInterval(() => {
        step++
        audio.volume = Math.max(0, startVolume - (volumeStep * step))
        if (step >= fadeSteps) {
          clearInterval(fadeOut)
          audio.pause()
          audio.currentTime = 0
          audio.volume = startVolume
          globalState.lastTrack = globalState.currentTrack
          globalState.currentTrack = null
          globalState.isPlaying = false
          globalState.currentTime = 0
          globalState.listeners.forEach((l) => l())
          if (onClose) onClose()
        }
      }, fadeInterval)
    } else {
      if (onClose) onClose()
    }
  }

  const handleContainerClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement
    const button = target.closest('button')
    if (!button) return
    
    e.preventDefault()
    e.stopPropagation()
    
    const title = button.getAttribute('title')
    if (title === 'Previous track') {
      const globalState = getGlobalAudioState()
      if (globalState.currentTrackIndex > 0) {
        playTrackAtIndex(globalState.currentTrackIndex - 1)
      }
    } else if (title === 'Pause' || title === 'Play') {
      const globalState = getGlobalAudioState()
      if (globalState.audioRef) {
        if (globalState.isPlaying) {
          globalState.audioRef.pause()
        } else {
          pauseMixcloudPlayer()
          globalState.audioRef.play()
        }
      }
    } else if (title === 'Next track') {
      const globalState = getGlobalAudioState()
      if (globalState.currentTrackIndex < globalState.playHistory.length - 1) {
        playTrackAtIndex(globalState.currentTrackIndex + 1)
      }
    } else if (title === 'Close player') {
      if (onClose) onClose()
    }
  }

  const globalState = mounted ? getGlobalAudioState() : null
  const canGoBack = mounted && globalState && globalState.currentTrackIndex > 0
  const canGoForward = mounted && globalState && globalState.currentTrackIndex < globalState.playHistory.length - 1

  const progressBarIndex = Math.floor((currentProgress / 100) * visibleBars)
  const progressColorStr = "rgb(" + progressColor.r + ", " + progressColor.g + ", " + progressColor.b + ")"

  if (!mounted) {
    return null
  }

  const isOnDifferentPage = currentTrack?.productSlug && 
    pathname !== "/product/" + currentTrack.productSlug && 
    pathname !== currentTrack.productUrl

  return (
    <div 
      className="audio-player flex items-center px-4"
      onClick={handleContainerClick}
      style={{ 
        height: BAR_HEIGHT + 'px',
        background: isHeader ? 'rgba(255,255,255,0.15)' : 'rgba(0, 0, 0, 0.85)',
        backdropFilter: !isHeader ? 'blur(8px)' : 'blur(16px)',
        WebkitBackdropFilter: !isHeader ? 'blur(8px)' : 'blur(16px)',
        pointerEvents: 'auto',
      }}
    >
      <div 
        className="flex items-center mr-4"
        style={{ 
          width: CONTROLS_WIDTH + 'px',
          flexShrink: 0,
          gap: '10px',
        }}
      >
        {hasPlaylistControls && (
          <button
            type="button"
            onClick={handlePreviousTrack}
            className={!canGoBack ? 'opacity-30' : ''}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: canGoBack ? 'pointer' : 'default',
              padding: '0 2px',
              fontSize: '14px',
              lineHeight: 1,
              color: isHeader ? undefined : 'white',
              pointerEvents: 'auto',
            }}
            title="Previous track"
            disabled={!canGoBack}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" className={isHeader ? 'outline-icon' : ''} fill="currentColor"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"></path></svg>
          </button>
        )}

        <button
          type="button"
          onClick={handlePlayPause}
          className={isHeader ? 'outline' : ''}
          style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: '0 2px',
            fontSize: '14px',
            lineHeight: 1,
            color: isHeader ? undefined : 'white',
            minWidth: '15px',
            flexShrink: 0,
            textAlign: 'center',
            pointerEvents: 'auto',
          }}
          title={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? "⏸" : "▶"}
        </button>

        {hasPlaylistControls && (
          <button
            type="button"
            onClick={handleNextTrack}
            className={!canGoForward ? 'opacity-30' : ''}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: canGoForward ? 'pointer' : 'default',
              padding: '0 2px',
              fontSize: '14px',
              lineHeight: 1,
              color: isHeader ? undefined : 'white',
              pointerEvents: 'auto',
            }}
            title="Next track"
            disabled={!canGoForward}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" className={isHeader ? 'outline-icon' : ''} fill="currentColor"><path d="M16 18h2V6h-2zm-3.5-6L4 6v12z"></path></svg>
          </button>
        )}
      </div>

      {showImage && (
        <div 
          style={{
            width: IMAGE_SIZE + 'px',
            height: IMAGE_SIZE + 'px',
            flexShrink: 0,
          }}
        >
          <img
            src={currentTrack?.productImage}
            alt={currentTrack?.album || currentTrack?.title || 'Album art'}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
            className={isOnDifferentPage ? 'cursor-pointer' : ''}
            onClick={isOnDifferentPage ? handleImageClick : undefined}
          />
        </div>
      )}

      <div 
        className={'text-small' + (isHeader ? ' outline' : '')}
        style={{
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          flexShrink: 0,
          width: TITLE_WIDTH + 'px',
          color: isHeader ? undefined : 'white',
          paddingLeft: '4px',
          paddingRight: '4px',
          marginLeft: showImage ? '8px' : '16px',
        }}
      >
        <span className="mono bold">{currentTrack?.title || "Unknown Track"}</span>
        {currentTrack?.artist && (
          <span style={{ fontWeight: 400, marginLeft: '8px' }}>{currentTrack.artist}</span>
        )}
      </div>

      <div
        ref={waveformRef}
        onClick={handleWaveformClick}
        title="Click to seek"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: BAR_GAP + 'px',
          flex: 1,
          minWidth: 0,
          height: '28px',
          cursor: 'pointer',
          overflow: 'hidden',
          marginLeft: '8px',
        }}
      >
        {waveformHeights.map((height, index) => {
          const isPlayedBar = index < progressBarIndex
          return (
            <div
              className="np-progress-bar" key={index}
              style={{
                width: BAR_WIDTH + 'px',
                height: (height * 75) + '%',
                minHeight: '3px',
                backgroundColor: isPlayedBar ? progressColorStr : 'white',
                border: '1px solid black',
                borderRadius: '2px',
                flexShrink: 0,
                boxSizing: 'border-box',
              }}
            />
          )
        })}
      </div>

      <button
        type="button"
        onClick={handleClose}
        className={isHeader ? 'outline' : ''}
        style={{
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          padding: '0 4px',
          fontSize: '14px',
          lineHeight: 1,
          flexShrink: 0,
          color: isHeader ? undefined : 'white',
          marginLeft: 'var(--space-md)',
          pointerEvents: 'auto',
        }}
        title="Close player"
      >
        ✕
      </button>
    </div>
  )
}