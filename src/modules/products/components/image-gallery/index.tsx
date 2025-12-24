// src/modules/products/components/image-gallery/index.tsx
"use client"

import { HttpTypes } from "@medusajs/types"
import Image from "next/image"
import { useState, useEffect, useRef } from "react"
import { fetchDiscogsRelease } from "@lib/util/discogs"
import { Swiper, SwiperSlide } from "swiper/react"
import { Pagination } from "swiper/modules"
import "swiper/css"
import "swiper/css/pagination"

type ImageGalleryProps = {
  images: HttpTypes.StoreProductImage[]
  product?: HttpTypes.StoreProduct
}

const ImageGallery = ({ images, product }: ImageGalleryProps) => {
  const [discogsImageUrl, setDiscogsImageUrl] = useState<string | null>(null)
  const [discogsLoading, setDiscogsLoading] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const fetchAttempted = useRef(false)
  
  const hasImages = images && images.length > 0
  const currentImage = hasImages ? images[0] : null
  
  const p = product as any
  const discogsReleaseId = p?.discogs_release_id || p?.metadata?.discogs_release_id
  const additionalImages: string[] = p?.additional_images || []
  
  const displayImageUrl = currentImage?.url || discogsImageUrl
  
  const allImages = [displayImageUrl, ...additionalImages].filter(Boolean) as string[]
  const uniqueImages = Array.from(new Set(allImages))
  const hasMultipleImages = uniqueImages.length > 1

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024)
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])
  
  useEffect(() => {
    if (hasImages || !discogsReleaseId || fetchAttempted.current) return
    
    fetchAttempted.current = true
    setDiscogsLoading(true)
    
    fetchDiscogsRelease(discogsReleaseId.toString())
      .then((release) => {
        if (release?.images && release.images.length > 0) {
          const primaryImage = release.images.find((img: any) => img.type === "primary")
          const imageToUse = primaryImage || release.images[0]
          if (imageToUse?.uri) {
            setDiscogsImageUrl(imageToUse.uri)
          }
        }
      })
      .catch((err) => {
        console.error("[ImageGallery] Discogs fetch error:", err)
      })
      .finally(() => setDiscogsLoading(false))
  }, [hasImages, discogsReleaseId])

  useEffect(() => {
    fetchAttempted.current = false
  }, [product?.id])
  
  const getPlaceholderImage = () => {
    if (!product) return "/static/noimageplaceholder.jpg"
    
    const format = (product as any).format || []
    const formatLower = format.map((f: string) => f.toLowerCase())
    
    const isCassette = formatLower.some((f: string) => f.includes("cassette"))
    const isCD = formatLower.some((f: string) => f.includes("cd"))
    
    if (isCassette) return "/static/noimageplaceholder-cassette.jpg"
    if (isCD) return "/static/noimageplaceholder-cd.jpg"
    return "/static/noimageplaceholder.jpg"
  }

  const showPlaceholder = !displayImageUrl && !discogsLoading

  const ImageWithBlur = ({ src, alt, priority = false, clipBlur = false }: { src: string; alt: string; priority?: boolean; clipBlur?: boolean }) => {
    const [loaded, setLoaded] = useState(false)
    
    return (
      <div className={`relative ${clipBlur ? 'overflow-hidden' : ''}`} style={{ width: "400px", height: "400px" }}>
        <div 
          className="absolute pointer-events-none"
          style={{ 
            top: clipBlur ? "0" : "-50px",
            left: clipBlur ? "0" : "-50px",
            right: clipBlur ? "0" : "-50px",
            bottom: clipBlur ? "0" : "-50px",
            backgroundImage: `url(${src})`,
            backgroundSize: "400px 400px",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            filter: "blur(25px)",
            transition: "opacity 0.5s ease-in-out",
            opacity: loaded ? 0 : 0.5,
            transform: clipBlur ? "scale(1.2)" : "none"
          }}
        />
        <Image
          src={src}
          alt={alt}
          width={400}
          height={400}
          priority={priority}
          className="relative z-[10] object-contain"
          style={{
            minHeight: "400px",
            minWidth: "400px",
            maxHeight: "100%",
            maxWidth: "100%",
            width: "auto",
            height: "auto",
            opacity: loaded ? 1 : 0,
            transform: "scale(1.01)",
            transition: "opacity 0.5s ease-in-out"
          }}
          onLoad={() => setLoaded(true)}
        />
      </div>
    )
  }

  if (isMobile && hasMultipleImages) {
    return (
      <div 
        className="bg-transparent flex justify-center relative z-[3]"
        style={{ marginTop: "-3.3rem" }}
      >
        <style jsx global>{`
          .product-gallery-swiper {
            overflow: visible !important;
            width: 100%;
            max-width: 500px;
          }
          .product-gallery-swiper .swiper-pagination {
            bottom: -5.5rem !important;
          }
          .product-gallery-swiper .swiper-pagination-bullet {
            width: 8px;
            height: 8px;
            background: rgba(255, 255, 255, 0.3);
            opacity: 1;
          }
          .product-gallery-swiper .swiper-pagination-bullet-active {
            background: white;
          }
        `}</style>
        <div className="p-0 w-full">
          <div
            className="flex items-center justify-center"
            style={{ 
              marginTop: "6.6rem", 
              marginBottom: "6.6rem" 
            }}
          >
            <Swiper
              key={uniqueImages.join(',')}
              modules={[Pagination]}
              pagination={{ clickable: true }}
              spaceBetween={0}
              slidesPerView={1}
              className="product-gallery-swiper"
            >
              {uniqueImages.map((imgUrl, idx) => (
                <SwiperSlide key={imgUrl}>
                  <div className="flex justify-center">
                    <ImageWithBlur src={imgUrl} alt={`Image ${idx + 1}`} priority={idx === 0} clipBlur />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div 
      className="bg-transparent flex justify-center relative z-[3]"
      style={{ marginTop: "-3.3rem" }}
    >
      <div className="p-0">
        <div 
          className={`flex items-center justify-center ${hasMultipleImages ? 'gap-12' : ''}`}
          style={{ 
            marginTop: "6.6rem", 
            marginBottom: "6.6rem" 
          }}
        >
          {displayImageUrl ? (
            <ImageWithBlur src={displayImageUrl} alt="Product image" priority />
          ) : showPlaceholder ? (
            <div className="relative" style={{ width: "400px", height: "400px" }}>
              <Image
                src={getPlaceholderImage()}
                alt="No image available"
                width={400}
                height={400}
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
            </div>
          ) : null}

          {additionalImages.map((imgUrl, idx) => (
            <ImageWithBlur key={imgUrl} src={imgUrl} alt={`Additional image ${idx + 1}`} />
          ))}
        </div>
      </div>
    </div>
  )
}

export default ImageGallery
