// src/modules/layout/components/main-content/index.tsx
"use client"

import { usePathname } from "next/navigation"
import { useSearch } from "@modules/layout/components/header/search-provider"
import Submenu from "@modules/layout/components/header/submenu"

export default function MainContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "/"
  const { isSearchVisible, closeSearch } = useSearch()

  const isInfoPage = pathname.startsWith("/info")
  const isProductPage = pathname.startsWith("/product/")
  const isMixtapePage = pathname.startsWith("/mixtape/")
  const isContributorPage = pathname.startsWith("/contributor/")

  const needsFullOverlay = isInfoPage
  const needsNoPadding = isProductPage || isMixtapePage || isContributorPage

  let mainClass = "flex-1 flex flex-col"
  if (needsFullOverlay) {
    mainClass += " overlay-header"
  } else if (needsNoPadding) {
    mainClass += " no-padding-top"
  }

  const handleOverlayClick = () => {
    closeSearch()
  }

  return (
    <main className={mainClass}>
      <Submenu />
      <div className="flex-1 relative">
        {children}
      </div>
      <div
        onClick={handleOverlayClick}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 35,
          backgroundColor: isSearchVisible ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0)',
          backdropFilter: isSearchVisible ? 'blur(30px)' : 'blur(0px)',
          WebkitBackdropFilter: isSearchVisible ? 'blur(30px)' : 'blur(0px)',
          pointerEvents: isSearchVisible ? 'auto' : 'none',
          transition: 'background-color 0.3s ease, backdrop-filter 0.3s ease, -webkit-backdrop-filter 0.3s ease'
        }}
      />
    </main>
  )
}