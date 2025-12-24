// frontend/src/modules/layout/components/header/marquee-banner.tsx
"use client"

import { useRef, useEffect } from "react"
import { usePathname } from "next/navigation"

export default function MarqueeBanner() {
  const pathname = usePathname()
  const trackRef = useRef<HTMLDivElement>(null)
  const animationRef = useRef<Animation | null>(null)
  const targetRateRef = useRef(0)
  const rafRef = useRef<number | null>(null)
  const easePlaybackRateRef = useRef<() => void>(() => {})
  const isCheckout = pathname?.includes('/checkout')

  useEffect(() => {
    if (isCheckout) return
    const track = trackRef.current
    if (!track) return

    const animation = track.animate(
      [
        { transform: "translate3d(0, 0, 0)" },
        { transform: "translate3d(-50%, 0, 0)" }
      ],
      {
        duration: 300000,
        iterations: Infinity,
        easing: "linear",
        direction: "reverse"
      }
    )
    animation.playbackRate = 0
    animationRef.current = animation

    const easeRate = () => {
      if (!animationRef.current) return
      const current = animationRef.current.playbackRate
      const target = targetRateRef.current
      const diff = target - current

      if (Math.abs(diff) > 0.01) {
        animationRef.current.playbackRate = current + diff * 0.08
        rafRef.current = requestAnimationFrame(easeRate)
      } else {
        animationRef.current.playbackRate = target
      }
    }
    easePlaybackRateRef.current = easeRate

    const observer = new MutationObserver(() => {
      const isPaused = document.body.classList.contains('cart-modal-open') || 
                       document.body.classList.contains('search-open')
      targetRateRef.current = isPaused ? 0 : 1
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      rafRef.current = requestAnimationFrame(easeRate)
    })

    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] })

    targetRateRef.current = 1
    rafRef.current = requestAnimationFrame(easeRate)

    return () => {
      animation.cancel()
      observer.disconnect()
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [isCheckout])

  const handleMouseEnter = () => {
    targetRateRef.current = 0
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(easePlaybackRateRef.current)
  }

  const handleMouseLeave = () => {
    targetRateRef.current = 1
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(easePlaybackRateRef.current)
  }

  const content = (
     <>
      <span style={{ padding: '0 2rem' }}>RECORD SHOP MUSIC SPOT</span>
      <span style={{ padding: '0 2rem' }}>87 WALKER ST BASEMENT NEW YORK</span>
      <span className="yellow" style={{ padding: '0 2rem' }}>OPEN TODAY 2:00 ~ 8:00 PM</span>
    </>
  )

  if (isCheckout) {
    return null
  }

  return (
    <a 
      href="https://maps.app.goo.gl/MWrAVZfViKpHorc29"
      className="marquee-banner"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      target="_blank"
    >
      <div className="marquee-track" ref={trackRef}>
        <div className="marquee-item">
          {content}{content}{content}{content}{content}
          {content}{content}{content}{content}{content}
        </div>
        <div className="marquee-item" aria-hidden="true">
          {content}{content}{content}{content}{content}
          {content}{content}{content}{content}{content}
        </div>
      </div>
    </a>
  )
}