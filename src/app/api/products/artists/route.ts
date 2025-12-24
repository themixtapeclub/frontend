// frontend/src/app/api/products/artists/route.ts
import { NextRequest, NextResponse } from "next/server"
import { sdk } from "@lib/config"
import { getRegionFromCookie } from "@lib/data/region-cookie"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const handles = searchParams.get('handles')?.split(',') || []
  
  if (handles.length === 0) {
    return NextResponse.json({ artists: {} })
  }
  
  const artists: Record<string, string> = {}
  const region = await getRegionFromCookie()
  
  if (!region) {
    return NextResponse.json({ artists: {} })
  }
  
  try {
    for (const handle of handles) {
      const { products } = await sdk.store.product.list({
        handle,
        region_id: region.id,
        fields: "metadata"
      })
      
      const product = products?.[0]
      if (product?.metadata?.artist) {
        const artistData = product.metadata.artist
        if (Array.isArray(artistData)) {
          artists[handle] = artistData.join(', ')
        } else if (typeof artistData === 'string') {
          artists[handle] = artistData
        }
      }
    }
  } catch (error) {
    console.error('Failed to fetch artists:', error)
  }
  
  return NextResponse.json({ artists })
}
