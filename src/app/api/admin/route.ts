// src/app/api/admin/route.ts
import { NextRequest, NextResponse } from "next/server"
import { TOTP } from "otpauth"
import { getAdminCookieConfig } from "@lib/util/admin"

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD
const TOTP_SECRET = process.env.TOTP_SECRET

const rateLimitMap = new Map<string, { attempts: number; lockedUntil: number }>()
const MAX_ATTEMPTS = 5
const LOCKOUT_DURATION = 15 * 60 * 1000

function getClientIP(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  )
}

function checkRateLimit(ip: string): { allowed: boolean; remainingAttempts?: number; lockedFor?: number } {
  const now = Date.now()
  const record = rateLimitMap.get(ip)

  if (!record) {
    return { allowed: true, remainingAttempts: MAX_ATTEMPTS }
  }

  if (record.lockedUntil > now) {
    return { allowed: false, lockedFor: Math.ceil((record.lockedUntil - now) / 1000) }
  }

  if (record.lockedUntil <= now && record.attempts >= MAX_ATTEMPTS) {
    rateLimitMap.delete(ip)
    return { allowed: true, remainingAttempts: MAX_ATTEMPTS }
  }

  return { allowed: true, remainingAttempts: MAX_ATTEMPTS - record.attempts }
}

function recordFailedAttempt(ip: string): void {
  const now = Date.now()
  const record = rateLimitMap.get(ip) || { attempts: 0, lockedUntil: 0 }
  
  record.attempts += 1
  
  if (record.attempts >= MAX_ATTEMPTS) {
    record.lockedUntil = now + LOCKOUT_DURATION
  }
  
  rateLimitMap.set(ip, record)
}

function clearAttempts(ip: string): void {
  rateLimitMap.delete(ip)
}

function verifyTOTP(token: string): boolean {
  if (!TOTP_SECRET) return false
  
  const totp = new TOTP({
    secret: TOTP_SECRET,
    algorithm: "SHA1",
    digits: 6,
    period: 30,
  })
  
  const delta = totp.validate({ token, window: 1 })
  return delta !== null
}

export async function POST(request: NextRequest) {
  const ip = getClientIP(request)
  const rateCheck = checkRateLimit(ip)

  if (!rateCheck.allowed) {
    return NextResponse.json(
      { error: `Too many attempts. Try again in ${rateCheck.lockedFor} seconds` },
      { status: 429 }
    )
  }

  if (!ADMIN_PASSWORD || !TOTP_SECRET) {
    return NextResponse.json({ error: "Admin not configured" }, { status: 500 })
  }

  const body = await request.json()
  const { password, code } = body

  if (password !== ADMIN_PASSWORD) {
    recordFailedAttempt(ip)
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
  }

  if (!code || !verifyTOTP(code)) {
    recordFailedAttempt(ip)
    return NextResponse.json({ error: "Invalid code" }, { status: 401 })
  }

  clearAttempts(ip)
  
  const config = getAdminCookieConfig()
  const response = NextResponse.json({ success: true })
  response.cookies.set(config)
  return response
}

export async function DELETE() {
  const response = NextResponse.json({ success: true })
  response.cookies.set({
    name: "_tmc_admin",
    value: "",
    maxAge: 0,
    path: "/",
  })
  return response
}

export async function GET(request: NextRequest) {
  const adminCookie = request.cookies.get("_tmc_admin")
  const isAdmin = adminCookie?.value === "authenticated"
  return NextResponse.json({ isAdmin })
}