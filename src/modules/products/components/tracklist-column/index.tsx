// frontend/src/modules/products/components/tracklist-column/index.tsx
"use client"

import { useState, useEffect, useRef } from "react"
import Tracklist from "@modules/products/components/tracklist"

type TracklistColumnProps = {
  tracklist: any[] | null | undefined
  product: any
}

export default function TracklistColumn({ tracklist, product }: TracklistColumnProps) {
  const [hasContent, setHasContent] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const checkContent = () => {
      const tracklistEl = containerRef.current?.querySelector('.tracklist-loaded')
      setHasContent(!!tracklistEl)
    }

    checkContent()

    const observer = new MutationObserver(checkContent)
    observer.observe(containerRef.current, { 
      childList: true, 
      subtree: true, 
      attributes: true,
      attributeFilter: ['class']
    })

    return () => observer.disconnect()
  }, [product?.id])

  const isSecondHand = product?.product_type === "Second Hand"
  const stock = product?.stock ?? product?.variants?.[0]?.inventory_quantity ?? null
  const isOutOfStock = stock !== null && stock <= 0
  const disableAudio = isSecondHand && isOutOfStock

  return (
    <div 
      ref={containerRef}
      className="product-tracklist-col w-full text-small small:w-[280px] border-b small:border-b-0 small:border-r border-black"
    >
      <div 
        className="sticky transition-[top] duration-300 ease-out" 
        style={{ 
          top: 'calc(var(--promo-banner-height, 0px) + var(--now-playing-height, 0px))',
          marginBottom: hasContent ? '-1px' : '0' 
        }}
      >
        <Tracklist tracklist={tracklist} product={product} disableAudio={disableAudio} />
      </div>
    </div>
  )
}