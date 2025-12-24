// src/modules/products/components/product-actions/index.tsx
"use client"

import { addToCart } from "@lib/data/cart"
import { useIntersection } from "@lib/hooks/use-in-view"
import { HttpTypes } from "@medusajs/types"
import Button from "@modules/common/components/button"
import NotifyMeForm from "@modules/products/components/notify-me-form"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Image from "next/image"
import { useEffect, useMemo, useRef, useState } from "react"
import ProductPrice from "../product-price"
import MobileActions from "./mobile-actions"

type ProductActionsProps = {
  product: HttpTypes.StoreProduct & { selectedVariant?: any }
  region: HttpTypes.StoreRegion
  countryCode: string
  disabled?: boolean
  customer?: { id: string; email: string } | null
}

export default function ProductActions({
  product,
  countryCode,
  disabled,
  customer,
}: ProductActionsProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [cartQuantity, setCartQuantity] = useState(0)

  const variants = product.variants || []
  const selectedVariant = (product as any).selectedVariant || variants[0]
  const otherVariantsInStock = variants.filter(
    v => v.id !== selectedVariant?.id && (v.inventory_quantity || 0) > 0
  )

  const fetchCartQuantity = async () => {
    try {
      const res = await fetch("/api/cart")
      if (res.ok) {
        const data = await res.json()
        const cart = data.cart as HttpTypes.StoreCart | null
        if (cart?.items) {
          const itemInCart = cart.items.find(
            (item) => item.variant_id === selectedVariant?.id
          )
          setCartQuantity(itemInCart?.quantity || 0)
        }
      }
    } catch (e) {
      console.error("Failed to fetch cart", e)
    }
  }

  useEffect(() => {
    fetchCartQuantity()
    
    const handleCartUpdate = () => fetchCartQuantity()
    window.addEventListener("cart-updated", handleCartUpdate)
    return () => window.removeEventListener("cart-updated", handleCartUpdate)
  }, [selectedVariant?.id])

  const inventoryQuantity = selectedVariant?.inventory_quantity ?? 0
  const remainingStock = inventoryQuantity - cartQuantity
  const allInCart = cartQuantity > 0 && remainingStock <= 0

  const inStock = useMemo(() => {
    if (!selectedVariant) return false
    
    const p = product as any
    
    if (p.stock !== undefined && p.stock <= 0) return false
    if (p.inStock === false) return false
    
    const variantQty = selectedVariant.inventory_quantity
    if (typeof variantQty === 'number' && variantQty <= 0) return false
    
    if (typeof variantQty === 'number' && variantQty > 0) return true
    
    if (selectedVariant.manage_inventory === false) return true
    if (selectedVariant.allow_backorder) return true
    
    return false
  }, [selectedVariant, product])

  const canAddMore = inStock && remainingStock > 0

  const actionsRef = useRef<HTMLDivElement>(null)
  const inView = useIntersection(actionsRef, "0px")

  const handleAddToCart = async () => {
    if (!selectedVariant?.id) return null

    setIsAdding(true)
    
    window.dispatchEvent(new Event("cart-open"))

    await addToCart({
      variantId: selectedVariant.id,
      quantity: 1,
      countryCode,
    })

    setIsAdding(false)
    
    window.dispatchEvent(new Event("cart-updated"))
  }

  const handleOpenCart = () => {
    window.dispatchEvent(new Event("open-cart"))
  }

  const showNotifyForm = !inStock && !allInCart

  const formatPrice = (variant: any) => {
    const price = variant.calculated_price?.calculated_amount || variant.price_usd || 0
    return `$${parseFloat(price).toFixed(0)}`
  }

  const getSku5 = (sku: string) => sku?.slice(-5) || ''

  const getPlaceholderImage = () => {
    const format = (product as any).format || []
    const formatLower = format.map((f: string) => f.toLowerCase())
    
    const isCassette = formatLower.some((f: string) => f.includes("cassette"))
    const isCD = formatLower.some((f: string) => f.includes("cd"))
    
    if (isCassette) return "/static/noimageplaceholder-cassette.jpg"
    if (isCD) return "/static/noimageplaceholder-cd.jpg"
    return "/static/noimageplaceholder.jpg"
  }

  const getVariantImage = (variant: any) => {
    return variant.image_main_url || getPlaceholderImage()
  }

  return (
    <>
      <div className="flex flex-col" ref={actionsRef}>
        <div className="flex flex-col gap-y-4 p-3">
          {showNotifyForm ? (
            <NotifyMeForm product={product} variant={selectedVariant} />
          ) : allInCart ? (
            <Button
              onClick={handleOpenCart}
              variant="secondary"
              size="base"
              className="w-full"
              style={{ backgroundColor: '#22c55e', borderColor: '#22c55e', color: '#fff' }}
              data-testid="in-cart-button"
            >
              {cartQuantity === 1 ? 'In Cart' : `${cartQuantity} in Cart`}
            </Button>
          ) : (
            <Button
              onClick={handleAddToCart}
              disabled={!canAddMore || !selectedVariant || !!disabled || isAdding}
              variant="primary"
              size="base"
              className="w-full"
              isLoading={isAdding}
              data-testid="add-product-button"
            >
              Add to cart
            </Button>
          )}

          {inStock && selectedVariant && <ProductPrice product={product} variant={selectedVariant} />}
        </div>

        {otherVariantsInStock.length > 0 && (
          <>
            <div className="h-px bg-black w-full" />
            <div className="p-3">
              <span className="text-sm font-medium">Other versions:</span>
              <div className="flex flex-wrap gap-3 mt-2">
                {otherVariantsInStock.map((variant) => {
                  const v = variant as any
                  const variantImage = getVariantImage(v)
                  const conditionParts = []
                  if (v.condition_media) conditionParts.push(v.condition_media)
                  if (v.condition_sleeve) conditionParts.push(v.condition_sleeve)
                  conditionParts.push(formatPrice(v))
                  
                  return (
                    <LocalizedClientLink
                      key={variant.id}
                      href={`/product/${product.handle}/${getSku5(variant.sku || '')}`}
                      className="w-20 hover:opacity-80 transition-opacity"
                    >
                      <div className="w-20 h-20 bg-gray-100 relative">
                        <Image
                          src={variantImage}
                          alt={v.condition_media || 'Variant'}
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                      </div>
                      <div className="mt-1">
                        <div className="text-xs font-bold line-clamp-1">
                          {product.title}
                        </div>
                        <div className="text-xs">
                          {conditionParts.join(', ')}
                        </div>
                      </div>
                    </LocalizedClientLink>
                  )
                })}
              </div>
            </div>
          </>
        )}

        <MobileActions
          product={product}
          variant={selectedVariant}
          options={{}}
          updateOptions={() => {}}
          inStock={canAddMore}
          handleAddToCart={handleAddToCart}
          isAdding={isAdding}
          show={!inView}
          optionsDisabled={!!disabled || isAdding}
        />
      </div>
    </>
  )
}