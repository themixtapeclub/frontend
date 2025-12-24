// frontend/src/app/api/auth/login/route.ts

import { NextRequest, NextResponse } from "next/server"
import { sdk } from "@lib/config"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()
    
    console.log("API login - attempting with email:", email)
    
    const token = await sdk.auth.login("customer", "emailpass", { email, password }) as string
    
    console.log("API login - got token:", token?.substring(0, 30))
    
    const response = NextResponse.json({ success: true })
    
    response.cookies.set("_medusa_jwt", token, {
      maxAge: 60 * 60 * 24 * 7,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
    })
    
    console.log("API login - Set-Cookie header added")
    
    return response
  } catch (error: any) {
    console.log("API login - error:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Invalid credentials" },
      { status: 401 }
    )
  }
}