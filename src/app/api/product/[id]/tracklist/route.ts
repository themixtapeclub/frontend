// frontend/src/app/api/products/[id]/tracklist/route.ts
import { NextRequest, NextResponse } from "next/server"

const BACKEND_URL = process.env.MEDUSA_BACKEND_URL || process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"
const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ""

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  if (!id) {
    return NextResponse.json({ error: "Product ID is required" }, { status: 400 })
  }

  try {
    const body = await request.json()
    const response = await fetch(`${BACKEND_URL}/store/products/${id}/tracklist`, {
      method: "PUT",
      headers: { 
        "Content-Type": "application/json",
        "x-publishable-api-key": PUBLISHABLE_KEY,
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return NextResponse.json(
        { error: errorData.error || "Failed to update tracklist" },
        { status: response.status }
      )
    }

    return NextResponse.json(await response.json())
  } catch (error: any) {
    console.error("Tracklist update proxy error:", error.message)
    return NextResponse.json({ error: "Failed to update tracklist" }, { status: 500 })
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  if (!id) {
    return NextResponse.json({ error: "Product ID is required" }, { status: 400 })
  }

  try {
    const response = await fetch(`${BACKEND_URL}/store/products/${id}/tracklist`, {
      headers: { 
        "Content-Type": "application/json",
        "x-publishable-api-key": PUBLISHABLE_KEY,
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return NextResponse.json(
        { error: errorData.error || "Failed to fetch tracklist" },
        { status: response.status }
      )
    }

    return NextResponse.json(await response.json())
  } catch (error: any) {
    console.error("Tracklist fetch proxy error:", error.message)
    return NextResponse.json({ error: "Failed to fetch tracklist" }, { status: 500 })
  }
}
