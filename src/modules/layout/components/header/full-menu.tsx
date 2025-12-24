// src/modules/layout/components/header/full-menu.tsx
"use client"

import { HttpTypes } from "@medusajs/types"
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useRef, useState, useCallback } from 'react'
import { useMainMenu } from './main-menu-provider'

interface FullMenuProps {
  regions: HttpTypes.StoreRegion[]
}

const borderB = { borderBottom: "1px solid #000" }
const borderTB = { borderTop: "1px solid #000", borderBottom: "1px solid #000" }
const borderBR = { borderBottom: "1px solid #000", borderRight: "1px solid #000" }

export default function FullMenu({ regions }: FullMenuProps) {
  const { isOpen, closeMenu } = useMainMenu()
  const [contentHeight, setContentHeight] = useState(0)
  const [searchValue, setSearchValue] = useState("")
  const menuRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const pathname = usePathname()
  const router = useRouter()
  const prevPathRef = useRef(pathname)
  const scrollYRef = useRef(0)

  useEffect(() => {
    if (menuRef.current) {
      const fullHeight = menuRef.current.scrollHeight
      setContentHeight(fullHeight)
    }
  }, [])

  useEffect(() => {
    if (prevPathRef.current !== pathname) {
      if (isOpen) {
        closeMenu()
        setSearchValue("")
      }
      window.scrollTo(0, 0)
    }
    prevPathRef.current = pathname
  }, [pathname, isOpen, closeMenu])

  useEffect(() => {
    if (isOpen) {
      scrollYRef.current = window.scrollY
      document.body.classList.add('menu-open')
    } else {
      document.body.classList.remove('menu-open')
    }
  }, [isOpen])

  const handleScrollClose = useCallback(() => {
    if (isOpen) {
      closeMenu()
      setSearchValue("")
    }
  }, [isOpen, closeMenu])

  useEffect(() => {
    if (!isOpen) return

    const menuElement = menuRef.current
    if (!menuElement) return

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (!entry.isIntersecting && entry.boundingClientRect.bottom < 0) {
          handleScrollClose()
        }
      },
      {
        root: null,
        threshold: 0,
        rootMargin: '0px'
      }
    )

    observer.observe(menuElement)

    return () => {
      observer.disconnect()
    }
  }, [isOpen, handleScrollClose])

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        closeMenu()
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [closeMenu])

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 300)
    }
    if (!isOpen) {
      setSearchValue("")
    }
  }, [isOpen])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        closeMenu()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, closeMenu])

  function handleSearchSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const value = searchValue.trim()
    if (value) {
      closeMenu()
      setSearchValue("")
      router.push(`/search?q=${encodeURIComponent(value)}`)
    }
  }

  function handleLinkClick(e: React.MouseEvent<HTMLAnchorElement>, href: string) {
    e.preventDefault()
    closeMenu()
    setSearchValue("")
    router.push(href, { scroll: true })
  }

  return (
    <div
      ref={menuRef}
      id="menu-full"
      className="w-full justify-center relative z-40 m-0 p-0 text-center full-menu-panel"
      style={{
        maxHeight: isOpen ? `${Math.max(contentHeight, 1200)}px` : '0px',
        opacity: isOpen ? 1 : 0,
        visibility: isOpen ? 'visible' : 'hidden',
        overflowY: isOpen ? 'auto' : 'hidden'
      }}
    >

            <div className="h-[2.85rem]" />

      <div className="menu-link full-menu-list bg-white" style={{ borderTop: "1px solid #000" }}>
        <div className="full-menu-item" style={borderB}>
          <form onSubmit={handleSearchSubmit} className="w-full">
            <input
              ref={searchInputRef}
              type="text"
              name="search"
              placeholder="Search..."
              autoComplete="off"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="w-full bg-white text-2xl py-2 px-4 border-0 outline-none text-left"
            />
          </form>
        </div>

        <div className="full-menu-item" style={borderTB}>
          <a href="/shop" onClick={(e) => handleLinkClick(e, "/shop")} className="block p-0 text-2xl outline">Shop</a>
        </div>
        <div className="full-menu-item" style={borderB}>
          <a href="/shop/new" onClick={(e) => handleLinkClick(e, "/shop/new")} className="block p-0 text-2xl">New</a>
        </div>
        <ul className="full-menu-grid m-0 p-0 list-none">
          <li style={borderBR}><a href="/shop/genre/house" onClick={(e) => handleLinkClick(e, "/shop/genre/house")} className="block p-0 text-2xl">House</a></li>
          <li style={borderB}><a href="/shop/genre/jazz" onClick={(e) => handleLinkClick(e, "/shop/genre/jazz")} className="block p-0 text-2xl">Jazz</a></li>
          <li style={borderBR}><a href="/shop/genre/ambient" onClick={(e) => handleLinkClick(e, "/shop/genre/ambient")} className="block p-0 text-2xl">Ambient</a></li>
          <li style={borderB}><a href="/shop/genre/disco" onClick={(e) => handleLinkClick(e, "/shop/genre/disco")} className="block p-0 text-2xl">Disco</a></li>
          <li style={borderBR}><a href="/shop/genre/electronic" onClick={(e) => handleLinkClick(e, "/shop/genre/electronic")} className="block p-0 text-2xl">Electronic</a></li>
          <li style={borderB}><a href="/shop/genre/brazil" onClick={(e) => handleLinkClick(e, "/shop/genre/brazil")} className="block p-0 text-2xl">Brazil</a></li>
          <li style={borderBR}><a href="/shop/genre/africa" onClick={(e) => handleLinkClick(e, "/shop/genre/africa")} className="block p-0 text-2xl">Africa</a></li>
          <li style={borderB}><a href="/shop/genre/techno" onClick={(e) => handleLinkClick(e, "/shop/genre/techno")} className="block p-0 text-2xl">Techno</a></li>
          <li style={borderBR}><a href="/shop/genre/asia" onClick={(e) => handleLinkClick(e, "/shop/genre/asia")} className="block p-0 text-2xl">Asia</a></li>
          <li style={borderB}><a href="/shop/genre/world" onClick={(e) => handleLinkClick(e, "/shop/genre/world")} className="block p-0 text-2xl">World</a></li>
          <li style={borderBR}><a href="/shop/genre/downtempo" onClick={(e) => handleLinkClick(e, "/shop/genre/downtempo")} className="block p-0 text-2xl">Downtempo</a></li>
          <li style={borderB}><a href="/shop/genre/gospel" onClick={(e) => handleLinkClick(e, "/shop/genre/gospel")} className="block p-0 text-2xl">Gospel</a></li>
          <li style={borderBR}><a href="/shop/genre/library" onClick={(e) => handleLinkClick(e, "/shop/genre/library")} className="block p-0 text-2xl">Library</a></li>
          <li style={borderB}><a href="/shop/genre/hip-hop" onClick={(e) => handleLinkClick(e, "/shop/genre/hip-hop")} className="block p-0 text-2xl">Hip-Hop</a></li>
          <li style={borderBR}><a href="/shop/genre/rock" onClick={(e) => handleLinkClick(e, "/shop/genre/rock")} className="block p-0 text-2xl">Rock</a></li>
          <li style={borderB}><a href="/shop/genre/experimental" onClick={(e) => handleLinkClick(e, "/shop/genre/experimental")} className="block p-0 text-2xl">Experimental</a></li>
        </ul>

        <div className="full-menu-item" style={borderTB}>
          <a href="/mixes" onClick={(e) => handleLinkClick(e, "/mixes")} className="block p-0 text-2xl outline">Mixes</a>
        </div>
        <div className="full-menu-item" style={borderB}>
          <a href="/mixes" onClick={(e) => handleLinkClick(e, "/mixes")} className="block p-0 text-2xl">Recent</a>
        </div>
        <div className="full-menu-item" style={borderB}>
          <a href="/shop/featured" onClick={(e) => handleLinkClick(e, "/shop/featured")} className="block p-0 text-2xl">Featured</a>
        </div>
        <ul className="full-menu-grid m-0 p-0 list-none">
          <li style={borderBR}><a href="/mixes/groovy" onClick={(e) => handleLinkClick(e, "/mixes/groovy")} className="block p-0 text-2xl">Groovy</a></li>
          <li style={borderB}><a href="/mixes/chill" onClick={(e) => handleLinkClick(e, "/mixes/chill")} className="block p-0 text-2xl">Chill</a></li>
          <li style={borderBR}><a href="/mixes/global" onClick={(e) => handleLinkClick(e, "/mixes/global")} className="block p-0 text-2xl">Global</a></li>
          <li style={borderB}><a href="/mixes/healing" onClick={(e) => handleLinkClick(e, "/mixes/healing")} className="block p-0 text-2xl">Healing</a></li>
          <li style={borderBR}><a href="/mixes/dance" onClick={(e) => handleLinkClick(e, "/mixes/dance")} className="block p-0 text-2xl">Dance</a></li>
          <li style={borderB}><a href="/mixes/nostalgia" onClick={(e) => handleLinkClick(e, "/mixes/nostalgia")} className="block p-0 text-2xl">Nostalgia</a></li>
        </ul>

        <div className="full-menu-item" style={borderTB}>
          <a href="/info" onClick={(e) => handleLinkClick(e, "/info")} className="block p-0 text-2xl outline">Info</a>
        </div>
        <div className="full-menu-item" style={borderB}>
          <a href="/info" onClick={(e) => handleLinkClick(e, "/info")} className="block p-0 text-2xl">About</a>
        </div>
        <div className="full-menu-item" style={borderB}>
          <a target="_blank" href="https://instagram.com/themixtapeclub" className="block p-0 text-2xl" rel="noopener noreferrer">Instagram</a>
        </div>

        <div className="full-menu-item" style={borderTB}>
          <a href="/account" onClick={(e) => handleLinkClick(e, "/account")} className="block p-0 text-2xl outline">Account</a>
        </div>
        <div className="full-menu-item" style={borderB}>
          <a href="/cart" onClick={(e) => handleLinkClick(e, "/cart")} className="block p-0 text-2xl">Cart</a>
        </div>
      </div>
    </div>
  )
}