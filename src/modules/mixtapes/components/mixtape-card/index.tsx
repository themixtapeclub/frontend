// src/modules/mixtapes/components/mixtape-card/index.tsx
"use client"

import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import { Mixtape, getVisibleContributors } from "@lib/data/mixtapes"
import NoiseOverlay from "@modules/common/components/noise-overlay"
import MixtapePlayButton from "@modules/common/components/play-button"

interface MixtapeCardProps {
  mixtape: Mixtape
  featured?: boolean
  index?: number
  context?: "default" | "inMixtapes"
}

const PRIORITY_TAGS = ["Groovy", "Chill", "Global", "Healing", "Dance", "Nostalgia"]

function sortTagsByPriority(tags: string[]): string[] {
  return [...tags].sort((a, b) => {
    const aIndex = PRIORITY_TAGS.findIndex(t => t.toLowerCase() === a.toLowerCase())
    const bIndex = PRIORITY_TAGS.findIndex(t => t.toLowerCase() === b.toLowerCase())
    const aPriority = aIndex === -1 ? PRIORITY_TAGS.length : aIndex
    const bPriority = bIndex === -1 ? PRIORITY_TAGS.length : bIndex
    return aPriority - bPriority
  })
}

function formatArtistsList(artists: string[]): string {
  const uniqueArtists = Array.from(new Set(artists.filter(a => a?.trim())))
  if (uniqueArtists.length === 0) return ""
  if (uniqueArtists.length === 1) return uniqueArtists[0]
  if (uniqueArtists.length === 2) return uniqueArtists.join(" & ")
  return uniqueArtists.slice(0, -1).join(", ") + " & " + uniqueArtists[uniqueArtists.length - 1]
}

function shouldShowMusicBy(
  tracklist: { artist?: string }[] | undefined,
  contributors: { name: string }[]
): boolean {
  if (!tracklist || tracklist.length === 0) return false
  
  const contributorNames = contributors.map(c => c.name.trim().toLowerCase())
  
  const uniqueArtists = Array.from(new Set(
    tracklist.map(t => t.artist?.trim().toLowerCase()).filter(Boolean)
  ))
  
  const filteredArtists = uniqueArtists.filter(artist =>
    !contributorNames.some(contrib => artist!.includes(contrib))
  )
  
  return filteredArtists.length > 0
}

