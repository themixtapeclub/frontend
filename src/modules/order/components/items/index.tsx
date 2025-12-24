// frontend/src/modules/order/components/items/index.tsx
"use client"
import { HttpTypes } from "@medusajs/types"
import { useProductDetails } from "@lib/hooks/use-product-details"
import Item from "@modules/order/components/item"

type ItemsProps = {
  order: HttpTypes.StoreOrder
}

const Items = ({ order }: ItemsProps) => {
  const items = order.items

  const handles = items?.map(item => (item as any).product?.handle).filter(Boolean) || []
  const productDetails = useProductDetails(handles)

  return (
    <div className="flex flex-col border-t border-black">
      {items?.length
        ? items
            .sort((a, b) => {
              return (a.created_at ?? "") > (b.created_at ?? "") ? -1 : 1
            })
            .map((item) => {
              const handle = (item as any).product?.handle
              const details = handle ? productDetails[handle] : null
              return (
                <Item
                  key={item.id}
                  item={item}
                  currencyCode={order.currency_code}
                  artist={details?.artist}
                />
              )
            })
        : null}
    </div>
  )
}

export default Items
