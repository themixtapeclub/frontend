// src/modules/products/components/product-card/index.tsx
"use client"

import Image from "next/image"
import Link from "next/link"
import { useState, useEffect } from "react"
import InlineAudioController, { SimplePlayButton } from "@modules/common/components/inline-audio-controller"
import { getGlobalAudioState } from "@lib/context/audio-player"

interface ProductCardProps {
  hideOutOfStockStyle?: boolean
  product: any
  priority?: boolean
  variant?: "regular" | "featured"
}

const DISABLED_ARTISTS = ['various', 'unknown', 'unknown artist', 'n/a']
const DISABLED_LABELS = ['not on label', 'unknown', 'n/a']

function generateAltText(productName: string, artists: string[], format?: string): string {
  const parts: string[] = []
  const validArtists = artists.filter(a => !DISABLED_ARTISTS.includes(a.toLowerCase()))
  if (validArtists.length > 0) {
    parts.push(validArtists.join(", "))
  }
  parts.push(productName)
  if (format) {
    parts.push(format)
  }
  return parts.join(" - ")
}

export default function ProductCard({
  product,
  priority = false,
  variant = "regular",
  hideOutOfStockStyle = false,
}: ProductCardProps) {
  const [imageError, setImageError] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [hasBeenHovered, setHasBeenHovered] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [, forceUpdate] = useState({})

  const productName = product.title || "Untitled"
  const productHandle = product.handle || product.id
  const sku5 = product.sku5 || null
  const productUrl = sku5 ? `/product/${productHandle}/${sku5}` : `/product/${productHandle}`
  const productId = product.id
  const discogsReleaseId = product.discogs_release_id || product.metadata?.discogs_release_id

  useEffect(() => {
    setMounted(true)
    const updateState = () => forceUpdate({})
    const globalState = getGlobalAudioState()
    globalState.listeners.add(updateState)

    return () => {
      globalState.listeners.delete(updateState)
    }
  }, [])

  const globalState = mounted ? getGlobalAudioState() : { currentTrack: null }
  const currentTrack = globalState.currentTrack
  const isThisProductPlaying = mounted && currentTrack && currentTrack.productSlug === productHandle

  const getStock = (): number | null => {
    if (product.stock !== undefined && product.stock !== null) {
      const parsed = typeof product.stock === "number" ? product.stock : parseInt(product.stock, 10)
      if (!isNaN(parsed)) return parsed
    }
    if (product.variants?.[0]?.inventory_quantity !== undefined) {
      const parsed = typeof product.variants[0].inventory_quantity === "number"
        ? product.variants[0].inventory_quantity
        : parseInt(product.variants[0].inventory_quantity, 10)
      if (!isNaN(parsed)) return parsed
    }
    if (product.metadata?.stock !== undefined) {
      const parsed = typeof product.metadata.stock === "number"
        ? product.metadata.stock
        : parseInt(product.metadata.stock, 10)
      if (!isNaN(parsed)) return parsed
    }
    return null
  }

  const stock = getStock()
  const isOutOfStock = !hideOutOfStockStyle && stock !== null && stock <= 0

  const format = Array.isArray(product.format)
    ? product.format[0]?.toLowerCase()
    : product.format?.toLowerCase()

  const getPlaceholder = () => {
    if (format === "cd") return "/static/noimageplaceholder-cd.jpg"
    if (format === "cassette") return "/static/noimageplaceholder-cassette.jpg"
    return "/static/noimageplaceholder.jpg"
  }

  const rawImageUrl = product.thumbnail || product.image_main_url
  const imageUrl = rawImageUrl && !imageError ? rawImageUrl : getPlaceholder()

  const getArtists = (): string[] => {
    if (!product.artist) return []
    if (Array.isArray(product.artist)) return product.artist.filter((a: string) => a && a.trim())
    if (typeof product.artist === "string" && product.artist.trim()) return [product.artist]
    return []
  }

  const getLabels = (): string[] => {
    if (!product.label) return []
    if (Array.isArray(product.label)) return product.label.filter((l: string) => l && l.trim())
    if (typeof product.label === "string" && product.label.trim()) return [product.label]
    return []
  }

  const artists = getArtists()
  const labels = getLabels()
  const mainArtist = artists[0] || null

  const price = product.price_usd
  const formattedPrice = price
    ? new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: price % 1 === 0 ? 0 : 2,
        maximumFractionDigits: 2,
      }).format(price)
    : null

  const tracklist = product.tracklist || []
  const playableTracks = tracklist.filter((t: any) => t.url)
  const isSecondHand = product.product_type === "Second Hand"
  const hasAudio = playableTracks.length > 0 && !(isOutOfStock)

  const showOverlay = isHovered || !!isThisProductPlaying

  const altText = generateAltText(productName, artists, format)

  const createSlug = (text: string): string => {
    const normalized = text.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    return normalized
      .toLowerCase()
      .replace(/&/g, "")
      .replace(/\s+/g, "-")
      .replace(/[^\w-]/g, "")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
  }

  const formatArtistName = (name: string) => {
    const prefixes = ["The ", "DJ "]
    for (const prefix of prefixes) {
      if (name.startsWith(prefix)) {
        return (
          <>
            <sup>{prefix.trim()}</sup> {name.slice(prefix.length)}
          </>
        )
      }
    }
    return name
  }

  const renderLinkedList = (items: string[], basePath: string, disabledList: string[], formatFn?: (name: string) => React.ReactNode) => {
    return items.map((item, index) => {
      const isDisabled = disabledList.includes(item.toLowerCase().trim())
      const displayContent = formatFn ? formatFn(item) : item
      return (
        <span key={item}>
          {isDisabled ? (
            <span>{displayContent}</span>
          ) : (
            <Link
              href={`${basePath}/${createSlug(item)}`}
              className="hover:underline"
              aria-label={`View all products by ${item}`}
            >
              {displayContent}
            </Link>
          )}
          {index < items.length - 1 && <span aria-hidden="true">, </span>}
        </span>
      )
    })
  }

  if (variant === "featured") {
    return (
      <article
        className="product featured m-0 p-0"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        aria-label={`${productName}${artists.length > 0 ? ` by ${artists.join(", ")}` : ""}${isOutOfStock ? " - Out of stock" : ""}`}
      >
        <div className="bg-black lg:flex lg:justify-center lg:py-[8.33%] relative">
          <Link
            href={productUrl}
            className="block w-full lg:w-2/3"
            aria-label={`View ${productName}`}
          >
            <div className={`relative w-full aspect-square overflow-hidden ${isOutOfStock ? 'opacity-50' : ''}`}>
              <Image
                src={imageUrl}
                alt={altText}
                fill
                className="object-cover"
                priority={priority}
                placeholder="empty"
                sizes="(max-width: 1024px) 50vw, 22vw"
                onError={() => setImageError(true)}
              />
              {isOutOfStock && (
                <div
                  className="absolute top-2 left-2 bg-white text-black px-2 py-1"
                  role="status"
                  aria-live="polite"
                >
                  Out of stock
                </div>
              )}
            </div>
          </Link>

          {hasAudio && (
            <div
              className={`absolute bottom-0 lg:bottom-[8.33%] left-0 right-0 lg:left-[16.67%] lg:right-[16.67%] p-3 transition-opacity duration-200 ${showOverlay ? 'pointer-events-auto' : 'pointer-events-none'}`}
              style={{
                opacity: showOverlay ? 1 : 0,
              }}
              aria-hidden={!showOverlay}
            >
              <InlineAudioController
                productHandle={productHandle}
                productTitle={productName}
                productThumbnail={product.thumbnail}
                tracklist={tracklist}
                productId={productId}
                discogsReleaseId={discogsReleaseId}
                artist={mainArtist}
                isOverlayVisible={showOverlay}
              />
            </div>
          )}
        </div>

        <div className="card-text-featured bg-black text-white">
          <div className="artist-title">
            {artists.length > 0 && (
              <span className="artist">
                {renderLinkedList(artists, "/shop/artist", DISABLED_ARTISTS, formatArtistName)}
              </span>
            )}
            <span className="title">
              <Link href={productUrl} className="hover:underline">
                {productName}
              </Link>
            </span>
          </div>

          {labels.length > 0 && (
            <p className="label-text mt-0.5 m-0">
              {renderLinkedList(labels, "/shop/label", DISABLED_LABELS)}
            </p>
          )}

          <div className="mt-2 flex items-center gap-2">
            {formattedPrice && !isOutOfStock && (
              <span aria-label={`Price: ${formattedPrice}`}>{formattedPrice}</span>
            )}
            {hasAudio && (
              <SimplePlayButton
                productHandle={productHandle}
                productTitle={productName}
                productThumbnail={product.thumbnail}
                tracklist={tracklist}
                productId={productId}
                discogsReleaseId={discogsReleaseId}
                artist={mainArtist}
                className="text-white hover:text-white/70"
              />
            )}
          </div>
        </div>
      </article>
    )
  }

  return (
    <article
      className="product product-card-outer"
      onMouseEnter={() => {
        setIsHovered(true)
        setHasBeenHovered(true)
      }}
      onMouseLeave={() => setIsHovered(false)}
      aria-label={`${productName}${artists.length > 0 ? ` by ${artists.join(", ")}` : ""}${isOutOfStock ? " - Out of stock" : ""}`}
    >
      <div
        className="bg-black relative"
        style={{ isolation: "isolate", overflow: "hidden" }}
      >
        <Link href={productUrl} className="block" aria-label={`View ${productName}`}>
          <div
            className="relative w-full aspect-square"
            style={{
              opacity: isOutOfStock && !isHovered ? 0.3 : 1,
              transition: isHovered ? "opacity 0.2s ease-out" : "opacity 5s ease-out",
            }}
          >
            <Image
              src={imageUrl}
              alt={altText}
              fill
              className="object-cover"
              priority={priority}
              placeholder="empty"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              onError={() => setImageError(true)}
            />
            {isOutOfStock && !isHovered && !hasBeenHovered && (
              <div
                className="absolute inset-0"
                style={{
                  backdropFilter: "blur(10px)",
                  WebkitBackdropFilter: "blur(10px)",
                }}
                aria-hidden="true"
              />
            )}
          </div>
        </Link>

        {hasAudio && (
          <div
            className={`absolute bottom-0 left-0 right-0 p-3 transition-opacity duration-200 ${showOverlay ? 'pointer-events-auto' : 'pointer-events-none'}`}
            style={{
              opacity: showOverlay ? 1 : 0,
            }}
            aria-hidden={!showOverlay}
          >
            <InlineAudioController
              productHandle={productHandle}
              productTitle={productName}
              productThumbnail={product.thumbnail}
              tracklist={tracklist}
              productId={productId}
              discogsReleaseId={discogsReleaseId}
              artist={mainArtist}
              isOverlayVisible={showOverlay}
            />
          </div>
        )}
      </div>

      <div className="card-text">
        <div className="artist-title">
          {artists.length > 0 && (
            <span className="artist">
              {renderLinkedList(artists, "/shop/artist", DISABLED_ARTISTS, formatArtistName)}
            </span>
          )}
          <span className="title">
            <Link href={productUrl} className="hover:underline">
              {productName}
            </Link>
          </span>
        </div>

        {labels.length > 0 && (
          <p className="label-text mt-0.5 m-0">
            {renderLinkedList(labels, "/shop/label", DISABLED_LABELS)}
          </p>
        )}

        <div className="mt-2 flex items-center gap-2">
          {formattedPrice && !isOutOfStock && (
            <span aria-label={`Price: ${formattedPrice}`}>{formattedPrice}</span>
          )}
          {hasAudio && (
            <SimplePlayButton
              productHandle={productHandle}
              productTitle={productName}
              productThumbnail={product.thumbnail}
              tracklist={tracklist}
              productId={productId}
              discogsReleaseId={discogsReleaseId}
              artist={mainArtist}
            />
          )}
        </div>
      </div>
    </article>
  )
}