function ContributorLinks({ contributors }: { contributors: { id?: string; name: string; slug?: string }[] }) {
  if (!contributors || contributors.length === 0) return null
  
  return (
    <>
      {contributors.map((c, i) => (
        <span key={c.id || i} className={i === contributors.length - 1 && i > 0 ? "whitespace-nowrap" : ""}>
          {i > 0 && (i === contributors.length - 1 ? <>&nbsp;&amp; </> : ", ")}
          {c.slug ? (
            <Link href={"/contributor/" + c.slug} className="hover:underline">
              {c.name}
            </Link>
          ) : (
            <span>{c.name}</span>
          )}
        </span>
      ))}
    </>
  )
}
export default function MixtapeCard({ 
  mixtape, 
  featured = false, 
  index = 0,
  context = "default"
}: MixtapeCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  
  const visibleContributors = getVisibleContributors(mixtape.contributors || [])
  const mixtapeUrl = "/mixtape/" + mixtape.slug
  
  const musicByArtists = mixtape.tracklist?.map(track => track.artist).filter(Boolean) || []
  const musicByString = formatArtistsList(musicByArtists as string[])
  const showMusicBy = musicByString && shouldShowMusicBy(mixtape.tracklist, visibleContributors)
  
  const isFirstSixFeatured = featured && index < 6
  
  const hasMixcloud = !!mixtape.mixcloud_url
  const showOverlay = isHovered && hasMixcloud
  
  if (isFirstSixFeatured) {
    return (
      <div 
        className="mixtape featured m-0 p-0 pb-10"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div 
          className="relative overflow-hidden lg:py-[8.33%]"
          style={{ backgroundColor: "black" }}
        >
          {mixtape.featured_image_url && (
            <div 
              className="absolute inset-0"
              style={{
                backgroundImage: `url(${mixtape.featured_image_url})`,
                backgroundSize: "120%",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
                filter: "blur(10px)",
                transform: "scale(1.1)",
              }}
            />
          )}
          
          <div 
            className="absolute inset-0 z-[1]"
            style={{ backgroundColor: "rgba(0, 0, 0, 0.7)" }}
          />
          
          <NoiseOverlay />
          
          <div className="relative z-[2] flex justify-center">
            <Link href={mixtapeUrl} className="block w-full lg:w-2/3">
              <div className="relative w-full aspect-square overflow-hidden">
                {mixtape.featured_image_url ? (
                  <Image
                    src={mixtape.featured_image_url}
                    alt={mixtape.featured_image_alt || mixtape.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 50vw, 22vw"
                    priority={index < 3}
                  />
                ) : (
                  <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                    <span>No image</span>
                  </div>
                )}
              </div>
            </Link>
            
            {hasMixcloud && (
              <div 
                className="absolute bottom-0 right-0 lg:right-[16.67%] p-3 transition-opacity duration-200 z-[3]"
                style={{
                  opacity: showOverlay ? 1 : 0,
                  pointerEvents: showOverlay ? "auto" : "none",
                }}
              >
                <MixtapePlayButton 
                  mixcloudUrl={mixtape.mixcloud_url!}
                  localUrl={mixtapeUrl}
                  imageUrl={mixtape.featured_image_url}
                />
              </div>
            )}
          </div>
        </div>
        
        <div className="card-text">
          <div className="artist-title">
            {visibleContributors.length > 0 && (
              <span className="artist">
                <ContributorLinks contributors={visibleContributors} />
                {" "}
              </span>
            )}
            <span className="title">
              <Link href={mixtapeUrl} className="hover:underline">
                {mixtape.title}
              </Link>
            </span>
          </div>
          
          {showMusicBy && (
            <p className="text-small mt-1 m-0">
              Music by {musicByString}
            </p>
          )}
          
          {mixtape.tags && mixtape.tags.length > 0 && (
            <div className="flex flex-wrap mt-2">
              {sortTagsByPriority(mixtape.tags).map((tag, i) => (
                <Link
                  key={i}
                  href={"/mixes/" + tag.toLowerCase().replace(/\s+/g, "-")}
                  className="tag-link mr-4"
                >
                  {tag}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }
  
  return (
    <div 
      className="mixtape m-0 p-0"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="bg-black relative">
        <Link href={mixtapeUrl} className="block">
          <div className="relative w-full aspect-square overflow-hidden">
            {mixtape.featured_image_url ? (
              <Image
                src={mixtape.featured_image_url}
                alt={mixtape.featured_image_alt || mixtape.title}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />
            ) : (
              <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                <span>No image</span>
              </div>
            )}
          </div>
        </Link>
        
        {hasMixcloud && (
          <div 
            className="absolute bottom-0 right-0 p-3 transition-opacity duration-200"
            style={{
              opacity: showOverlay ? 1 : 0,
              pointerEvents: showOverlay ? "auto" : "none",
            }}
          >
            <MixtapePlayButton 
              mixcloudUrl={mixtape.mixcloud_url!}
              localUrl={mixtapeUrl}
              imageUrl={mixtape.featured_image_url}
            />
          </div>
        )}
      </div>
      
      <div className="card-text">
        <div className="artist-title">
          {visibleContributors.length > 0 && (
            <span className="artist">
              <ContributorLinks contributors={visibleContributors} />
            </span>
          )}
          <span className="title">
            <Link href={mixtapeUrl} className="hover:underline">
              {mixtape.title}
            </Link>
          </span>
        </div>
        
        {mixtape.tags && mixtape.tags.length > 0 && (
          <div className="flex flex-wrap mt-2">
            {sortTagsByPriority(mixtape.tags).map((tag, i) => (
              <Link
                key={i}
                href={"/mixes/" + tag.toLowerCase().replace(/\s+/g, "-")}
                className="tag-link mr-4"
              >
                {tag}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}