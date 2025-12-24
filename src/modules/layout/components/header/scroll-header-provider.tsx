"use client"
import { createContext, useContext, useEffect, useState, useRef, ReactNode } from 'react'

interface ScrollHeaderContextType {
  shouldFade: boolean
  setHeaderHovered: (hovered: boolean) => void
}

const ScrollHeaderContext = createContext<ScrollHeaderContextType>({
  shouldFade: false,
  setHeaderHovered: () => {},
})

export function useScrollHeader() {
  return useContext(ScrollHeaderContext)
}

interface ScrollHeaderProviderProps {
  children: ReactNode
}

export function ScrollHeaderProvider({ children }: ScrollHeaderProviderProps) {
  const [shouldFade, setShouldFade] = useState(false)
  const [isHeaderHovered, setIsHeaderHovered] = useState(false)
  const lastScrollY = useRef(0)

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      const threshold = window.innerHeight
      const scrollingDown = currentScrollY > lastScrollY.current
      lastScrollY.current = currentScrollY

      if (currentScrollY > threshold && scrollingDown) {
        setShouldFade(true)
      } else if (!scrollingDown || currentScrollY <= threshold) {
        setShouldFade(false)
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <ScrollHeaderContext.Provider value={{ shouldFade: shouldFade && !isHeaderHovered, setHeaderHovered: setIsHeaderHovered }}>
      {children}
    </ScrollHeaderContext.Provider>
  )
}