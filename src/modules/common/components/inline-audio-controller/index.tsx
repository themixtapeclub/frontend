// src/modules/common/components/inline-audio-controller/index.tsx
"use client"

import { useState, useEffect } from "react"
import { useAudioPlayer, getGlobalAudioState } from "@lib/context/audio-player"
import { 
  needsTracklistEnrichment, 
  enrichTracklistFromDiscogs 
} from "@lib/util/discogs"
import "./styles.css"
import TrackProgressIndicator from "@modules/common/components/track-progress-indicator"

interface Track {
  url?: string
  title?: string
  artist?: string
  [key: string]: any
}

interface InlineAudioControllerProps {
  productHandle: string
  productTitle: string
  productThumbnail?: string | null
  tracklist: Track[]
  className?: string
  forceShow?: boolean
  discogsReleaseId?: string | null
  productId?: string | null
  artist?: string | null
  isOverlayVisible?: boolean
}

const TEXT_SHADOW = "drop-shadow(-0.5px -0.5px 0 #000) drop-shadow(0.5px -0.5px 0 #000) drop-shadow(-0.5px 0.5px 0 #000) drop-shadow(0.5px 0.5px 0 #000) drop-shadow(-1px 0 0 #000) drop-shadow(1px 0 0 #000) drop-shadow(0 -1px 0 #000) drop-shadow(0 1px 0 #000)"

const enrichmentInProgress = new Set<string>()
const enrichedTracklistCache = new Map<string, Track[]>()

export function getCachedTracklist(productId: string): Track[] | null {
  return enrichedTracklistCache.get(productId) || null
}

function toDiscogsTrackFormat(tracks: Track[]): Array<{ title: string; url?: string; artist?: string; duration?: string; number?: string }> {
  return tracks.map((t, i) => ({
    title: t.title || `Track ${i + 1}`,
    url: t.url,
    artist: t.artist,
    duration: t.duration,
    number: t.number,
  }))
}

