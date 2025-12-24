// frontend/src/modules/account/components/wantlist/index.tsx
"use client"

import { useState, useEffect, useTransition } from "react"
import Image from "next/image"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { getWantlist, removeFromWantlist } from "@lib/data/wantlist"
import Spinner from "@modules/common/icons/spinner"
import Button from "@modules/common/components/button"

interface WantlistItem {
  product_id: string
  variant_id?: string
  product_title: string
  variant_title?: string
  product_handle: string
  product_image?: string
  artist?: string
  added_at: string
  in_stock?: boolean
}

export default function Wantlist() {
  const [items, setItems] = useState<WantlistItem[]>([])
  const [loading, setLoading] = useState(true)
  const [removing, setRemoving] = useState<string | null>(null)
  const [adding, setAdding] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    fetchWantlist()
  }, [])

  const fetchWantlist = async () => {
    const wantlist = await getWantlist()
    const sorted = [...wantlist].sort((a, b) => {
      if (a.in_stock === b.in_stock) return 0
      return a.in_stock ? -1 : 1
    })
    setItems(sorted)
    setLoading(false)
  }

  const handleRemove = (productId: string, variantId?: string) => {
    const key = variantId ? `${productId}:${variantId}` : productId
    setRemoving(key)

    startTransition(async () => {
      const result = await removeFromWantlist({
        product_id: productId,
        variant_id: variantId,
      })

      if (result.success) {
        setItems(items.filter(item => {
          const itemKey = item.variant_id ? `${item.product_id}:${item.variant_id}` : item.product_id
          return itemKey !== key
        }))
      }
      setRemoving(null)
    })
  }

const handleAddToCart = async (item: WantlistItem) => {
    if (!item.variant_id) return
    
    const key = `${item.product_id}:${item.variant_id}`
    setAdding(key)

    console.log("wantlist: adding to cart", item.variant_id)

    try {
      const response = await fetch('/api/cart/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          variantId: item.variant_id,
          quantity: 1,
        }),
      })
      
      console.log("wantlist: response status", response.status)
      
      if (response.ok) {
        console.log("wantlist: dispatching events")
        window.dispatchEvent(new Event('cart-updated'))
        window.dispatchEvent(new Event('cart-open'))
      }
    } catch (error) {
      console.error('Failed to add to cart:', error)
    }
    
    setAdding(null)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 border-t border-black">
        <Spinner />
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="px-4 py-8 border-t border-black text-sm text-neutral-500">
        No items on your wantlist.
      </div>
    )
  }

  return (
    <div className="w-full border-t border-black">
      {items.map((item) => {
        const key = item.variant_id ? `${item.product_id}:${item.variant_id}` : item.product_id
        const inStock = item.in_stock === true
        const isAdding = adding === key
        const isRemoving = removing === key
        
        return (
          <div 
            key={key}
            className={`flex items-center border-b border-black hover:bg-black hover:text-white transition-colors group ${!inStock ? 'opacity-50' : ''}`}
          >
            <LocalizedClientLink 
              href={`/product/${item.product_handle}`}
              className="flex items-center flex-1"
            >
              {item.product_image && (
                <div className="w-16 h-16 flex-shrink-0">
                  <Image
                    src={item.product_image}
                    alt={item.product_title}
                    width={64}
                    height={64}
                    className="object-cover w-full h-full"
                  />
                </div>
              )}
              <div className="flex-grow min-w-0 px-4 py-2">
                <div>
                  {item.artist && <span>{item.artist} </span>}
                  <span className="mono bold">{item.product_title}</span>
                </div>
                {inStock && (
                  <div className="text-small text-green-600 group-hover:text-green-400">In stock</div>
                )}
              </div>
            </LocalizedClientLink>
            <div className="flex items-center gap-x-3 pr-4">
              {inStock && item.variant_id && (
                <Button
                  onClick={(e) => {
                    e.preventDefault()
                    handleAddToCart(item)
                  }}
                  disabled={isAdding || isPending}
                  variant="primary"
                  size="mini"
                  isLoading={isAdding}
                >
                  Add to cart
                </Button>
              )}
              <button
                onClick={() => handleRemove(item.product_id, item.variant_id)}
                disabled={isRemoving || isPending}
                className="text-xl text-neutral-400 group-hover:text-neutral-300 hover:!text-red-400 disabled:opacity-50"
              >
                {isRemoving ? "..." : "×"}
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
