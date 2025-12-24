// src/modules/layout/components/header/submenu.tsx
"use client"

import { usePathname } from 'next/navigation'
import Link from 'next/link'

const genres = [
  { name: 'New', slug: 'new', href: '/shop/new' },
  { name: 'Featured', slug: 'featured', href: '/shop/featured' },
  { name: 'Disco', slug: 'disco' },
  { name: 'House', slug: 'house' },
  { name: 'Jazz', slug: 'jazz' },
  { name: 'Soul/Funk', slug: 'soul' },
  { name: 'Ambient', slug: 'ambient' },
  { name: 'Brazil', slug: 'brazil' },
  { name: 'Africa', slug: 'africa' },
  { name: 'Asia', slug: 'asia' },
  { name: 'Latin', slug: 'latin' },
  { name: 'Reggae', slug: 'reggae' },
  { name: 'World', slug: 'world' },
  { name: 'Gospel', slug: 'gospel' },
  { name: 'Electronic', slug: 'electronic' },
  { name: 'Techno', slug: 'techno' },
  { name: 'Experimental', slug: 'experimental' },
  { name: 'Library', slug: 'library' },
  { name: 'Downtempo', slug: 'downtempo' },
  { name: 'Edits', slug: 'edits' },
  { name: 'Hip-Hop', slug: 'hip-hop' },
  { name: 'Rock', slug: 'rock' },
  { name: 'Coming Soon', slug: 'coming-soon', href: '/shop/coming-soon' },
]

const formats = [
  { name: '7"', slug: '7' },
  { name: '12"', slug: '12' },
  { name: 'LP', slug: 'lp' },
  { name: 'Compilation', slug: 'compilation' },
  { name: 'Cassette', slug: 'cassette' },
  { name: 'CD', slug: 'cd' },
  { name: 'Publication', slug: 'publication' },
  { name: 'Merchandise', slug: 'merchandise' },
  { name: 'Bundle', slug: 'bundle' },
]

const mixesMoods = [
  { name: 'Favorites', slug: 'favorites', href: '/mixes' },
  { name: 'Groovy', slug: 'groovy' },
  { name: 'Chill', slug: 'chill' },
  { name: 'Global', slug: 'global' },
  { name: 'Healing', slug: 'healing' },
  { name: 'Dance', slug: 'dance' },
  { name: 'Nostalgia', slug: 'nostalgia' },
  { name: 'Record Club', slug: 'record-club' },
]

const mixesGenres = [
  { name: 'Disco', slug: 'disco' },
  { name: 'Jazz', slug: 'jazz' },
  { name: 'House', slug: 'house' },
  { name: 'Ambient', slug: 'ambient' },
  { name: 'Soul', slug: 'soul' },
  { name: 'Downtempo', slug: 'downtempo' },
  { name: 'Funk', slug: 'funk' },
  { name: 'Boogie', slug: 'boogie' },
  { name: 'World', slug: 'world' },
  { name: 'Rare Groove', slug: 'rare-groove' },
  { name: 'Folk', slug: 'folk' },
]

export default function Submenu() {
  const pathname = usePathname()
  
  const isShopPage = pathname?.startsWith('/shop')
  const isMixesPage = pathname?.startsWith('/mixes')

  if (!isShopPage && !isMixesPage) return null

  if (isMixesPage) {
    return (
      <div className="page-nav submenu hidden md:block w-full z-30">
        <div className="mood relative">
          <div className="flex justify-center items-center px-4">
            <ul className="flex justify-center flex-wrap p-0 list-none">
              {mixesMoods.map((mood) => {
                const href = mood.href || `/mixes/${mood.slug}`
                const isActive = mood.href 
                  ? pathname === '/mixes'
                  : pathname === href
                
                return (
                  <li key={mood.slug} className="menu-item whitespace-nowrap">
                    <Link 
                      href={href}
                      className={`menu-link mx-1 px-2 ${isActive ? 'bold' : ''}`}
                    >
                      {mood.name}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        </div>

        <div className="genre relative">
          <div className="flex justify-center items-center px-4">
            <ul className="flex justify-center flex-wrap p-0 list-none">
              {mixesGenres.map((genre) => {
                const href = `/mixes/${genre.slug}`
                const isActive = pathname === href
                
                return (
                  <li key={genre.slug} className="menu-item small whitespace-nowrap">
                    <Link 
                      href={href}
                      className={`menu-link mx-1 px-2 ${isActive ? 'bold' : ''}`}
                    >
                      {genre.name}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="page-nav submenu hidden md:block w-full z-30">
      <div className="genre relative">
        <div className="flex justify-center items-center px-4">
          <ul className="flex justify-center flex-wrap p-0 list-none">
            {genres.map((genre) => {
              const href = genre.href || `/shop/genre/${genre.slug}`
              const isActive = pathname === href || 
                pathname === `/shop/genre/${genre.slug}`
              
              return (
                <li key={genre.slug} className="menu-item whitespace-nowrap">
                  <Link 
                    href={href}
                    className={`menu-link mx-1 px-2 ${isActive ? 'bold' : ''}`}
                  >
                    {genre.name}
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      </div>

      <div className="format relative">
        <div className="flex justify-center items-center px-4">
          <ul className="flex justify-center flex-wrap p-0 list-none">
            {formats.map((format) => {
              const href = `/shop/format/${format.slug}`
              const isActive = pathname === href
              
              return (
                <li key={format.slug} className="menu-item small whitespace-nowrap">
                  <Link 
                    href={href}
                    className={`menu-link mx-1 px-2 ${isActive ? 'bold' : ''}`}
                  >
                    {format.name}
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    </div>
  )
}