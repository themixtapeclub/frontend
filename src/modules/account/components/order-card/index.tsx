// frontend/src/modules/account/components/order-card/index.tsx
"use client"

import { useMemo, useEffect, useState } from "react"
import Thumbnail from "@modules/products/components/thumbnail"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { convertToLocale } from "@lib/util/money"
import { HttpTypes } from "@medusajs/types"

type OrderCardProps = {
  order: HttpTypes.StoreOrder
}

const OrderCard = ({ order }: OrderCardProps) => {
  const [artists, setArtists] = useState<Record<string, string>>({})

  const numberOfLines = useMemo(() => {
    return (
      order.items?.reduce((acc, item) => {
        return acc + item.quantity
      }, 0) ?? 0
    )
  }, [order])

  const numberOfProducts = useMemo(() => {
    return order.items?.length ?? 0
  }, [order])

  useEffect(() => {
    const handles = order.items
      ?.map((item: any) => item.product?.handle)
      .filter(Boolean) || []
    
    if (handles.length > 0) {
      fetch(`/api/products/artists?handles=${handles.join(',')}`)
        .then(r => r.json())
        .then(data => setArtists(data.artists || {}))
        .catch(() => {})
    }
  }, [order.items])

  return (
    <LocalizedClientLink 
      href={`/account/orders/details/${order.id}`}
      className="block hover:bg-black hover:text-white transition-colors group"
      data-testid="order-card"
    >
      <div className="px-4 py-2 text-small">
        <div className="flex items-center justify-between">
          <div className="mono">
            #<span data-testid="order-display-id">{order.display_id}</span>
          </div>
          <div className="flex items-center gap-x-2 text-ui-fg-subtle group-hover:text-gray-300">
            <span data-testid="order-created-at">
              {new Date(order.created_at).toDateString()}
            </span>
            <span data-testid="order-amount">
              {convertToLocale({
                amount: order.total,
                currency_code: order.currency_code,
              })}
            </span>
            <span>{`${numberOfLines} ${numberOfLines > 1 ? "items" : "item"}`}</span>
          </div>
        </div>
      </div>
      <div>
        {order.items?.slice(0, 4).map((item, index) => {
          const handle = (item as any).product?.handle
          const artist = handle ? artists[handle] : null
          return (
            <div
              key={item.id}
              className="flex items-center border-t border-black"
              data-testid="order-item"
            >
              <div className="w-10 h-10 flex-shrink-0">
                <Thumbnail thumbnail={item.thumbnail} images={[]} size="full" />
              </div>
              <div className="px-3 py-1 text-small">
                {artist && <span>{artist} </span>}
                <span className="mono bold">{item.product_title}</span>
              </div>
            </div>
          )
        })}
        {numberOfProducts > 4 && (
          <div className="px-4 py-2 text-small text-ui-fg-subtle group-hover:text-gray-300 border-t border-black">
            +{numberOfProducts - 4} more items
          </div>
        )}
      </div>
    </LocalizedClientLink>
  )
}

export default OrderCard
