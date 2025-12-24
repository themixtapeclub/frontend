// src/modules/layout/components/header/tools.tsx
"use client"
import { ReactNode, useEffect, useState } from 'react'
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import MainMenuButton from './main-menu-button'
import { useMainMenu } from './main-menu-provider'
import { useSearch } from './search-provider'
import { useScrollHeader } from './scroll-header-provider'
import SearchToggle from './search-toggle'

interface ToolsProps {
  cartComponent: ReactNode
  customer: HttpTypes.StoreCustomer | null
}

export default function Tools({ cartComponent, customer: initialCustomer }: ToolsProps) {
  const { isSearchVisible, toggleSearch } = useSearch()
  const { isOpen: isMainMenuOpen } = useMainMenu()
  const { shouldFade } = useScrollHeader()
  const [mounted, setMounted] = useState(false)
  const [customer, setCustomer] = useState<HttpTypes.StoreCustomer | null>(initialCustomer)

  useEffect(() => {
    setMounted(true)
    fetch('/api/customer')
      .then(res => res.json())
      .then(data => setCustomer(data.customer))
      .catch(() => {})
  }, [])

  const fadeStyle = {
    opacity: shouldFade ? 0.25 : 1,
    filter: shouldFade ? 'blur(4px)' : 'blur(0px)',
    transition: 'opacity 0.3s ease, filter 0.3s ease',
  }

  return (
    <div className="tools menu-link flex items-center justify-end flex-none header-section">
      <ul className="flex justify-end list-none m-0 p-0">
        {!isMainMenuOpen && (
          <li className="inline-flex items-center" style={fadeStyle}>
            {mounted && <SearchToggle isVisible={isSearchVisible} onToggle={toggleSearch} />}
          </li>
        )}
        {cartComponent}
        <li className="inline-flex items-center header-item-right" style={fadeStyle}>
          <LocalizedClientLink href="/account" className="outline mono">
            {customer ? "Account" : "Login"}
          </LocalizedClientLink>
        </li>
        <li className="inline-flex items-center header-item-right">
          <MainMenuButton />
        </li>
      </ul>
    </div>
  )
}