// src/app/api/revalidate/route.ts
import { revalidatePath } from "next/cache"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  const secret = request.headers.get("x-revalidate-secret")
  if (secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ error: "Invalid secret" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { type, handle } = body
    const revalidated: string[] = []

    if (type === "inventory" || type === "product") {
      revalidatePath("/")
      revalidatePath("/shop")
      revalidated.push("/", "/shop")
      
      if (handle) {
        revalidatePath(`/product/${handle}`)
        revalidated.push(`/product/${handle}`)
      }
    }

    if (type === "all") {
      revalidatePath("/", "layout")
      revalidated.push("/ (layout)")
    }

    return NextResponse.json({ revalidated, timestamp: Date.now() })
  } catch (err) {
    console.error("[Revalidate] Error:", err)
    return NextResponse.json({ error: "Revalidation failed" }, { status: 500 })
  }
}