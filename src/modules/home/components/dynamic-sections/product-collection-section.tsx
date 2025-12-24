// src/modules/home/components/dynamic-sections/product-collection-section.tsx
"use client"

import Link from "next/link"
import InlineAudioController from "@modules/common/components/inline-audio-controller"

interface Product {
  id: string
  slide_type: string
  title?: string
  subtitle?: string
  description?: string
  image_url?: string
  link_url?: string
  text_color?: string
  reference_id?: string
  reference_data?: {
    id: string
    title: string
    handle: string
    thumbnail?: string
    artist?: string[]
    label?: string[]
    description?: string
    tracklist?: any[]
    discogs_release_id?: string
  }
}

interface ProductCollectionSectionProps {
  section: {
    title?: string
    slides?: Product[]
    settings?: {
      columns?: number
      show_title?: boolean
      show_artist?: boolean
      show_label?: boolean
      show_description?: boolean
    }
  }
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").trim()
}

export default function ProductCollectionSection({
  section,
}: ProductCollectionSectionProps) {
  const products = section.slides || []
  const columns = section.settings?.columns || 4
  const showTitle = section.settings?.show_title ?? true
  const showArtist = section.settings?.show_artist ?? true
  const showDescription = section.settings?.show_description ?? false

  if (products.length === 0) return null

  const getGridClasses = () => {
    switch (columns) {
      case 1:
        return "grid-cols-1"
      case 2:
        return "grid-cols-1 sm:grid-cols-2"
      case 3:
        return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
      case 4:
        return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
      case 5:
        return "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5"
      default:
        return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
    }
  }

  return (
    <section className="relative w-full bg-black">
      <div className={`grid ${getGridClasses()} gap-0`}>
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            showTitle={showTitle}
            showArtist={showArtist}
            showDescription={showDescription}
          />
        ))}
      </div>
    </section>
  )
}

interface ProductCardProps {
  product: Product
  showTitle: boolean
  showArtist: boolean
  showDescription: boolean
}

function ProductCard({
  product,
  showTitle,
  showArtist,
  showDescription,
}: ProductCardProps) {
  const artists = product.reference_data?.artist || []
  const title = product.title || product.reference_data?.title || ""
  const thumbnail = product.reference_data?.thumbnail
  const imageUrl =
    product.image_url || thumbnail || "/static/noimageplaceholder.jpg"
  const handle = product.reference_data?.handle || product.reference_id || ""
  const linkUrl = product.link_url || `/product/${handle}`

  const rawDescription =
    product.description || product.reference_data?.description || ""
  const description = stripHtml(rawDescription)

  const tracklist = product.reference_data?.tracklist || []
  const playableTracks = tracklist.filter((t: any) => t.url)
  const hasAudio = playableTracks.length > 0

  const hasCustomImage = product.image_url && product.image_url !== thumbnail

  return (
    <div className="relative w-full aspect-square overflow-hidden bg-black group">
      <div className="absolute inset-0 overflow-hidden bg-black">
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover"
          style={
            !hasCustomImage && thumbnail
              ? {
                  transform: "scale(1.25)",
                  filter: "brightness(0.35)",
                }
              : {
                  filter: "brightness(0.5)",
                }
          }
        />
      </div>

      <div className="absolute inset-0 flex flex-col justify-end p-4 pb-3 md:pb-4 bg-gradient-to-t from-black/70 via-black/20 to-transparent">
        <div>
          {thumbnail && (
            <div className="mb-3">
              <Link href={linkUrl} className="inline-block">
                <img
                  src={thumbnail}
                  alt={title}
                  className="w-24 h-24 md:w-32 md:h-32 object-cover shadow-lg"
                />
              </Link>
            </div>
          )}

          <div className="artist-title artist-title--large mb-2">
            {showArtist && artists.length > 0 && (
              <span className="artist">
                {artists.map((artist, index) => (
                  <span key={artist}>
                    <Link
                      href={`/archive?artist=${encodeURIComponent(artist)}`}
                      className="bg-white"
                    >
                      {artist}
                    </Link>
                    {index < artists.length - 1 && (
                      <span className="bg-white">, </span>
                    )}
                  </span>
                ))}
              </span>
            )}
            {showTitle && title && (
              <h3 className="title">
                <Link href={linkUrl} className="bg-white">
                  {title}
                </Link>
              </h3>
            )}
          </div>

          {showDescription && description && (
            <p className="leading-snug line-clamp-3 mb-3 text-white">
              {description}
            </p>
          )}

          {hasAudio && product.reference_data && (
            <div className="py-2 px-2 -mx-2">
              <InlineAudioController
                productHandle={product.reference_data.handle}
                productTitle={product.reference_data.title}
                productThumbnail={product.reference_data.thumbnail}
                tracklist={tracklist}
                productId={product.reference_data.id}
                discogsReleaseId={product.reference_data.discogs_release_id}
                artist={artists[0]}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}