// frontend/src/modules/cart/templates/preview.tsx

"use client"

import { HttpTypes } from "@medusajs/types"
import { clx } from "@medusajs/ui"
import { useMemo } from "react"
import { convertToLocale } from "@lib/util/money"
import { useProductFormats } from "@lib/hooks/use-product-formats"
import { useProductDetails, ProductDetails } from "@lib/hooks/use-product-details"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Thumbnail from "@modules/products/components/thumbnail"

type ItemsTemplateProps = {
  cart: HttpTypes.StoreCart
}

function getConditionDisplay(
  cartQuantity: number,
  details: ProductDetails | undefined
): string | null {
  if (!details) return null

  const { condition_media, condition_sleeve, inventory_quantity } = details

  if (!condition_media) return null

  const isMint = ["M", "Mint", "MINT", "m", "mint"].includes(condition_media)
  const remaining = inventory_quantity - cartQuantity

  const formatSleeve = (sleeve: string | null): string => {
    if (!sleeve) return ""
    if (sleeve === "NM" || sleeve === "Near Mint") return "NM"
    return sleeve
  }

  if (isMint) {
    if (remaining > 0) {
      return "New"
    } else {
      const sleeveDisplay = condition_sleeve ? ` / Sleeve: ${formatSleeve(condition_sleeve)}` : ""
      if (cartQuantity === 1) {
        return `Media: NM${sleeveDisplay}`
      } else {
        return `${cartQuantity - 1}× New   1× Media: NM${sleeveDisplay} (Shop Copy)`
      }
    }
  } else {
    const sleeveDisplay = condition_sleeve ? ` / Sleeve: ${condition_sleeve}` : ""
    return `Media: ${condition_media}${sleeveDisplay}`
  }
}

const ItemsPreviewTemplate = ({ cart }: ItemsTemplateProps) => {
  const items = cart.items
  const hasOverflow = items && items.length > 4

  const productIds = useMemo(
    () => items?.map(item => item.product_id).filter(Boolean) as string[] || [],
    [items]
  )
  const formats = useProductFormats(productIds)

  const productHandles = useMemo(
    () => items?.map(item => item.product_handle).filter(Boolean) as string[] || [],
    [items]
  )
  const productDetails = useProductDetails(productHandles)

  return (
    <div
      className={clx("checkout-items", {
        "overflow-y-auto max-h-[420px]": hasOverflow,
      })}
    >
      <ul className="checkout-items-list">
        {items
          ?.sort((a, b) => ((a.created_at ?? "") > (b.created_at ?? "") ? -1 : 1))
          .map((item) => {
            const handle = item.product_handle
            const details = handle ? productDetails[handle] : undefined
            const artist = details?.artist?.[0] || null
            const conditionDisplay = getConditionDisplay(item.quantity, details)

            return (
              <li key={item.id} className="cart-item" data-testid="cart-item">
                <LocalizedClientLink
                  href={`/product/${item.product_handle}`}
                  className="cart-item-link"
                >
                  <div className="cart-item-thumbnail">
                    <Thumbnail
                      thumbnail={item.thumbnail}
                      images={item.variant?.product?.images}
                      format={item.product_id ? formats[item.product_id] : null}
                      size="square"
                    />
                  </div>
                  <div className="cart-item-details">
                    <div className="artist-title">
                      {artist && <span className="artist">{artist}</span>}
                      <span className="title">{item.title}</span>
                    </div>
                    {conditionDisplay && (
                      <span className="cart-item-condition">
                        {conditionDisplay}
                      </span>
                    )}
                    {item.quantity > 1 && (
                      <span className="cart-item-quantity">
                        Qty: {item.quantity}
                      </span>
                    )}
                  </div>
                </LocalizedClientLink>
                <div className="cart-item-right">
                  <span data-testid="cart-item-price">
                    {convertToLocale({
                      amount: (item as any).subtotal ?? item.total ?? 0,
                      currency_code: cart.currency_code,
                    })}
                  </span>
                </div>
              </li>
            )
          })}
      </ul>
    </div>
  )
}

export default ItemsPreviewTemplate
