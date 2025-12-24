// frontend/src/app/api/cart/add/route.ts
import { NextRequest, NextResponse } from "next/server"
import { addToCart } from "@lib/data/cart"
import { cookies } from "next/headers"

export async function POST(request: NextRequest) {
  try {
    const { variantId, quantity } = await request.json()
    
    console.log('Add to cart request:', { variantId, quantity })
    
    if (!variantId) {
      return NextResponse.json({ error: "Missing variantId" }, { status: 400 })
    }

    const cookieStore = await cookies()
    const countryCode = cookieStore.get("country_code")?.value || "us"
    
    console.log('Country code:', countryCode)
    
    await addToCart({
      variantId,
      quantity: quantity || 1,
      countryCode,
    })
    
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Add to cart error:", error)
    console.error("Error message:", error?.message)
    console.error("Error details:", JSON.stringify(error, null, 2))
    return NextResponse.json({ error: error?.message || "Failed to add to cart" }, { status: 500 })
  }
}
