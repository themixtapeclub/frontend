// src/lib/data/filter.ts
"use server"
const MEDUSA_BACKEND_URL = process.env.MEDUSA_BACKEND_URL || "http://localhost:9000"
const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ""
export type FilterType = "genre" | "format" | "artist" | "label"
export interface FilteredProductsResponse {
  products: any[]
  featuredProducts?: any[]
  total: number
  limit: number
  offset: number
  pages: number
  filter: {
    type: FilterType
    value: string
    display_name: string
  }
}
export async function getFilteredProducts({
  type,
  value,
  page = 1,
  limit = 48,
  sort = "created_at",
  order = "desc",
  requireImage = true
}: {
  type: FilterType
  value: string
  page?: number
  limit?: number
  sort?: string
  order?: string
  requireImage?: boolean
}): Promise<FilteredProductsResponse> {
  const offset = (page - 1) * limit
  try {
    const url = new URL(`${MEDUSA_BACKEND_URL}/store/products/filter`)
    url.searchParams.set("type", type)
    url.searchParams.set("value", value)
    url.searchParams.set("limit", limit.toString())
    url.searchParams.set("offset", offset.toString())
    url.searchParams.set("sort", sort)
    url.searchParams.set("order", order)
    url.searchParams.set("requireImage", requireImage.toString())
    const response = await fetch(url.toString(), {
      headers: {
        "x-publishable-api-key": PUBLISHABLE_KEY,
        "Content-Type": "application/json",
      },
      next: { revalidate: 60 },
    })
    if (!response.ok) {
      const errorText = await response.text()
      console.error("Filter API error:", response.status, errorText)
      throw new Error(`Filter API error: ${response.status}`)
    }
    return await response.json()
  } catch (error) {
    console.error("getFilteredProducts error:", error)
    return {
      products: [],
      total: 0,
      limit,
      offset,
      pages: 0,
      filter: {
        type,
        value,
        display_name: value
      }
    }
  }
}
export async function getFilterValues(type: FilterType): Promise<string[]> {
  const values: Record<FilterType, string[]> = {
    genre: [
      "disco", "house", "jazz", "soul", "ambient", "brazil", "africa",
      "asia", "latin", "reggae", "world", "gospel", "electronic", "techno",
      "experimental", "library", "downtempo", "edits", "hip-hop", "rock"
    ],
    format: ["7", "12", "lp", "compilation", "cassette", "cd", "publication", "merchandise", "bundle"],
    artist: [],
    label: []
  }
  return values[type] || []
}

export async function getForthcomingProducts({
  page = 1,
  limit = 48,
}: {
  page?: number
  limit?: number
}): Promise<{ products: any[]; total: number; pages: number }> {
  const offset = (page - 1) * limit
  try {
    const url = new URL(`${MEDUSA_BACKEND_URL}/store/products/forthcoming`)
    url.searchParams.set("limit", limit.toString())
    url.searchParams.set("offset", offset.toString())
    const response = await fetch(url.toString(), {
      headers: {
        "x-publishable-api-key": PUBLISHABLE_KEY,
        "Content-Type": "application/json",
      },
      next: { revalidate: 60 },
    })
    if (!response.ok) {
      throw new Error(`Forthcoming API error: ${response.status}`)
    }
    return await response.json()
  } catch (error) {
    console.error("getForthcomingProducts error:", error)
    return { products: [], total: 0, pages: 0 }
  }
}