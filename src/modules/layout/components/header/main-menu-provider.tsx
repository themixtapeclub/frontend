// src/modules/layout/components/header/main-menu-provider.tsx

"use client"

import { createContext, useContext, useState, ReactNode } from 'react'

interface MainMenuContextType {
  isOpen: boolean
  openMenu: () => void
  closeMenu: () => void
  toggleMenu: () => void
}

const MainMenuContext = createContext<MainMenuContextType | undefined>(undefined)

export function MainMenuProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)

  const openMenu = () => setIsOpen(true)
  const closeMenu = () => setIsOpen(false)
  const toggleMenu = () => setIsOpen(prev => !prev)

  return (
    <MainMenuContext.Provider value={{ isOpen, openMenu, closeMenu, toggleMenu }}>
      {children}
    </MainMenuContext.Provider>
  )
}

export function useMainMenu() {
  const context = useContext(MainMenuContext)
  if (!context) {
    throw new Error('useMainMenu must be used within MainMenuProvider')
  }
  return context
}
