//src/modules/layout/components/header/main-menu.tsx

"use client"
import { useEffect, useState } from 'react'
import ActiveLink from './active-link'
import { useSearch } from './search-provider'
import { useScrollHeader } from './scroll-header-provider'

export default function MainMenu() {
  const { isSearchVisible, closeSearch } = useSearch()
  const { shouldFade } = useScrollHeader()
  const [isHidden, setIsHidden] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)

  useEffect(() => {
    if (isSearchVisible) {
      setIsTransitioning(true)
      const timer = setTimeout(() => setIsHidden(true), 150)
      return () => clearTimeout(timer)
    } else {
      setIsHidden(false)
      if (isHidden) {
        setIsTransitioning(true)
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setIsTransitioning(false)
          })
        })
      }
    }
    return undefined
  }, [isSearchVisible, isHidden])

  const handleLinkClick = () => {
    closeSearch()
  }

  if (isHidden) {
    return null
  }

  const baseOpacity = isTransitioning ? 0 : 1
  const finalOpacity = shouldFade ? 0.25 : baseOpacity
  const finalBlur = shouldFade ? 4 : (isTransitioning ? 8 : 0)

  return (
    <div
      className="main-menu hidden sm:flex justify-center items-center menu-link header-section pr-0 pe-0"
      style={{
        opacity: finalOpacity,
        filter: `blur(${finalBlur}px)`,
        transition: 'opacity 0.3s ease, filter 0.3s ease',
      }}
    >
      <ul className="flex justify-start items-center w-full m-auto p-0 list-none">
        <li className="menu-item inline-flex items-center header-item">
          <ActiveLink href="/shop/new" className="outline" onClick={handleLinkClick}>
            Shop
          </ActiveLink>
        </li>
        <li className="menu-item inline-flex items-center header-item">
          <ActiveLink href="/mixes" className="outline" onClick={handleLinkClick}>
            Mixes
          </ActiveLink>
        </li>
        <li className="menu-item inline-flex items-center header-item">
          <ActiveLink href="/info" className="outline" onClick={handleLinkClick}>
            Info
          </ActiveLink>
        </li>
      </ul>
    </div>
  )
}