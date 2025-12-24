// src/app/(main)/mixtape/[slug]/hero-client.tsx
"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect } from "react"
import NoiseOverlay from "@modules/common/components/noise-overlay"
import MixtapePlayButton from "@modules/common/components/play-button"
import { setActivePage, getState, usePersistentPlayerState } from "@modules/mixcloud/components/mixcloud-player/persistent-player"

interface Contributor {
  name: string
  slug?: string
  location?: string | null
  image_url?: string | null
}

interface MixtapeHeroClientProps {
  mixtape: {
    title: string
    slug: string
    featured_image_url?: string | null
    featured_image_alt?: string
    mixcloud_url?: string
  }
  contributors: Contributor[]
}

function extractFeed(url: string): string {
  try {
    const path = new URL(url).pathname
    return path.endsWith("/") ? path : path + "/"
  } catch {
    const p = url.startsWith("/") ? url : "/" + url
    return p.endsWith("/") ? p : p + "/"
  }
}

export default function MixtapeHeroClient({ mixtape, contributors }: MixtapeHeroClientProps) {
  const url = mixtape.featured_image_url
  const alt = mixtape.featured_image_alt || mixtape.title
  const localUrl = "/mixtape/" + mixtape.slug
  
  const { currentFeed, isVisible } = usePersistentPlayerState()
  const thisFeed = mixtape.mixcloud_url ? extractFeed(mixtape.mixcloud_url) : null
  const isThisMixActive = thisFeed && currentFeed === thisFeed && isVisible
  
  useEffect(() => {
    if (mixtape.mixcloud_url) {
      setActivePage(mixtape.mixcloud_url)
      
      const current = getState()
      const alreadyThisMix = current.currentFeed === thisFeed
      
      if (!alreadyThisMix && !current.isPlaying) {
        ;(window as any).__autoLoadPersistentMix?.(mixtape.mixcloud_url, { 
          localUrl, 
          imageUrl: url || undefined 
        })
      } else if (alreadyThisMix && !current.isVisible) {
        ;(window as any).__showPersistentPlayer?.()
      } else if (!current.currentFeed) {
        ;(window as any).__autoLoadPersistentMix?.(mixtape.mixcloud_url, { 
          localUrl, 
          imageUrl: url || undefined 
        })
      }
    }
    return () => {
      setActivePage(null)
      const s = getState()
      if (!s.wasManuallyLoaded && !s.isPlaying) {
        ;(window as any).__autoHidePersistentPlayer?.()
      }
    }
  }, [mixtape.mixcloud_url, thisFeed, localUrl, url])
  
  const showLines = contributors.length > 0
  const lineStyle = "border-t border-white/20 mix-blend-overlay"
  
  return (
    <div 
      className="relative z-10 overflow-hidden"
      style={{ marginTop: "-3.3rem" }}
    >
      <div className="absolute inset-0 z-[1] bg-black">
        {url && (
          <div 
            className="absolute inset-0 opacity-25"
            style={{
              backgroundImage: `url(${url})`,
              backgroundRepeat: "repeat",
              backgroundSize: "50%",
              backgroundPosition: "center",
              filter: "blur(40px)",
            }}
          />
        )}
        <NoiseOverlay />
      </div>
      
      <div className="relative z-[2]">
        <div className="flex justify-center p-0">
          <div 
            className="relative flex items-center justify-center"
            style={{ 
              width: "400px", 
              height: "400px", 
              marginTop: "6.6rem", 
              marginBottom: "2.75rem" 
            }}
          >
            {url ? (
              <Image
                src={url}
                alt={alt}
                width={400}
                height={400}
                priority
                className="object-contain"
                style={{
                  minHeight: "400px",
                  minWidth: "400px",
                  maxHeight: "100%",
                  maxWidth: "100%",
                  width: "auto",
                  height: "auto"
                }}
              />
            ) : (
              <div className="w-[400px] h-[400px] bg-gray-800 flex items-center justify-center">
                <span>No image</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="w-full">
          <div className="px-4 py-3 flex items-center justify-between gap-4">
            <h1 className="page-title yellow outline p-0 font-bold leading-tight truncate">
              {mixtape.title}
            </h1>
            
            {mixtape.mixcloud_url && !isThisMixActive && (
              <div className="flex-shrink-0">
                <MixtapePlayButton
                  mixcloudUrl={mixtape.mixcloud_url}
                  localUrl={localUrl}
                  imageUrl={url || undefined}
                />
              </div>
            )}
          </div>
        </div>
        
        {contributors.length > 0 && (
          <div className={`w-full ${lineStyle}`}>
            <div className="px-4 py-3">
              <div className="flex items-center gap-4">
                <div className="flex -space-x-4 flex-shrink-0">
                  {contributors.map((contributor, index) => {
                    const contributorUrl = contributor.slug ? "/contributor/" + contributor.slug : null
                    const avatar = contributor.image_url ? (
                      <Image
                        src={contributor.image_url}
                        alt={contributor.name}
                        width={48}
                        height={48}
                        className="object-cover w-12 h-12 rounded-full"
                      />
                    ) : (
                      <div 
                        className="w-12 h-12 rounded-full mix-blend-screen"
                        style={{
                          background: "radial-gradient(circle at 50% 50%, #333 0%, #000 60%, #000 100%)"
                        }}
                      />
                    )
                    
                    const shouldLink = contributorUrl && contributor.image_url
                    
                    return shouldLink ? (
                      <Link key={contributor.slug || index} href={contributorUrl} className="relative" style={{ zIndex: contributors.length - index }}>
                        {avatar}
                      </Link>
                    ) : (
                      <div key={contributor.slug || index} className="relative" style={{ zIndex: contributors.length - index }}>
                        {avatar}
                      </div>
                    )
                  })}
                </div>
                
                <div className="flex-grow min-w-0">
                  <div className="text-white font-medium">
                    {contributors.map((contributor, index) => {
                      const contributorUrl = contributor.slug ? "/contributor/" + contributor.slug : null
                      const isLast = index === contributors.length - 1
                      const separator = isLast ? "" : (index === contributors.length - 2 ? " & " : ", ")
                      
                      return (
                        <span key={contributor.slug || index}>
                          {contributorUrl ? (
                            <Link href={contributorUrl} className="hover:underline">
                              {contributor.name}
                            </Link>
                          ) : (
                            <span>{contributor.name}</span>
                          )}
                          {separator}
                        </span>
                      )
                    })}
                  </div>
                  {contributors.length === 1 && contributors[0].location && (
                    <div className="text-gray-400 text-sm">
                      {contributors[0].location}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}