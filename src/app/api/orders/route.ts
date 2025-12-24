import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { sdk } from "@lib/config"

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("_medusa_jwt")?.value

    console.log("API /orders - jwt cookie:", token ? token.substring(0, 30) : "NOT FOUND")

    if (!token) {
      return NextResponse.json({ orders: null })
    }

    const { orders } = await sdk.client.fetch<{ orders: any[] }>("/store/orders", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      query: {
        limit: 10,
        offset: 0,
        order: "-created_at",
        fields: "*items,+items.metadata,*items.variant,*items.product,+items.product.artist",
      },
    })

    console.log("API /orders - found:", orders?.length || 0, "orders")

    return NextResponse.json({ orders })
  } catch (error: any) {
    console.log("API /orders error:", error.message || error)
    return NextResponse.json({ orders: null })
  }
}
