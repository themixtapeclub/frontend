// src/lib/hooks/use-product-details.ts
"use client"
import { useEffect, useState, useCallback } from "react"

export type ProductDetails = {
  condition_media: string | null
  condition_sleeve: string | null
  inventory_quantity: number
  artist: string[] | null
}

const detailsCache: Record<string, ProductDetails> = {}
let pendingFetch: Promise<void> | null = null

async function fetchDetails(handles: string[]) {
  const uncachedHandles = handles.filter(h => h && !(h in detailsCache))
  if (uncachedHandles.length === 0) return

  try {
    const res = await fetch("/api/products/details", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ handles: uncachedHandles }),
    })
    const data = await res.json()
    if (data.details) {
      Object.assign(detailsCache, data.details)
    }
  } catch (err) {
    console.error("Product details fetch error:", err)
  }
}

export function prefetchProductDetails(handles: string[]) {
  const uncachedHandles = handles.filter(h => h && !(h in detailsCache))
  if (uncachedHandles.length > 0 && !pendingFetch) {
    pendingFetch = fetchDetails(uncachedHandles).finally(() => {
      pendingFetch = null
    })
  }
  return pendingFetch
}

export function useProductDetails(handles: string[]) {
  const [details, setDetails] = useState<Record<string, ProductDetails>>(() => {
    const initial: Record<string, ProductDetails> = {}
    handles.forEach(h => {
      if (h && detailsCache[h]) initial[h] = detailsCache[h]
    })
    return initial
  })

  useEffect(() => {
    const uncachedHandles = handles.filter(h => h && !(h in detailsCache))
    
    if (uncachedHandles.length === 0) {
      setDetails(prev => {
        const next: Record<string, ProductDetails> = {}
        handles.forEach(h => {
          if (h && detailsCache[h]) next[h] = detailsCache[h]
        })
        return next
      })
      return
    }

    fetchDetails(uncachedHandles).then(() => {
      setDetails(() => {
        const next: Record<string, ProductDetails> = {}
        handles.forEach(h => {
          if (h && detailsCache[h]) next[h] = detailsCache[h]
        })
        return next
      })
    })
  }, [handles.join(",")])

  return details
}