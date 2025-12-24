// src/app/api/products/details/route.ts
import { NextRequest, NextResponse } from "next/server"

const MEDUSA_BACKEND_URL = process.env.MEDUSA_BACKEND_URL || "http://localhost:9000"
const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ""

export async function POST(request: NextRequest) {
  try {
    const { handles } = await request.json()
    
    if (!handles || !Array.isArray(handles) || handles.length === 0) {
      return NextResponse.json({ details: {} })
    }

    const res = await fetch(`${MEDUSA_BACKEND_URL}/store/products/details`, {
      method: "POST",
      headers: {
        "x-publishable-api-key": PUBLISHABLE_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ handles }),
      cache: "no-store",
    })

    if (res.ok) {
      const data = await res.json()
      return NextResponse.json({ details: data.details || {} })
    }

    return NextResponse.json({ details: {} })
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ details: {} })
  }
}