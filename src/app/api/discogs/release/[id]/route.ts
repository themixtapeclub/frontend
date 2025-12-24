// frontend/src/app/api/discogs/release/[id]/route.ts
import { NextRequest, NextResponse } from "next/server"

const BACKEND_URL = process.env.MEDUSA_BACKEND_URL || process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"
const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ""

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  if (!id) {
    return NextResponse.json({ error: "Discogs release ID is required" }, { status: 400 })
  }

  try {
    
    const response = await fetch(`${BACKEND_URL}/store/discogs/release/${id}`, {
      headers: { 
        "Content-Type": "application/json",
        "x-publishable-api-key": PUBLISHABLE_KEY,
      },
      next: { revalidate: 3600 },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('[API] Backend error:', response.status, errorData)
      return NextResponse.json(
        { error: errorData.error || "Failed to fetch Discogs release" },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error: any) {
    console.error("[API] Discogs proxy error:", error.message)
    return NextResponse.json({ error: "Failed to fetch Discogs release" }, { status: 500 })
  }
}
