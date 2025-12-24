import { NextResponse } from "next/server"
import { sdk } from "@lib/config"

export async function GET() {
  try {
    const { regions } = await sdk.client.fetch<{ regions: any[] }>("/store/regions", {
      method: "GET",
    })

    return NextResponse.json({ regions })
  } catch (error) {
    console.log("API /regions error:", error)
    return NextResponse.json({ regions: null })
  }
}
