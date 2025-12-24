// src/lib/data/region-cookie.ts
import { cookies } from "next/headers"
import { getRegion as getRegionByCode } from "./regions"

const DEFAULT_REGION = process.env.NEXT_PUBLIC_DEFAULT_REGION || "us"

export async function getRegionFromCookie() {
  const cookieStore = await cookies()
  const countryCode = cookieStore.get("_medusa_country_code")?.value || DEFAULT_REGION
  return getRegionByCode(countryCode)
}

export function getCountryCodeFromCookie() {
  if (typeof window !== "undefined") {
    const match = document.cookie.match(/(?:^|; )_medusa_country_code=([^;]*)/)
    return match ? match[1] : DEFAULT_REGION
  }
  return DEFAULT_REGION
}

export const DEFAULT_COUNTRY_CODE = DEFAULT_REGION
