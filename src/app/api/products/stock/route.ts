// frontend/src/app/api/products/stock/route.ts
import { NextRequest, NextResponse } from "next/server"

const MEDUSA_BACKEND_URL = process.env.MEDUSA_BACKEND_URL || "http://localhost:9000"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const handles = searchParams.get('handles')?.split(',') || []
  
  if (handles.length === 0) {
    return NextResponse.json({ stock: {} })
  }
  
  const stock: Record<string, boolean> = {}
  
  try {
    const response = await fetch(`${MEDUSA_BACKEND_URL}/store/products/stock-check`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-publishable-api-key': process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || '',
      },
      body: JSON.stringify({ handles }),
    })
    
    if (response.ok) {
      const data = await response.json()
      return NextResponse.json({ stock: data.stock || {} })
    }
  } catch (error) {
    console.error('Stock check via backend failed, falling back to direct DB')
  }
  
  return NextResponse.json({ stock })
}
