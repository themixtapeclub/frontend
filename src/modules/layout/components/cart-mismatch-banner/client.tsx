// src/modules/layout/components/cart-mismatch-banner/client.tsx
"use client"
import { useEffect, useState } from "react"
import { StoreCart, StoreCustomer } from "@medusajs/types"
import CartMismatchBanner from "./index"

export default function ClientCartMismatchBanner() {
  const [customer, setCustomer] = useState<StoreCustomer | null>(null)
  const [cart, setCart] = useState<StoreCart | null>(null)

  useEffect(() => {
    Promise.all([
      fetch('/api/customer').then(r => r.json()),
      fetch('/api/cart').then(r => r.json())
    ]).then(([customerData, cartData]) => {
      setCustomer(customerData.customer)
      setCart(cartData.cart)
    }).catch(() => {})
  }, [])

  if (!customer || !cart) return null

  return <CartMismatchBanner customer={customer} cart={cart} />
}
