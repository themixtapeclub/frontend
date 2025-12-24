// src/modules/layout/components/header/sticky-logotype.tsx
"use client"
import { useEffect, useRef, useCallback } from 'react'
import ActiveLink from './active-link'

const HOVER_TIMEOUT_KEY = '__siteHeaderHoverTimeout'
const OFFSET = 36.8

interface StickyLogotypeProps {
  siteName: string
}

export default function StickyLogotype({ siteName }: StickyLogotypeProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const innerRef = useRef<HTMLDivElement>(null)

  const handleMouseEnter = useCallback(() => {
    const win = window as any
    if (win[HOVER_TIMEOUT_KEY]) {
      clearTimeout(win[HOVER_TIMEOUT_KEY])
      win[HOVER_TIMEOUT_KEY] = null
    }
    document.dispatchEvent(new CustomEvent('sitename:hover:enter'))
  }, [])

  const handleMouseLeave = useCallback(() => {
    const win = window as any
    win[HOVER_TIMEOUT_KEY] = setTimeout(() => {
      document.dispatchEvent(new CustomEvent('sitename:hover:leave'))
      win[HOVER_TIMEOUT_KEY] = null
    }, 50)
  }, [])

  useEffect(() => {
    const inner = innerRef.current
    if (!inner) return

    const getMarqueeHeight = () => {
      const marquee = document.querySelector('.marquee-banner')
      if (!marquee) return 0
      return marquee.getBoundingClientRect().height
    }

    const updatePosition = () => {
      const marqueeHeight = getMarqueeHeight()
      const scrollY = window.scrollY
      const adjustedScroll = Math.max(0, scrollY - marqueeHeight)
      const offset = Math.max(0, OFFSET - adjustedScroll)
      inner.style.transform = `translateY(${offset}px)`
    }

    updatePosition()
    window.addEventListener('scroll', updatePosition, { passive: true })

    return () => {
      window.removeEventListener('scroll', updatePosition)
      const win = window as any
      if (win[HOVER_TIMEOUT_KEY]) {
        clearTimeout(win[HOVER_TIMEOUT_KEY])
      }
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className="logotype flex-none header-section"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
        <div ref={innerRef} className="logotype-inner" style={{ transform: `translateY(${OFFSET}px)` }}>
        <ActiveLink href="/" className="menu-link outline" exact>
          {siteName || 'The Mixtape Club'}
        </ActiveLink>
      </div>
    </div>
  )
}