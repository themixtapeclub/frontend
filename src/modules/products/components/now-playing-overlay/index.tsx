// frontend/src/modules/products/components/now-playing-overlay/index.tsx
"use client"

import { useEffect, useRef, useState } from "react"
import { useNowPlaying, BANNER_HEIGHT } from "@modules/layout/components/header/now-playing-context"
import NowPlayingBar from "@modules/layout/components/header/now-playing-bar"

export default function NowPlayingOverlay() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isRendered, setIsRendered] = useState(false)
  const [isAnimatedIn, setIsAnimatedIn] = useState(false)
  const { 
    showOverlay,
    setProductImageVisible,
    closeBanner,
    currentTrack, 
    isPlaying,
  } = useNowPlaying()

  useEffect(() => {
    const productImages = document.querySelector('.product-images')
    if (!productImages) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setProductImageVisible(entry.isIntersecting)
        })
      },
      {
        threshold: 0,
        rootMargin: '-36px 0px 0px 0px'
      }
    )

    observer.observe(productImages)

    return () => {
      observer.disconnect()
    }
  }, [setProductImageVisible])

  useEffect(() => {
    if (showOverlay && !isRendered) {
      setIsRendered(true)
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsAnimatedIn(true)
        })
      })
    } else if (!showOverlay && isRendered) {
      setIsAnimatedIn(false)
      const timer = setTimeout(() => {
        setIsRendered(false)
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [showOverlay, isRendered])

  if (!isRendered) {
    return null
  }

  return (
    <div
      ref={containerRef}
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: BANNER_HEIGHT + 'px',
        zIndex: 20,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          width: '100%',
          height: '100%',
          opacity: isAnimatedIn ? 1 : 0,
          filter: isAnimatedIn ? 'blur(0px)' : 'blur(20px)',
          transition: 'opacity 0.3s ease-out, filter 0.3s ease-out',
          pointerEvents: isAnimatedIn ? 'auto' : 'none',
        }}
      >
        <NowPlayingBar
          variant="overlay"
          currentTrack={currentTrack}
          isPlaying={isPlaying}
          onClose={closeBanner}
        />
      </div>
    </div>
  )
}