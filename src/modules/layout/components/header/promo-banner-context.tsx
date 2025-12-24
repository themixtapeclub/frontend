// frontend/src/modules/layout/components/header/promo-banner-context.tsx
"use client"

import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from "react"

interface PromoBannerContextType {
  isVisible: boolean
  message: string
  linkUrl: string | null
  linkText: string | null
  showBanner: (message: string, linkUrl?: string, linkText?: string) => void
  hideBanner: () => void
  bannerHeight: number
}

const PromoBannerContext = createContext<PromoBannerContextType>({
  isVisible: false,
  message: "",
  linkUrl: null,
  linkText: null,
  showBanner: () => {},
  hideBanner: () => {},
  bannerHeight: 0,
})

export const PROMO_BANNER_HEIGHT = 36
export const HEADER_NAV_HEIGHT = 44

function checkDiscogsSource(): boolean {
  if (typeof window === "undefined") return false
  
  const referrer = document.referrer
  const isFromDiscogs = referrer.includes("discogs.com")
  
  const urlParams = new URLSearchParams(window.location.search)
  const hasDiscogsRef = urlParams.get("ref") === "discogs"
  
  return isFromDiscogs || hasDiscogsRef
}

export function PromoBannerProvider({ children }: { children: ReactNode }) {
  const [isVisible, setIsVisible] = useState(false)
  const [message, setMessage] = useState("Prices are cheaper here than Discogs - buy direct and save")
  const [linkUrl, setLinkUrl] = useState<string | null>(null)
  const [linkText, setLinkText] = useState<string | null>(null)

  useEffect(() => {
    const shouldShow = checkDiscogsSource()
    setIsVisible(shouldShow)
  }, [])

  useEffect(() => {
    const bannerHeight = isVisible ? PROMO_BANNER_HEIGHT : 0
    document.documentElement.style.setProperty('--promo-banner-height', bannerHeight + 'px')
    document.documentElement.style.setProperty('--header-height', HEADER_NAV_HEIGHT + 'px')
    document.documentElement.style.setProperty('--total-header-height', (HEADER_NAV_HEIGHT + bannerHeight) + 'px')
  }, [isVisible])

  const showBanner = useCallback((msg: string, url?: string, text?: string) => {
    setMessage(msg)
    setLinkUrl(url || null)
    setLinkText(text || null)
    setIsVisible(true)
  }, [])

  const hideBanner = useCallback(() => {
    setIsVisible(false)
  }, [])

  return (
    <PromoBannerContext.Provider value={{
      isVisible,
      message,
      linkUrl,
      linkText,
      showBanner,
      hideBanner,
      bannerHeight: isVisible ? PROMO_BANNER_HEIGHT : 0,
    }}>
      {children}
    </PromoBannerContext.Provider>
  )
}

export function usePromoBanner(): PromoBannerContextType {
  return useContext(PromoBannerContext)
}