// frontend/src/lib/data/related-products.ts
"use server"

import { HttpTypes } from "@medusajs/types"

const MEDUSA_BACKEND_URL = process.env.MEDUSA_BACKEND_URL || "http://localhost:9000"
const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ""

export interface RelatedProduct {
  id: string
  title: string
  handle: string
  thumbnail: string | null
  artist: string[]
  label: string[]
  genre: string[]
  format: string[]
  price_usd: number
  stock: number
  condition_media: string | null
  condition_sleeve: string | null
  order_position: number | null
  created_at: string
  image_main_url: string | null
}

export interface RelatedProductsResult {
  artistLabelProducts: RelatedProduct[]
  tagBasedProducts: RelatedProduct[]
  validArtists: string[]
  validLabels: string[]
}

export async function getRelatedProducts(
  productId: string,
  limit: number = 12
): Promise<RelatedProductsResult> {
  try {
    const url = new URL(`${MEDUSA_BACKEND_URL}/store/products/related`)
    url.searchParams.set("product_id", productId)
    url.searchParams.set("limit", limit.toString())

    const response = await fetch(url.toString(), {
      headers: {
        "x-publishable-api-key": PUBLISHABLE_KEY,
        "Content-Type": "application/json",
      },
      next: { revalidate: 300 },
    })

    if (!response.ok) {
      console.error("Related products API error:", response.status)
      return {
        artistLabelProducts: [],
        tagBasedProducts: [],
        validArtists: [],
        validLabels: [],
      }
    }

    return await response.json()
  } catch (error) {
    console.error("getRelatedProducts error:", error)
    return {
      artistLabelProducts: [],
      tagBasedProducts: [],
      validArtists: [],
      validLabels: [],
    }
  }
}