// frontend/src/lib/hooks/use-cart-tracking.ts
"use client"

import { useEffect, useRef } from "react"
import { useBrevo } from "@lib/context/brevo-context"
import { HttpTypes } from "@medusajs/types"

export function useCartTracking(cart: HttpTypes.StoreCart | null) {
  const { trackCartUpdated } = useBrevo()
  const prevItemsRef = useRef<string>("")

  useEffect(() => {
    if (!cart?.items?.length) return

    // Create a fingerprint of current cart items
    const itemsFingerprint = cart.items
      .map(item => `${item.variant_id}:${item.quantity}`)
      .sort()
      .join(",")

    // Only track if cart changed
    if (itemsFingerprint === prevItemsRef.current) return
    prevItemsRef.current = itemsFingerprint

    const items = cart.items.map(item => ({
      id: item.variant_id || item.id,
      name: item.title || item.product_title || "",
      price: (item.unit_price || 0) / 100,
      quantity: item.quantity,
      url: item.product_handle 
        ? `${window.location.origin}/product/${item.product_handle}` 
        : "",
      image: item.thumbnail || "",
    }))

    const total = (cart.total || 0) / 100

    // Get email if customer is logged in
    const email = cart.email || undefined

    trackCartUpdated(cart.id, items, total, email)
  }, [cart, trackCartUpdated])
}