// src/modules/layout/components/header/main-menu-button.tsx

"use client"

import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/solid'
import { useMainMenu } from './main-menu-provider'
import { useSearch } from './search-provider'

export default function MainMenuButton() {
  const { isOpen, openMenu, closeMenu } = useMainMenu()
  const { closeSearch } = useSearch()

  const handleClick = () => {
    if (isOpen) {
      closeMenu()
    } else {
      closeSearch()

      const html = document.documentElement
      const body = document.body

      const originalHtmlScrollBehavior = html.style.scrollBehavior
      const originalBodyScrollBehavior = body.style.scrollBehavior

      html.style.scrollBehavior = 'auto'
      body.style.scrollBehavior = 'auto'

      const scrollToTop = () => {
        html.scrollTop = 0
        body.scrollTop = 0
        window.scrollTo(0, 0)
        window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
      }

      scrollToTop()
      setTimeout(scrollToTop, 0)
      setTimeout(scrollToTop, 10)

      setTimeout(() => {
        openMenu()
      }, 20)

      setTimeout(() => {
        html.style.scrollBehavior = originalHtmlScrollBehavior
        body.style.scrollBehavior = originalBodyScrollBehavior
      }, 50)
    }
  }

  return (
    <button
      onClick={handleClick}
      className="outline outline-menu-button"
      aria-label={isOpen ? 'Close main menu' : 'Open main menu'}
    >
      {isOpen ? (
        <XMarkIcon className="outline-icon h-4 w-4" />
      ) : (
        <Bars3Icon className="outline-icon h-4 w-4" />
      )}
    </button>
  )
}
