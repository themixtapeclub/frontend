// src/modules/home/components/dynamic-sections/carousel-section.tsx
"use client"

import { useRef } from "react"
import Link from "next/link"
import InlineAudioController from "@modules/common/components/inline-audio-controller"
import { Swiper, SwiperSlide } from "swiper/react"
import { Pagination, Autoplay } from "swiper/modules"
import type { Swiper as SwiperType } from "swiper"
import "swiper/css"
import "swiper/css/pagination"

interface Slide {
  id: string
  slide_type: string
  title?: string
  subtitle?: string
  description?: string
  image_url?: string
  link_url?: string
  text_color?: string
  reference_data?: {
    id: string
    title: string
    handle: string
    thumbnail?: string
    artist?: string[]
    label?: string[]
    description?: string
    first_audio_url?: string
    tracklist?: any[]
    discogs_release_id?: string
  }
}

interface CarouselSectionProps {
  section: {
    title?: string
    slides?: Slide[]
    settings?: {
      autoplay?: boolean
      autoplay_delay?: number
    }
  }
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").trim()
}

export default function CarouselSection({ section }: CarouselSectionProps) {
  const slides = section.slides || []
  const swiperRef = useRef<SwiperType | null>(null)
  const mouseIdleTimerRef = useRef<NodeJS.Timeout | null>(null)

  const autoplay = section.settings?.autoplay ?? true
  const delay = section.settings?.autoplay_delay ?? 5000

  if (slides.length === 0) return null

  const handlePauseCarousel = () => {
    if (swiperRef.current?.autoplay) {
      swiperRef.current.autoplay.stop()
    }
    resetIdleTimer()
  }

  const resetIdleTimer = () => {
    if (mouseIdleTimerRef.current) {
      clearTimeout(mouseIdleTimerRef.current)
    }
    mouseIdleTimerRef.current = setTimeout(() => {
      if (swiperRef.current?.autoplay) {
        swiperRef.current.autoplay.start()
      }
    }, 5000)
  }

  const handleMouseEnter = () => {
    handlePauseCarousel()
  }

  const handleMouseMove = () => {
    handlePauseCarousel()
  }

  const handleMouseLeave = () => {
    if (mouseIdleTimerRef.current) {
      clearTimeout(mouseIdleTimerRef.current)
      mouseIdleTimerRef.current = null
    }
    if (swiperRef.current?.autoplay) {
      swiperRef.current.autoplay.start()
    }
  }

  return (
    <section
      className="relative w-full bg-black"
      style={{ height: '65vh', minHeight: '500px' }}
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <style jsx global>{`
        .homepage-carousel-swiper {
          width: 100%;
          height: 100%;
        }
        .homepage-carousel-swiper .swiper-slide {
          height: 100%;
        }
        .homepage-carousel-swiper .swiper-pagination {
          bottom: 16px;
          position: absolute;
          z-index: 20;
        }
        .homepage-carousel-swiper .swiper-pagination-bullet {
          width: 8px;
          height: 8px;
          background: rgba(255, 255, 255, 0.3);
          opacity: 1;
        }
        .homepage-carousel-swiper .swiper-pagination-bullet-active {
          background: white;
        }
      `}</style>
      <div className="relative h-full">
        <Swiper
          modules={[Pagination, Autoplay]}
          pagination={{ clickable: true }}
          autoplay={autoplay ? { delay, disableOnInteraction: false } : false}
          loop={slides.length > 1}
          onSwiper={(swiper) => { swiperRef.current = swiper }}
          className="homepage-carousel-swiper h-full"
        >
          {slides.map((slide) => (
            <SwiperSlide key={slide.id} className="h-full">
              <SlideContent slide={slide} onPauseCarousel={handlePauseCarousel} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  )
}

function SlideContent({
  slide,
  onPauseCarousel,
}: {
  slide: Slide
  onPauseCarousel: () => void
}) {
  const artists = slide.reference_data?.artist || []
  const title = slide.title || slide.reference_data?.title || ""
  const thumbnail = slide.reference_data?.thumbnail
  const tracklist = slide.reference_data?.tracklist || []
  const playableTracks = tracklist.filter((t: any) => t.url)
  const hasAudio = playableTracks.length > 0

  const hasCustomImage = slide.image_url && slide.image_url !== thumbnail
  const backgroundImage = slide.image_url || thumbnail
  const useProductAsBg = !hasCustomImage && !!thumbnail

  const rawDescription =
    slide.description ||
    slide.subtitle ||
    slide.reference_data?.description ||
    ""
  const description = stripHtml(rawDescription)

  const handleAudioClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onPauseCarousel()
  }

  return (
    <div className="relative w-full h-full">
      {slide.link_url ? (
        <Link href={slide.link_url} className="absolute inset-0 z-0">
          <span className="sr-only">View {title}</span>
        </Link>
      ) : null}
      
      {backgroundImage && (
        <div className="absolute inset-0 overflow-hidden bg-black">
          <img
            src={backgroundImage}
            alt={title}
            className="w-full h-full object-cover"
            style={
              useProductAsBg
                ? {
                    transform: "scale(1.25)",
                    filter: "brightness(0.35)",
                  }
                : undefined
            }
          />
        </div>
      )}

      <div className="absolute inset-0 flex flex-col justify-end p-4 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none">
        <div className="mb-6">
          {thumbnail && (
            <div className="mb-3 pointer-events-auto">
              {slide.link_url ? (
                <Link href={slide.link_url}>
                  <img
                    src={thumbnail}
                    alt={title}
                    className="w-24 h-24 md:w-32 md:h-32 object-cover shadow-lg"
                  />
                </Link>
              ) : (
                <img
                  src={thumbnail}
                  alt={title}
                  className="w-24 h-24 md:w-32 md:h-32 object-cover shadow-lg"
                />
              )}
            </div>
          )}

          <div className="artist-title artist-title--large mb-2 pointer-events-auto">
            {artists.length > 0 && (
              <span className="artist">
                {slide.link_url ? (
                  <Link href={slide.link_url} className="bg-white hover:underline">
                    {artists.join(", ")}
                  </Link>
                ) : (
                  <span className="bg-white">{artists.join(", ")}</span>
                )}
              </span>
            )}
            {title && (
              <h2 className="title">
                {slide.link_url ? (
                  <Link href={slide.link_url} className="bg-white hover:underline">
                    {title}
                  </Link>
                ) : (
                  <span className="bg-white">{title}</span>
                )}
              </h2>
            )}
          </div>

          {description && (
            <p className="leading-snug line-clamp-3 mb-3 text-white">
              {description}
            </p>
          )}

          {hasAudio && slide.reference_data && (
            <div className="pointer-events-auto" onClick={handleAudioClick}>
              <InlineAudioController
                productHandle={slide.reference_data.handle}
                productTitle={slide.reference_data.title}
                productThumbnail={slide.reference_data.thumbnail}
                tracklist={tracklist}
                productId={slide.reference_data.id}
                discogsReleaseId={slide.reference_data.discogs_release_id}
                artist={artists[0]}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}