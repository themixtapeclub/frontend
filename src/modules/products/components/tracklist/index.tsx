// frontend/src/modules/products/components/tracklist/index.tsx
"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { useAudioPlayer, getGlobalAudioState } from "@lib/context/audio-player"
import { 
  needsTracklistEnrichment, 
  fetchCurrentTracklist,
  enrichTracklistFromDiscogs
} from "@lib/util/discogs"

const pauseMixcloudPlayer = () => {
  try {
    const pause = (window as any).__pauseMixcloudPlayer
    if (pause) pause()
  } catch {}
}

type Track = {
  number?: string
  title: string
  artist?: string
  duration?: string
  url?: string
  _key?: string
}

type TracklistProps = {
  tracklist: Track[] | null | undefined
  product?: any
  disableAudio?: boolean
}

const tracklistCache = new Map<string, Track[]>()

export function isTracklistCached(productId: string): boolean {
  if (!productId) return false
  const cached = tracklistCache.get(productId)
  return cached !== undefined && cached.length > 0 && !needsTracklistEnrichment(cached)
}

export default function Tracklist({ tracklist: initialTracklist, product, disableAudio = false }: TracklistProps) {
  const productId = product?.id
  
  const [tracklist, setTracklist] = useState<Track[]>(() => {
    if (productId && tracklistCache.has(productId)) {
      return tracklistCache.get(productId)!
    }
    return initialTracklist || []
  })
  
  const [isLoading, setIsLoading] = useState(() => {
    if (productId && tracklistCache.has(productId)) {
      return false
    }
    if (initialTracklist && initialTracklist.length > 0) {
      return false
    }
    return true
  })
  const [mounted, setMounted] = useState(false)
  const [scrollingTrack, setScrollingTrack] = useState<string | null>(null)
  const [, forceUpdate] = useState({})
  const [trackIsPlaying, setTrackIsPlaying] = useState(false)
  const [isIdle, setIsIdle] = useState(false)
  const [lastPlayingTime, setLastPlayingTime] = useState(0)
  const [idleTransitionStartTime, setIdleTransitionStartTime] = useState<number | null>(null)
  
  const progressBarRefs = useRef<Record<string, HTMLLIElement | null>>({})
  const textContainerRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const textRefs = useRef<Record<string, HTMLSpanElement | null>>({})
  const loadingRef = useRef<Set<string>>(new Set())
  const animationFrameRef = useRef<Record<string, number>>({})
  const scrollPositionRef = useRef<Record<string, number>>({})
  
  const audioPlayer = useAudioPlayer()

  useEffect(() => {
    setMounted(true)
  }, [])

  const startMarquee = useCallback((trackKey: string) => {
    const textEl = textRefs.current[trackKey]
    const containerEl = textContainerRefs.current[trackKey]
    
    if (!textEl || !containerEl) return
    
    const textWidth = textEl.scrollWidth
    const containerWidth = containerEl.clientWidth
    const overflow = textWidth - containerWidth
    
    if (overflow <= 0) return
    
    setScrollingTrack(trackKey)
    scrollPositionRef.current[trackKey] = 0
    
    const speed = 0.5
    const maxScroll = overflow + 20
    
    const animate = () => {
      scrollPositionRef.current[trackKey] += speed
      
      if (scrollPositionRef.current[trackKey] >= maxScroll) {
        textEl.style.transform = `translateX(-${maxScroll}px)`
        return
      }
      
      textEl.style.transform = `translateX(-${scrollPositionRef.current[trackKey]}px)`
      animationFrameRef.current[trackKey] = requestAnimationFrame(animate)
    }
    
    animationFrameRef.current[trackKey] = requestAnimationFrame(animate)
  }, [])

  const stopMarquee = useCallback((trackKey: string) => {
    if (animationFrameRef.current[trackKey]) {
      cancelAnimationFrame(animationFrameRef.current[trackKey])
      delete animationFrameRef.current[trackKey]
    }
    
    const textEl = textRefs.current[trackKey]
    if (textEl) {
      textEl.style.transition = 'transform 0.3s ease-out'
      textEl.style.transform = 'translateX(0)'
      
      setTimeout(() => {
        if (textEl) textEl.style.transition = ''
      }, 300)
    }
    
    scrollPositionRef.current[trackKey] = 0
    setScrollingTrack(null)
  }, [])

  useEffect(() => {
    if (!mounted || !productId) return

    if (tracklistCache.has(productId)) {
      const cached = tracklistCache.get(productId)!
      if (!needsTracklistEnrichment(cached)) {
        setTracklist(cached)
        setIsLoading(false)
        return
      }
    }

    if (loadingRef.current.has(productId)) return
    loadingRef.current.add(productId)

    const loadTracklist = async () => {
      const discogsReleaseId = product?.discogs_release_id || 
                              product?.metadata?.discogs_release_id

      try {
        const dbTracklist = await fetchCurrentTracklist(productId)
        
        if (dbTracklist && dbTracklist.length > 0) {
          tracklistCache.set(productId, dbTracklist)
          setTracklist(dbTracklist)
          setIsLoading(false)
          
          if (!needsTracklistEnrichment(dbTracklist)) {
            loadingRef.current.delete(productId)
            return
          }
        }

        if (discogsReleaseId) {
          const tracklistToEnrich = dbTracklist || initialTracklist || []
          
          if (needsTracklistEnrichment(tracklistToEnrich)) {
            const mainArtist = product?.artist || product?.metadata?.artist
            
            const enriched = await enrichTracklistFromDiscogs(
              productId,
              discogsReleaseId.toString(),
              tracklistToEnrich,
              mainArtist
            )

            if (enriched && enriched.length > 0) {
              tracklistCache.set(productId, enriched)
              setTracklist(enriched)
              audioPlayer.updateQueueTrackTitles(enriched)
            }
          }
        }
        setIsLoading(false)
      } catch (error) {
        console.error('[Tracklist] Load failed:', error)
        setIsLoading(false)
      } finally {
        loadingRef.current.delete(productId)
      }
    }

    loadTracklist()
  }, [mounted, productId, product?.discogs_release_id, product?.metadata, product?.artist, initialTracklist])

  useEffect(() => {
    if (productId && tracklistCache.has(productId)) {
      setTracklist(tracklistCache.get(productId)!)
    }
  }, [productId])

  useEffect(() => {
    return () => {
      Object.values(animationFrameRef.current).forEach(cancelAnimationFrame)
    }
  }, [])

  useEffect(() => {
    if (!mounted) return

    const updatePlayingState = () => {
      const globalState = getGlobalAudioState()
      const playing = globalState?.isPlaying || false

      if (playing !== trackIsPlaying) {
        setTrackIsPlaying(playing)
        if (playing) {
          setLastPlayingTime(Date.now())
          setIsIdle(false)
          setIdleTransitionStartTime(null)
        }
      }
    }

    const interval = setInterval(updatePlayingState, 100)
    const globalState = getGlobalAudioState()
    globalState.listeners.add(updatePlayingState)

    return () => {
      clearInterval(interval)
      globalState.listeners.delete(updatePlayingState)
    }
  }, [mounted, trackIsPlaying])

  useEffect(() => {
    if (!mounted) return

    const checkIdleState = () => {
      const now = Date.now()
      const timeSinceLastPlaying = lastPlayingTime ? now - lastPlayingTime : 0

      if (trackIsPlaying) {
        if (isIdle || idleTransitionStartTime) {
          setIsIdle(false)
          setIdleTransitionStartTime(null)
        }
        return
      }

      const shouldStartIdleTransition = !trackIsPlaying && lastPlayingTime && timeSinceLastPlaying > 5000

      if (shouldStartIdleTransition && !idleTransitionStartTime && !isIdle) {
        setIdleTransitionStartTime(now)
      }

      if (idleTransitionStartTime && !isIdle) {
        const idleTransitionElapsed = now - idleTransitionStartTime
        if (idleTransitionElapsed > 2000) {
          setIsIdle(true)
          setIdleTransitionStartTime(null)
        }
      }
    }

    const idleCheckInterval = setInterval(checkIdleState, 100)
    return () => clearInterval(idleCheckInterval)
  }, [mounted, trackIsPlaying, lastPlayingTime, idleTransitionStartTime, isIdle])

  useEffect(() => {
    if (!mounted) return

    const updateProgress = () => forceUpdate({})
    const globalState = getGlobalAudioState()
    globalState.listeners.add(updateProgress)
    const interval = setInterval(updateProgress, 100)

    return () => {
      clearInterval(interval)
      globalState.listeners.delete(updateProgress)
    }
  }, [mounted])

  if (!tracklist || tracklist.length === 0) {
    return null
  }

  const showContent = !isLoading && tracklist.length > 0

  const handlePlayPause = (track: Track, index: number) => {
    if (!track.url || disableAudio) return

    const enhancedTracks = tracklist.map((t, i) => ({
      ...t,
      audioUrl: t.url,
      artist: t.artist || "",
      album: product?.title || "",
      productSlug: product?.handle,
      productUrl: product?.handle ? `/product/${product.handle}` : undefined,
      productName: product?.title,
      productImage: product?.images?.[0]?.url || product?.thumbnail || null,
      title: t.title || `Track ${i + 1}`,
    }))

    const playableTracks = enhancedTracks.filter((t) => t.audioUrl)
    if (playableTracks.length === 0) return

    const clickedTrackIndex = playableTracks.findIndex((t) => t.audioUrl === track.url)
    if (clickedTrackIndex === -1) return

    audioPlayer.playTracklist(playableTracks, clickedTrackIndex)
  }

  const handleRowClick = (e: React.MouseEvent, track: Track) => {
    if (!track.url || disableAudio) return

    const globalState = getGlobalAudioState()
    const currentTrack = globalState.currentTrack
    const isCurrentTrack = currentTrack && (currentTrack.audioUrl || currentTrack.url) === track.url

    if (!isCurrentTrack) {
      const index = tracklist.findIndex((t) => t.url === track.url)
      handlePlayPause(track, index)
      return
    }

    const trackRow = progressBarRefs.current[track.url]
    if (!trackRow) return

    const rect = trackRow.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const progressPercent = (clickX / rect.width) * 100
    const clampedPercent = Math.max(0, Math.min(100, progressPercent))

    if (globalState.duration && globalState.audioRef) {
      const targetTime = (clampedPercent / 100) * globalState.duration
      globalState.audioRef.currentTime = targetTime
      globalState.currentTime = targetTime

      if (globalState.audioRef.ended || !globalState.isPlaying) {
        pauseMixcloudPlayer()
        globalState.audioRef.play().catch(() => {})
      }

      globalState.listeners.forEach((listener) => listener())
    }
  }

  const getTrackProgress = (track: Track) => {
    if (!mounted || disableAudio) return 0

    const globalState = getGlobalAudioState()
    const currentTrack = globalState.currentTrack
    const trackUrl = track.url

    if (!currentTrack || (currentTrack.audioUrl || currentTrack.url) !== trackUrl) {
      return 0
    }

    return globalState.duration ? (globalState.currentTime / globalState.duration) * 100 : 0
  }

  const getCurrentTrack = () => {
    if (disableAudio) return null
    const globalState = getGlobalAudioState()
    if (!globalState.isPlaying) return null
    return globalState.currentTrack
  }

  const currentGlobalTrack = getCurrentTrack()

  return (
    <div className={`tracklist-section ${isLoading ? 'tracklist-loading' : 'tracklist-loaded'}`} data-loading={isLoading}>
      {!isLoading && tracklist.length > 0 && (
      <ol className="tracklist mono list-none m-0 p-0">
        {tracklist.map((track, index) => {
          const hasAudio = !disableAudio && !!track.url
          const trackKey = track._key || `track-${index}`
          const isCurrentlyPlaying = !disableAudio && currentGlobalTrack && (currentGlobalTrack.audioUrl || currentGlobalTrack.url) === track.url
          const trackProgress = getTrackProgress(track)
          const trackTitle = track.title || `Track ${index + 1}`

          return (
            <li
              key={trackKey}
              className={`tracklist-item relative border-b border-black ${hasAudio ? 'has-audio' : ''}`}
              style={{ padding: 0, backgroundColor: "transparent", cursor: hasAudio ? "pointer" : "default" }}
              ref={(el) => {
                if (track.url && !disableAudio) progressBarRefs.current[track.url] = el
              }}
              onClick={hasAudio ? (e) => handleRowClick(e, track) : undefined}
              onMouseEnter={() => startMarquee(trackKey)}
              onMouseLeave={() => stopMarquee(trackKey)}
            >
              {hasAudio && isCurrentlyPlaying && (
                <div
                  className="absolute h-full left-0 top-0 pointer-events-none"
                  style={{
                    backgroundColor: "#000000",
                    width: `${trackProgress}%`,
                    transition: trackProgress === 0 ? "none" : "width 0.1s ease",
                    zIndex: 1,
                  }}
                />
              )}

              {hasAudio && isCurrentlyPlaying && trackProgress > 0 && (
                <div 
                  className="absolute inset-0 flex items-center pointer-events-none"
                  style={{ 
                    zIndex: 3,
                    clipPath: `inset(0 ${100 - trackProgress}% 0 0)`,
                    transition: trackProgress === 0 ? "none" : "clip-path 0.1s ease",
                  }}
                >
                  <div className="flex items-center p-2 flex-shrink-0">
                    <span className="text-small" style={{ width: "20px", display: "inline-flex", alignItems: "center", justifyContent: "center", color: "#ffffff" }}>
                      {isCurrentlyPlaying && trackIsPlaying && !isIdle && !idleTransitionStartTime ? (
                        <span className="frequency-bars inline-flex items-center justify-center gap-[1px] h-[14px] w-[14px]">
                          <span className="w-[2px] bg-white rounded-sm animate-freq1" />
                          <span className="w-[2px] bg-white rounded-sm animate-freq2" />
                          <span className="w-[2px] bg-white rounded-sm animate-freq3" />
                        </span>
                      ) : (
                        "▶"
                      )}
                    </span>
                  </div>
                  <div className="flex-1 h-10 pr-2 overflow-hidden min-w-0 flex items-center">
                    <span 
                      className="whitespace-nowrap inline-block"
                      style={{ transform: textRefs.current[trackKey]?.style.transform || 'translateX(0)' }}
                    >
                      <span className="mono bold text-white text-small">{trackTitle}</span>
                      {track.artist?.trim() && (
                        <span className="mono text-white text-small ml-2">{track.artist}</span>
                      )}
                    </span>
                  </div>
                  {track.duration && (
                    <span className="pr-3 mono text-white text-small flex-shrink-0">{track.duration}</span>
                  )}
                </div>
              )}

              <div className="flex items-center relative" style={{ zIndex: 2 }}>
                <div className="flex items-center p-2 flex-shrink-0">
                  {hasAudio ? (
                    <span
                      className="play-btn"
                      style={{
                        width: "20px",
                        display: "inline-flex", alignItems: "center", justifyContent: "center",
                        color: "#000000",
                        pointerEvents: "none",
                      }}
                    >
                      {isCurrentlyPlaying && trackIsPlaying && getGlobalAudioState().isPlaying && !isIdle && !idleTransitionStartTime ? (
                        <span className="frequency-bars inline-flex items-center justify-center gap-[1px] h-[14px] w-[14px]">
                          <span className="w-[2px] bg-black rounded-sm animate-freq1" />
                          <span className="w-[2px] bg-black rounded-sm animate-freq2" />
                          <span className="w-[2px] bg-black rounded-sm animate-freq3" />
                        </span>
                      ) : (
                        "▶"
                      )}
                    </span>
                  ) : (
                    <span className="text-small" style={{ width: "20px", display: "inline-flex", alignItems: "center", justifyContent: "center", color: "#999999" }}>
                      {track.number || ""}
                    </span>
                  )}
                </div>

                <div 
                  ref={(el) => { textContainerRefs.current[trackKey] = el }}
                  className="flex-1 h-8 pr-2 pointer-events-none overflow-hidden min-w-0 flex items-center"
                >
                  <span 
                    ref={(el) => { textRefs.current[trackKey] = el }}
                    className="whitespace-nowrap inline-block"
                  >
                    <span className="mono bold text-black text-small">{trackTitle}</span>
                    {track.artist?.trim() && (
                      <span className="mono text-small ml-2">{track.artist}</span>
                    )}
                  </span>
                </div>

                {track.duration && (
                  <span className="pr-3 mono text-small flex-shrink-0">{track.duration}</span>
                )}
              </div>
            </li>
          )
        })}
      </ol>
      )}

      <style jsx>{`
        .tracklist-item.has-audio:hover {
          background-color: rgba(0, 0, 0, 0.05) !important;
        }
        @keyframes freq1 {
          0%, 100% { transform: scaleY(0.3); }
          50% { transform: scaleY(1.5); }
        }
        @keyframes freq2 {
          0%, 100% { transform: scaleY(0.5); }
          50% { transform: scaleY(1.2); }
        }
        @keyframes freq3 {
          0%, 100% { transform: scaleY(0.4); }
          50% { transform: scaleY(1.4); }
        }
        .animate-freq1 { height: 4px; animation: freq1 0.8s ease-in-out infinite; }
        .animate-freq2 { height: 8px; animation: freq2 1.2s ease-in-out infinite 0.2s; }
        .animate-freq3 { height: 6px; animation: freq3 0.9s ease-in-out infinite 0.4s; }
      `}</style>
    </div>
  )
}