export default function InlineAudioController({
  productHandle,
  productTitle,
  productThumbnail,
  tracklist,
  className = "",
  forceShow = false,
  discogsReleaseId,
  productId,
  artist,
  isOverlayVisible = true,
}: InlineAudioControllerProps) {
  const [mounted, setMounted] = useState(false)
  const [enrichedTracklist, setEnrichedTracklist] = useState<Track[]>(() => {
    if (productId && enrichedTracklistCache.has(productId)) {
      return enrichedTracklistCache.get(productId)!
    }
    return tracklist
  })
  const audioPlayer = useAudioPlayer()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (productId && enrichedTracklistCache.has(productId)) {
      setEnrichedTracklist(enrichedTracklistCache.get(productId)!)
    } else {
      setEnrichedTracklist(tracklist)
    }
  }, [tracklist, productId])

  const playableTracks = enrichedTracklist.filter((t) => t.url)
  const hasAudio = playableTracks.length > 0

  if (!hasAudio && !forceShow) return null

  const globalState = mounted ? getGlobalAudioState() : { currentTrack: null }
  const currentTrack = globalState.currentTrack
  const isPlaying = mounted && currentTrack && currentTrack.productSlug === productHandle

  if (!isOverlayVisible && !isPlaying) {
    return null
  }

  const currentTrackTitle = currentTrack?.title || ""
  const currentTrackUrl = currentTrack?.audioUrl || currentTrack?.url
  const currentTrackIndex = playableTracks.findIndex((t) => t.url === currentTrackUrl)
  const hasPrev = currentTrackIndex > 0
  const hasNext = currentTrackIndex >= 0 && currentTrackIndex < playableTracks.length - 1

  const buildTracksForPlayer = (tracks: Track[]) => {
    return tracks.filter((t) => t.url).map((t, i) => ({
      ...t,
      audioUrl: t.url,
      artist: t.artist || "",
      album: productTitle || "",
      productSlug: productHandle,
      productUrl: productHandle ? `/product/${productHandle}` : undefined,
      productName: productTitle,
      productImage: productThumbnail || undefined,
      title: t.title || `Track ${i + 1}`,
    }))
  }

  const enrichAndPlay = async (startIndex: number) => {
    const cachedTracklist = productId ? enrichedTracklistCache.get(productId) : null
    const currentTracklist = cachedTracklist || enrichedTracklist
    
    const tracks = buildTracksForPlayer(currentTracklist)
    audioPlayer.playTracklist(tracks, startIndex)
    
    if (!discogsReleaseId || !productId) return
    
    const discogsFormatTracks = toDiscogsTrackFormat(currentTracklist)
    if (!needsTracklistEnrichment(discogsFormatTracks)) return
    
    const enrichKey = `${productId}-${discogsReleaseId}`
    if (enrichmentInProgress.has(enrichKey)) return
    enrichmentInProgress.add(enrichKey)
    
    try {
      const enriched = await enrichTracklistFromDiscogs(
        productId,
        discogsReleaseId.toString(),
        discogsFormatTracks,
        artist || undefined
      )
      
      if (enriched && enriched.length > 0) {
        enrichedTracklistCache.set(productId, enriched)
        setEnrichedTracklist(enriched)
        audioPlayer.updateQueueTrackTitles(enriched)
      }
    } catch (error) {
      console.error('[InlineAudioController] Enrichment failed:', error)
    } finally {
      enrichmentInProgress.delete(enrichKey)
    }
  }

  const handlePlay = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (playableTracks.length === 0) return
    enrichAndPlay(0)
  }

  const handlePrev = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!hasPrev) return
    enrichAndPlay(currentTrackIndex - 1)
  }

  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!hasNext) return
    enrichAndPlay(currentTrackIndex + 1)
  }

  return (
    <div
      className={`flex flex-col ${className}`}
      style={{ pointerEvents: "none", userSelect: "none" }}
    >
      <div className="h-6 flex items-center">
        {isPlaying ? (
          <div className="flex items-center justify-between w-full">
            <button
              onClick={handlePrev}
              className="flex-shrink-0 pointer-events-auto track-nav-btn"
              style={{
                cursor: hasPrev ? "pointer" : "default",
                filter: hasPrev ? TEXT_SHADOW : "none",
                opacity: hasPrev ? 1 : 0,
                visibility: hasPrev ? "visible" : "hidden",
              }}
              title="Previous track"
              disabled={!hasPrev}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="currentColor"
                stroke="currentColor"
                strokeWidth="1"
              >
                <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
              </svg>
            </button>

            <div className="flex-1 mx-3 text-center min-w-0">
              <div
                className="mono uppercase flex items-center justify-center gap-1.5"
                style={{
                  color: "#FFD700",
                  lineHeight: 1.2,
                  filter: TEXT_SHADOW,
                }}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  stroke="currentColor"
                  strokeWidth="1"
                  className="flex-shrink-0"
                >
                  <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                </svg>
                <span className="truncate">{currentTrackTitle}</span>
              </div>
            </div>

            <button
              onClick={handleNext}
              className="flex-shrink-0 pointer-events-auto track-nav-btn"
              style={{
                cursor: hasNext ? "pointer" : "default",
                filter: hasNext ? TEXT_SHADOW : "none",
                opacity: hasNext ? 1 : 0,
                visibility: hasNext ? "visible" : "hidden",
              }}
              title="Next track"
              disabled={!hasNext}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="currentColor"
                stroke="currentColor"
                strokeWidth="1"
              >
                <path d="M16 18h2V6h-2zm-3.5-6L4 6v12z" />
              </svg>
            </button>
          </div>
        ) : (
          <div className="flex justify-end w-full">
            <button
              onClick={handlePlay}
              className="w-7 h-7 rounded-full bg-white hover:bg-white/90 transition-colors flex items-center justify-center pointer-events-auto"
              style={{ border: "none" }}
              title="Play"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="black"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export function SimplePlayButton({
  productHandle,
  productTitle,
  productThumbnail,
  tracklist,
  className = "",
  discogsReleaseId,
  productId,
  artist,
}: InlineAudioControllerProps) {
  const audioPlayer = useAudioPlayer()
  const [enrichedTracklist, setEnrichedTracklist] = useState<Track[]>(() => {
    if (productId && enrichedTracklistCache.has(productId)) {
      return enrichedTracklistCache.get(productId)!
    }
    return tracklist
  })

  useEffect(() => {
    if (productId && enrichedTracklistCache.has(productId)) {
      setEnrichedTracklist(enrichedTracklistCache.get(productId)!)
    } else {
      setEnrichedTracklist(tracklist)
    }
  }, [tracklist, productId])

  const playableTracks = enrichedTracklist.filter((t) => t.url)
  const hasAudio = playableTracks.length > 0

  if (!hasAudio) return null

  const buildTracksForPlayer = (tracks: Track[]) => {
    return tracks.filter((t) => t.url).map((t, i) => ({
      ...t,
      audioUrl: t.url,
      artist: t.artist || "",
      album: productTitle || "",
      productSlug: productHandle,
      productUrl: productHandle ? `/product/${productHandle}` : undefined,
      productName: productTitle,
      productImage: productThumbnail || undefined,
      title: t.title || `Track ${i + 1}`,
    }))
  }

  const handlePlay = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (playableTracks.length === 0) return
    
    const cachedTracklist = productId ? enrichedTracklistCache.get(productId) : null
    const currentTracklist = cachedTracklist || enrichedTracklist
    
    const tracks = buildTracksForPlayer(currentTracklist)
    audioPlayer.playTracklist(tracks, 0)
    
    if (!discogsReleaseId || !productId) return
    
    const discogsFormatTracks = toDiscogsTrackFormat(currentTracklist)
    if (!needsTracklistEnrichment(discogsFormatTracks)) return
    
    const enrichKey = `${productId}-${discogsReleaseId}`
    if (enrichmentInProgress.has(enrichKey)) return
    enrichmentInProgress.add(enrichKey)
    
    try {
      const enriched = await enrichTracklistFromDiscogs(
        productId,
        discogsReleaseId.toString(),
        discogsFormatTracks,
        artist || undefined
      )
      
      if (enriched && enriched.length > 0) {
        enrichedTracklistCache.set(productId, enriched)
        setEnrichedTracklist(enriched)
        audioPlayer.updateQueueTrackTitles(enriched)
      }
    } catch (error) {
      console.error('[SimplePlayButton] Enrichment failed:', error)
    } finally {
      enrichmentInProgress.delete(enrichKey)
    }
  }

  const hasCustomColor = className.includes('text-')
  
  return (
    <button
      onClick={handlePlay}
      className={`${hasCustomColor ? '' : 'text-black hover:text-black/70'} transition-colors ${className}`}
      style={{ background: "none", border: "none", padding: 0, userSelect: "none" }}
      title="Play"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 1c-4.97 0-9 4.03-9 9v7c0 1.66 1.34 3 3 3h3v-8H5v-2c0-3.87 3.13-7 7-7s7 3.13 7 7v2h-4v8h3c1.66 0 3-1.34 3-3v-7c0-4.97-4.03-9-9-9z"/></svg>
    </button>
  )
}