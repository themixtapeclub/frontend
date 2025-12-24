// frontend/src/modules/layout/components/header/header-client.tsx
"use client"

import { ReactNode, useMemo, useCallback } from 'react'
import { HttpTypes } from "@medusajs/types"
import { MainMenuProvider } from './main-menu-provider'
import { ScrollHeaderProvider, useScrollHeader } from './scroll-header-provider'
import { PromoBannerProvider } from './promo-banner-context'
import StickyLogotype from './sticky-logotype'
import MainMenu from './main-menu'
import PromoBanner from './promo-banner'
import NowPlayingBanner from './now-playing-banner'
import MarqueeBanner from './marquee-banner'
import Tools from './tools'
import SearchInput from './search-input'
import FullMenu from './full-menu'
import { useSearch } from './search-provider'

interface HeaderClientProps {
  children: ReactNode
  regions: HttpTypes.StoreRegion[]
  customer: HttpTypes.StoreCustomer | null
}

function HeaderNav({ children, regions, customer }: HeaderClientProps) {
  const { isSearchVisible, closeSearch } = useSearch()
  const { setHeaderHovered } = useScrollHeader()

  const handleMouseEnter = useCallback(() => {
    setHeaderHovered(true)
  }, [setHeaderHovered])

  const handleMouseLeave = useCallback(() => {
    setHeaderHovered(false)
  }, [setHeaderHovered])

  const mainMenuElement = useMemo(() => <MainMenu />, [])
  const searchInputElement = useMemo(() => (
    <SearchInput onSubmit={closeSearch} />
  ), [closeSearch])

  return (
    <>
      <div className="relative z-50 bg-black overflow-hidden">
        <MarqueeBanner />
      </div>
      <header 
        className="sticky top-0 z-50"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <PromoBanner />
        <NowPlayingBanner />
        <nav className="w-full relative z-30 m-0 header-nav">
          <div className="flex items-center">
            <StickyLogotype siteName="The Mixtape Club" />
            
            <div style={{ display: isSearchVisible ? 'none' : 'contents' }}>
              {mainMenuElement}
            </div>
            
            <div className="flex-1 header-spacer">
              {isSearchVisible && searchInputElement}
            </div>
            
            <Tools cartComponent={children} customer={customer} />
          </div>
        </nav>
      </header>
      <FullMenu regions={regions} />
    </>
  )
}

export default function HeaderClient({ children, regions, customer }: HeaderClientProps) {
  return (
    <ScrollHeaderProvider>
      <MainMenuProvider>
        <PromoBannerProvider>
          <HeaderNav regions={regions} customer={customer}>{children}</HeaderNav>
        </PromoBannerProvider>
      </MainMenuProvider>
    </ScrollHeaderProvider>
  )
}