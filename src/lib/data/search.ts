// src/lib/data/search.ts
const BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'http://localhost:9000'

export interface SearchParams {
  query: string
  sort?: string
  page?: number
  type?: "all" | "products" | "mixtapes"
  limit?: number
}

export interface SearchResult {
  id: string
  _type: "product" | "mixtape"
  title: string
  handle?: string
  slug?: string
  thumbnail?: string
  featured_image?: string
  description?: string
  metadata?: {
    artist?: string
    label?: string
    stock?: number
    price?: number
  }
  variants?: Array<{
    prices?: Array<{
      amount: number
      currency_code: string
    }>
    inventory_quantity?: number
  }>
  contributor_name?: string
}

export interface SearchResponse {
  products: SearchResult[]
  total: number
  productsTotal: number
  mixtapesTotal: number
  allTotal: number
  page: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
  query: string
  searchTime?: number
}


export async function searchProducts(params: SearchParams): Promise<SearchResponse> {
  const {
    query,
    sort = "latest-desc",
    page = 1,
    type = "all",
    limit = 48
  } = params

  if (!query?.trim()) {
    return {
      products: [],
      total: 0,
      productsTotal: 0,
      mixtapesTotal: 0,
      allTotal: 0,
      page: 1,
      totalPages: 0,
      hasNextPage: false,
      hasPreviousPage: false,
      query: ""
    }
  }

  try {
    const searchParams = new URLSearchParams({
      q: query.trim(),
      sort,
      page: page.toString(),
      type,
      limit: limit.toString()
    })

    const response = await fetch(`${BACKEND_URL}/store/search?${searchParams}`, {
      headers: {
        "Content-Type": "application/json"
      },
      next: {
        revalidate: 60 // Cache for 60 seconds
      }
    })

    if (!response.ok) {
      throw new Error(`Search failed: ${response.status}`)
    }

    const data = await response.json()

    return {
      products: data.products || [],
      total: data.total || 0,
      productsTotal: data.productsTotal || 0,
      mixtapesTotal: data.mixtapesTotal || 0,
      allTotal: data.allTotal || 0,
      page: data.page || 1,
      totalPages: data.totalPages || 0,
      hasNextPage: data.hasNextPage || false,
      hasPreviousPage: data.hasPreviousPage || false,
      query
    }
  } catch (error) {
    console.error("Search error:", error)
    return {
      products: [],
      total: 0,
      productsTotal: 0,
      mixtapesTotal: 0,
      allTotal: 0,
      page: 1,
      totalPages: 0,
      hasNextPage: false,
      hasPreviousPage: false,
      query
    }
  }
}

// Quick search for autocomplete (returns fewer results, faster)
export async function quickSearch(query: string, limit: number = 8): Promise<SearchResult[]> {
  if (!query?.trim()) {
    return []
  }

  try {
    const searchParams = new URLSearchParams({
      q: query.trim(),
      limit: limit.toString(),
      type: "products"
    })

    const response = await fetch(`${BACKEND_URL}/store/search?${searchParams}`, {
      headers: {
        "Content-Type": "application/json"
      }
    })

    if (!response.ok) {
      throw new Error(`Quick search failed: ${response.status}`)
    }

    const data = await response.json()
    return data.products || []
  } catch (error) {
    console.error("Quick search error:", error)
    return []
  }
}