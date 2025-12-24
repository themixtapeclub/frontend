// src/modules/layout/components/cart-button/index.tsx
"use client"
import { useEffect, useState } from "react"
import { HttpTypes } from "@medusajs/types"
import CartDropdown from "../cart-dropdown"
import { useScrollHeader } from "../header/scroll-header-provider"

export default function CartButton() {
  const [cart, setCart] = useState<HttpTypes.StoreCart | null>(null)
  const [forceOpen, setForceOpen] = useState(false)
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [keepOpen, setKeepOpen] = useState(false)
  const { shouldFade } = useScrollHeader()

  const fadeStyle = {
    opacity: shouldFade ? 0.25 : 1,
    filter: shouldFade ? 'blur(4px)' : 'blur(0px)',
    transition: 'opacity 0.3s ease, filter 0.3s ease',
  }

  const fetchCart = async () => {
    try {
      const res = await fetch("/api/cart")
      if (res.ok) {
        const data = await res.json()
        setCart(data.cart)
      }
    } catch (e) {
      console.error("Failed to fetch cart", e)
    }
  }

  useEffect(() => {
    fetchCart()
    
    const handleCartOpen = () => {
      setIsAddingToCart(true)
      setKeepOpen(true)
      setForceOpen(true)
    }
    
    const handleCartUpdate = () => {
      fetchCart().then(() => {
        setIsAddingToCart(false)
        setTimeout(() => setKeepOpen(false), 3000)
      })
    }
    
    window.addEventListener("cart-open", handleCartOpen)
    window.addEventListener("cart-updated", handleCartUpdate)
    
    return () => {
      window.removeEventListener("cart-open", handleCartOpen)
      window.removeEventListener("cart-updated", handleCartUpdate)
    }
  }, [])

  const totalItems = cart?.items?.reduce((acc, item) => acc + item.quantity, 0) || 0

  if (totalItems === 0 && !isAddingToCart) {
    return null
  }

  return (
    <li className="inline-flex items-center header-item-right" style={fadeStyle}>
      <CartDropdown 
        cart={cart} 
        forceOpen={forceOpen} 
        onForceOpenHandled={() => setForceOpen(false)}
        isAddingToCart={isAddingToCart}
        keepOpen={keepOpen}
      />
    </li>
  )
}