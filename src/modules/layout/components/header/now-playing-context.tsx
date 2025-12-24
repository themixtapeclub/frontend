// frontend/src/modules/layout/components/header/now-playing-context.tsx
"use client"

import { createContext, useContext, useState, useEffect, useCallback, ReactNode, useRef } from "react"
import { usePathname } from "next/navigation"
import { getGlobalAudioState } from "@lib/context/audio-player"

interface Track {
  title?: string
  artist?: string
  album?: string
  productImage?: string
  productSlug?: string
  productUrl?: string
  audioUrl?: string
  url?: string
}

interface NowPlayingContextType {
  isVisible: boolean
  bannerHeight: number
  closeBanner: () => void
  showOverlay: boolean
  isProductImageVisible: boolean
  setProductImageVisible: (visible: boolean) => void
  currentTrack: Track | null
  isPlaying: boolean
}

const NowPlayingContext = createContext<NowPlayingContextType>({
  isVisible: false,
  bannerHeight: 0,
  closeBanner: () => {},
  showOverlay: false,
  isProductImageVisible: true,
  setProductImageVisible: () => {},
  currentTrack: null,
  isPlaying: false,
})

export const BANNER_HEIGHT = 36

const IDLE_TIMEOUT_MS = 10000
const ANIMATION_DURATION_MS = 300

export function NowPlayingProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const [isVisible, setIsVisible] = useState(false)
  const [showOverlay, setShowOverlay] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null)
  const [isProductImageVisible, setProductImageVisible] = useState(true)
  const [isPlaying, setIsPlaying] = useState(false)
  
  const closedTrackUrlRef = useRef<string | null>(null)
  const idleTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const isHidingRef = useRef(false)
  const frozenVisibilityRef = useRef<{ isVisible: boolean; showOverlay: boolean; track: Track } | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  const clearPlayerState = useCallback(() => {
    const globalState = getGlobalAudioState()
    
    if (globalState.audioRef) {
      globalState.audioRef.pause()
      globalState.audioRef.currentTime = 0
    }
    globalState.isPlaying = false
    globalState.currentTime = 0
    globalState.currentTrack = null
    globalState.lastTrack = null
    
    setCurrentTrack(null)
    setIsPlaying(false)
    
    globalState.listeners.forEach((l) => l())
  }, [])

  const hidePlayer = useCallback(() => {
    isHidingRef.current = true
    frozenVisibilityRef.current = null
    setIsVisible(false)
    setShowOverlay(false)
    
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current)
    }
    animationTimeoutRef.current = setTimeout(() => {
      clearPlayerState()
      isHidingRef.current = false
      animationTimeoutRef.current = null
    }, ANIMATION_DURATION_MS)
  }, [clearPlayerState])

  useEffect(() => {
    if (!mounted) return

    const updateVisibility = () => {
      if (isHidingRef.current) return

      const globalState = getGlobalAudioState()
      const track = globalState.currentTrack
      const playing = globalState.isPlaying || false
      const trackUrl = track?.audioUrl || track?.url || null

      if (playing) {
        if (idleTimeoutRef.current) {
          clearTimeout(idleTimeoutRef.current)
          idleTimeoutRef.current = null
        }
        frozenVisibilityRef.current = null
        closedTrackUrlRef.current = null
      }

      if (!track) {
        if (frozenVisibilityRef.current && idleTimeoutRef.current) {
          setCurrentTrack(frozenVisibilityRef.current.track)
          setIsPlaying(false)
          setShowOverlay(frozenVisibilityRef.current.showOverlay)
          setIsVisible(frozenVisibilityRef.current.isVisible)
          return
        }
        frozenVisibilityRef.current = null
        setCurrentTrack(null)
        setIsPlaying(false)
        setIsVisible(false)
        setShowOverlay(false)
        return
      }

      setCurrentTrack(track)
      setIsPlaying(playing)

      if (trackUrl && trackUrl !== closedTrackUrlRef.current) {
        closedTrackUrlRef.current = null
      }

      if (closedTrackUrlRef.current && trackUrl === closedTrackUrlRef.current) {
        return
      }

      const productSlug = track?.productSlug
      
      let onProductPage = false
      if (productSlug && pathname) {
        const productPath = "/product/" + productSlug
        onProductPage = pathname.includes(productPath)
      }
      
      const newShowOverlay = onProductPage && isProductImageVisible
      const newIsVisible = !onProductPage || !isProductImageVisible

      if (!playing && !idleTimeoutRef.current) {
        frozenVisibilityRef.current = { isVisible: newIsVisible, showOverlay: newShowOverlay, track }
        setShowOverlay(newShowOverlay)
        setIsVisible(newIsVisible)
        idleTimeoutRef.current = setTimeout(() => {
          hidePlayer()
          idleTimeoutRef.current = null
        }, IDLE_TIMEOUT_MS)
        return
      }

      if (frozenVisibilityRef.current) {
        setShowOverlay(frozenVisibilityRef.current.showOverlay)
        setIsVisible(frozenVisibilityRef.current.isVisible)
        return
      }
      
      setShowOverlay(newShowOverlay)
      setIsVisible(newIsVisible)
    }

    updateVisibility()
    const interval = setInterval(updateVisibility, 250)
    const globalState = getGlobalAudioState()
    globalState.listeners.add(updateVisibility)

    return () => {
      clearInterval(interval)
      globalState.listeners.delete(updateVisibility)
    }
  }, [mounted, pathname, isProductImageVisible, hidePlayer])

  useEffect(() => {
    const height = isVisible ? BANNER_HEIGHT : 0
    document.documentElement.style.setProperty(
      '--now-playing-height',
      height + 'px'
    )
  }, [isVisible])

  const closeBanner = useCallback(() => {
    const globalState = getGlobalAudioState()
    const trackUrl = globalState.currentTrack?.audioUrl || globalState.currentTrack?.url || null
    closedTrackUrlRef.current = trackUrl
    
    if (idleTimeoutRef.current) {
      clearTimeout(idleTimeoutRef.current)
      idleTimeoutRef.current = null
    }
    
    hidePlayer()
  }, [hidePlayer])

  useEffect(() => {
    return () => {
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current)
      }
    }
  }, [])

  return (
    <NowPlayingContext.Provider value={{ 
      isVisible, 
      bannerHeight: isVisible ? BANNER_HEIGHT : 0, 
      closeBanner,
      showOverlay,
      isProductImageVisible,
      setProductImageVisible,
      currentTrack,
      isPlaying,
    }}>
      {children}
    </NowPlayingContext.Provider>
  )
}

export function useNowPlaying(): NowPlayingContextType {
  return useContext(NowPlayingContext)
}