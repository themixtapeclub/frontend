import { HttpTypes } from "@medusajs/types"
import { NextRequest, NextResponse } from "next/server"

const BACKEND_URL = process.env.MEDUSA_BACKEND_URL
const PUBLISHABLE_API_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
const DEFAULT_REGION = process.env.NEXT_PUBLIC_DEFAULT_REGION || "us"

const securityHeaders: Record<string, string> = {
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "X-XSS-Protection": "1; mode=block",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
}

const regionMapCache = {
  regionMap: new Map<string, HttpTypes.StoreRegion>(),
  regionMapUpdated: Date.now(),
}

async function getRegionMap(cacheId: string) {
  const { regionMap, regionMapUpdated } = regionMapCache

  if (!BACKEND_URL) {
    console.error("MEDUSA_BACKEND_URL not set")
    return regionMap
  }

  if (
    !regionMap.keys().next().value ||
    regionMapUpdated < Date.now() - 3600 * 1000
  ) {
    try {
      const { regions } = await fetch(`${BACKEND_URL}/store/regions`, {
        headers: {
          "x-publishable-api-key": PUBLISHABLE_API_KEY!,
        },
        next: {
          revalidate: 3600,
          tags: [`regions-${cacheId}`],
        },
        cache: "force-cache",
      }).then(async (response) => {
        const json = await response.json()
        if (!response.ok) {
          throw new Error(json.message)
        }
        return json
      })

      if (regions?.length) {
        regions.forEach((region: HttpTypes.StoreRegion) => {
          region.countries?.forEach((c) => {
            regionMapCache.regionMap.set(c.iso_2 ?? "", region)
          })
        })
        regionMapCache.regionMapUpdated = Date.now()
      }
    } catch (error) {
      console.error("Error fetching regions:", error)
    }
  }

  return regionMapCache.regionMap
}

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  if (
    pathname.includes(".") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next")
  ) {
    return NextResponse.next()
  }

  const response = NextResponse.next()

  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value)
  })

  let cacheIdCookie = request.cookies.get("_medusa_cache_id")
  let cacheId = cacheIdCookie?.value || crypto.randomUUID()

  if (!cacheIdCookie) {
    response.cookies.set("_medusa_cache_id", cacheId, {
      maxAge: 60 * 60 * 24,
    })
  }

  let countryCodeCookie = request.cookies.get("_medusa_country_code")

  if (!countryCodeCookie) {
    try {
      const regionMap = await getRegionMap(cacheId)

      const vercelCountryCode = request.headers
        .get("x-vercel-ip-country")
        ?.toLowerCase()

      let countryCode = DEFAULT_REGION
      if (vercelCountryCode && regionMap.has(vercelCountryCode)) {
        countryCode = vercelCountryCode
      } else if (!regionMap.has(DEFAULT_REGION) && regionMap.keys().next().value) {
        countryCode = regionMap.keys().next().value || DEFAULT_REGION
      }

      const region = regionMap.get(countryCode)
      if (region) {
        response.cookies.set("_medusa_region", JSON.stringify(region), {
          maxAge: 60 * 60 * 24 * 7,
        })
        response.cookies.set("_medusa_country_code", countryCode, {
          maxAge: 60 * 60 * 24 * 7,
        })
      }
    } catch (error) {
      console.error("Error setting region cookie:", error)
    }
  }

  return response
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|images|assets|.*\\.png|.*\\.svg|.*\\.jpg|.*\\.jpeg|.*\\.gif|.*\\.webp).*)",
  ],
}
