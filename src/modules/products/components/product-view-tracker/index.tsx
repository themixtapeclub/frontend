// frontend/src/modules/product/components/product-view-tracker/index.tsx
"use client"

import { useEffect } from "react"
import { useBrevo } from "@lib/context/brevo-context"
import { HttpTypes } from "@medusajs/types"

interface ProductViewTrackerProps {
  product: HttpTypes.StoreProduct
}

export default function ProductViewTracker({ product }: ProductViewTrackerProps) {
  const { trackProductViewed } = useBrevo()

  useEffect(() => {
    if (!product) return

    // Get first variant price
    const price = product.variants?.[0]?.calculated_price?.calculated_amount || 0
    
    // Get category names
    const categories = product.categories?.map(c => c.name) || []
    
    // Get tags (assuming they're stored in metadata or a tags field)
    const tags = (product.metadata?.tags as string[]) || []

    // Get first image
    const image = product.images?.[0]?.url || product.thumbnail || ""

    trackProductViewed({
      id: product.id,
      name: product.title,
      price: price / 100, // Convert from cents
      url: `${typeof window !== "undefined" ? window.location.origin : ""}/product/${product.handle}`,
      image,
      categories,
      tags,
    })
  }, [product, trackProductViewed])

  return null
}