// src/lib/util/admin.ts
import { cookies } from "next/headers"

const ADMIN_COOKIE_NAME = "_tmc_admin"
const ADMIN_TOKEN_VALUE = "authenticated"

export async function isAdmin(): Promise<boolean> {
  const cookieStore = await cookies()
  const adminCookie = cookieStore.get(ADMIN_COOKIE_NAME)
  return adminCookie?.value === ADMIN_TOKEN_VALUE
}

export function getAdminCookieConfig() {
  const isProduction = process.env.NODE_ENV === "production"
  const rootDomain = process.env.COOKIE_DOMAIN
  
  return {
    name: ADMIN_COOKIE_NAME,
    value: ADMIN_TOKEN_VALUE,
    httpOnly: true,
    secure: isProduction,
    sameSite: "strict" as const,
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
    ...(isProduction && rootDomain ? { domain: rootDomain } : {}),
  }
}