// src/modules/layout/components/header/search-provider.tsx
"use client"

import { useRouter } from "next/navigation"
import { createContext, useContext, useState, useEffect, ReactNode } from "react"

interface SearchContextType {
  isSearchVisible: boolean
  openSearch: () => void
  closeSearch: () => void
  toggleSearch: () => void
}

const SearchContext = createContext<SearchContextType | undefined>(undefined)

export function SearchProvider({ children }: { children: ReactNode }) {
  const [isSearchVisible, setIsSearchVisible] = useState(false)
  const router = useRouter()

  const openSearch = () => setIsSearchVisible(true)
  const closeSearch = () => setIsSearchVisible(false)

  useEffect(() => {
    if (isSearchVisible) {
      document.body.classList.add("search-open")
    } else {
      document.body.classList.remove("search-open")
    }
    return () => {
      document.body.classList.remove("search-open")
    }
  }, [isSearchVisible])

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        if (!isSearchVisible && document.body.classList.contains("search-open")) {
          document.body.classList.remove("search-open")
        }
      }
    }
    document.addEventListener("visibilitychange", handleVisibilityChange)
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange)
  }, [isSearchVisible])
  const toggleSearch = () => setIsSearchVisible(prev => !prev)

  // Close search when any link is clicked anywhere on the page
  useEffect(() => {
    const handleLinkClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      const link = target.closest("a")
      
      if (link && isSearchVisible) {
        if (link.href && !link.href.startsWith("javascript:") && !link.href.startsWith("#")) {
          closeSearch()
        }
      }
    }

    // Close search when mobile menu button is clicked
    const handleMainMenuClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      const mainMenuButton =
        target.closest("[data-mobile-menu-toggle]") ||
        target.closest(".mobile-menu-button") ||
        target.closest('button[aria-label*="menu"]') ||
        target.closest('button[aria-label*="Menu"]')

      if (mainMenuButton && isSearchVisible) {
        closeSearch()
      }
    }

    // Close search on browser navigation (back/forward buttons)
    const handlePopState = () => {
      if (isSearchVisible) {
        closeSearch()
      }
    }

    document.addEventListener("click", handleLinkClick)
    document.addEventListener("click", handleMainMenuClick)
    window.addEventListener("popstate", handlePopState)

    return () => {
      document.removeEventListener("click", handleLinkClick)
      document.removeEventListener("click", handleMainMenuClick)
      window.removeEventListener("popstate", handlePopState)
    }
  }, [isSearchVisible])

  // Close search when route changes (programmatic navigation)
  useEffect(() => {
    const handleRouteChange = () => {
      if (isSearchVisible) {
        closeSearch()
      }
    }

    const originalPush = router.push
    const originalReplace = router.replace

    router.push = (...args: Parameters<typeof router.push>) => {
      handleRouteChange()
      return originalPush.apply(router, args)
    }

    router.replace = (...args: Parameters<typeof router.replace>) => {
      handleRouteChange()
      return originalReplace.apply(router, args)
    }

    return () => {
      router.push = originalPush
      router.replace = originalReplace
    }
  }, [isSearchVisible, router])

  // Close search on Escape key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isSearchVisible) {
        closeSearch()
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [isSearchVisible])

  return (
    <SearchContext.Provider value={{ isSearchVisible, openSearch, closeSearch, toggleSearch }}>
      {children}
    </SearchContext.Provider>
  )
}

export function useSearch() {
  const context = useContext(SearchContext)
  if (!context) {
    throw new Error("useSearch must be used within SearchProvider")
  }
  return context
}