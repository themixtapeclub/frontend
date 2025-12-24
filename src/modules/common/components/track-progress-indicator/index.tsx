// src/modules/common/components/track-progress-indicator/index.tsx
"use client"

import { useEffect, useState, useRef } from "react"
import { getGlobalAudioState } from "@lib/context/audio-player"

interface TrackProgressIndicatorProps {
  totalTracks: number
  currentTrackIndex: number
  productHandle: string
  className?: string
  onTrackClick?: (trackIndex: number) => void
  onSeek?: (progress: number) => void
}

export default function TrackProgressIndicator({
  totalTracks,
  currentTrackIndex,
  productHandle,
  className = "",
  onTrackClick,
  onSeek,
}: TrackProgressIndicatorProps) {
  const [mounted, setMounted] = useState(false)
  const [progress, setProgress] = useState(0)
  const [progressTrackIndex, setProgressTrackIndex] = useState(-1)
  const trackRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    setMounted(true)
    
    const updateProgress = () => {
      const state = getGlobalAudioState()
      if (state.duration > 0) {
        setProgress(state.currentTime / state.duration)
      } else {
        setProgress(0)
      }
    }

    const state = getGlobalAudioState()
    state.listeners.add(updateProgress)
    updateProgress()

    return () => {
      state.listeners.delete(updateProgress)
    }
  }, [])

  useEffect(() => {
    setProgressTrackIndex(currentTrackIndex)
    setProgress(0)
  }, [currentTrackIndex])

  if (!mounted || totalTracks === 0) return null

  const isPlaying = currentTrackIndex >= 0

  const TOTAL_BARS = 120
  const GAP_BETWEEN_GROUPS = 4

  const totalGapUnits = (totalTracks - 1) * GAP_BETWEEN_GROUPS
  const barsPerTrack = Math.max(2, Math.floor((TOTAL_BARS - totalGapUnits) / totalTracks))

  const handleTrackClick = (e: React.MouseEvent, trackIdx: number) => {
    e.preventDefault()
    e.stopPropagation()
    
    const trackEl = trackRefs.current[trackIdx]
    if (!trackEl) return
    
    const rect = trackEl.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const clickProgress = Math.max(0, Math.min(1, clickX / rect.width))
    
    if (trackIdx === currentTrackIndex && onSeek) {
      onSeek(clickProgress)
    } else if (onTrackClick) {
      onTrackClick(trackIdx)
    }
  }

  return (
    <div 
      className={`w-full flex items-center justify-between bg-black gap-1 p-[3px] rounded-sm ${className}`}
    >
      {Array.from({ length: totalTracks }).map((_, trackIdx) => {
        const isCompleted = isPlaying && trackIdx < currentTrackIndex
        const isCurrent = isPlaying && trackIdx === currentTrackIndex
        const progressToUse = progressTrackIndex === currentTrackIndex ? progress : 0
        const barsFilledInCurrent = isCurrent 
          ? Math.max(1, Math.floor(progressToUse * barsPerTrack))
          : 0

        return (
          <div
            key={trackIdx}
            ref={(el) => { trackRefs.current[trackIdx] = el }}
            className="flex-1 h-3 flex items-center gap-px cursor-pointer"
            onClick={(e) => handleTrackClick(e, trackIdx)}
          >
            {Array.from({ length: barsPerTrack }).map((_, barIdx) => {
              const isBarActive = isCompleted || (isCurrent && barIdx < barsFilledInCurrent)
              
              return (
                <div
                  key={barIdx}
                  className={`flex-1 h-full rounded-sm pointer-events-none ${isBarActive ? "bg-[#FFD700]" : "bg-white/30"}`}
                />
              )
            })}
          </div>
        )
      })}
    </div>
  )
}