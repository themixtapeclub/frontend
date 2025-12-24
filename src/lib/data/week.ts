// src/lib/data/week.ts
"use server"
const MEDUSA_BACKEND_URL = process.env.MEDUSA_BACKEND_URL || "http://localhost:9000"
const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ""

export interface WeekInfo {
  value: string
  display_name: string
  product_count?: number
}

export interface RecentWeeksProductsResponse {
  products: any[]
  total: number
  limit: number
  offset: number
  pages: number
  weeks: string[]
  currentWeek: string
}

export interface WeekProductsResponse {
  products: any[]
  total: number
  limit: number
  offset: number
  pages: number
  week: WeekInfo
}

export interface RecentWeeksResponse {
  recentWeeks: WeekInfo[]
}

// Convert WWYY to display name like "Week 46, 2025"
function formatWeekDisplay(weekValue: string): string {
  if (!weekValue || weekValue.length !== 4) return weekValue
  const weekNum = parseInt(weekValue.slice(0, 2))
  const year = parseInt("20" + weekValue.slice(2))
  return `Week ${weekNum}, ${year}`
}

export async function getRecentWeeksProducts({
  weeks = 5,
  page = 1,
  limit = 48,
  sort = "order_position",
  order = "asc",
  requireImage = false
}: {
  weeks?: number
  page?: number
  limit?: number
  sort?: string
  order?: string
  requireImage?: boolean
}): Promise<RecentWeeksProductsResponse> {
  const offset = (page - 1) * limit
  try {
    const url = new URL(`${MEDUSA_BACKEND_URL}/store/products/week`)
    url.searchParams.set("weeks", weeks.toString())
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
      console.error("Week API error:", response.status, errorText)
      throw new Error(`Week API error: ${response.status}`)
    }
    return await response.json()
  } catch (error) {
    console.error("getRecentWeeksProducts error:", error)
    return {
      products: [],
      total: 0,
      limit,
      offset,
      pages: 0,
      weeks: [],
      currentWeek: ""
    }
  }
}

export async function getWeekProducts({
  week,
  page = 1,
  limit = 48,
  sort = "order_position",
  order = "asc",
  requireImage = false
}: {
  week: string
  page?: number
  limit?: number
  sort?: string
  order?: string
  requireImage?: boolean
}): Promise<WeekProductsResponse> {
  const offset = (page - 1) * limit
  try {
    const url = new URL(`${MEDUSA_BACKEND_URL}/store/products/week/${week}`)
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
      console.error("Week products API error:", response.status, errorText)
      throw new Error(`Week products API error: ${response.status}`)
    }
    const data = await response.json()
    return {
      ...data,
      week: {
        value: week,
        display_name: data.week?.display_name || formatWeekDisplay(week),
        product_count: data.total
      }
    }
  } catch (error) {
    console.error("getWeekProducts error:", error)
    return {
      products: [],
      total: 0,
      limit,
      offset,
      pages: 0,
      week: {
        value: week,
        display_name: formatWeekDisplay(week),
        product_count: 0
      }
    }
  }
}

export async function getRecentWeeks(maxWeeks: number = 10): Promise<RecentWeeksResponse> {
  try {
    // Fetch recent weeks data from the week endpoint
    const url = new URL(`${MEDUSA_BACKEND_URL}/store/products/week`)
    url.searchParams.set("weeks", maxWeeks.toString())
    url.searchParams.set("limit", "1")
    
    const response = await fetch(url.toString(), {
      headers: {
        "x-publishable-api-key": PUBLISHABLE_KEY,
        "Content-Type": "application/json",
      },
      next: { revalidate: 60 },
    })
    
    if (!response.ok) {
      throw new Error(`Recent weeks API error: ${response.status}`)
    }
    
    const data = await response.json()
    const weeks: string[] = data.weeks || []
    
    // Convert to WeekInfo objects with display names
    const recentWeeks: WeekInfo[] = weeks.map((w: string) => ({
      value: w,
      display_name: formatWeekDisplay(w)
    }))
    
    return { recentWeeks }
  } catch (error) {
    console.error("getRecentWeeks error:", error)
    return { recentWeeks: [] }
  }
}

export async function getProductsByRecentWeeks(maxWeeks: number = 5): Promise<Array<{
  week: WeekInfo
  products: any[]
}>> {
  try {
    const { weeks } = await getRecentWeeksProducts({ weeks: maxWeeks, limit: 1 })
    
    const weekGroups = await Promise.all(
      weeks.map(async (weekValue) => {
        const { products, total } = await getWeekProducts({
          week: weekValue,
          limit: 12
        })
        return {
          week: {
            value: weekValue,
            display_name: formatWeekDisplay(weekValue),
            product_count: total
          },
          products
        }
      })
    )
    
    return weekGroups
  } catch (error) {
    console.error("getProductsByRecentWeeks error:", error)
    return []
  }
}
