// frontend/src/lib/hooks/use-product-formats.ts
"use client"

import { useEffect, useState } from "react"

const MEDUSA_BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"
const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ""

const formatsCache: Record<string, string[]> = {}

export function useProductFormats(productIds: string[]) {
  const [formats, setFormats] = useState<Record<string, string[]>>(formatsCache)

  useEffect(() => {
    const uncachedIds = productIds.filter(id => !(id in formatsCache))
    
    if (uncachedIds.length === 0) {
      return
    }

    fetch(`${MEDUSA_BACKEND_URL}/store/products/formats`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "x-publishable-api-key": PUBLISHABLE_KEY,
      },
      body: JSON.stringify({ productIds: uncachedIds }),
    })
      .then(res => res.json())
      .then(data => {
        Object.assign(formatsCache, data.formats)
        setFormats({ ...formatsCache })
      })
      .catch(err => console.error("Formats fetch error:", err))
  }, [productIds.join(",")])

  return formats
}