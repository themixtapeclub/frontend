// frontend/src/modules/order/components/item/index.tsx
import { convertToLocale } from "@lib/util/money"
import { HttpTypes } from "@medusajs/types"
import Thumbnail from "@modules/products/components/thumbnail"

type ItemProps = {
  item: HttpTypes.StoreCartLineItem | HttpTypes.StoreOrderLineItem
  currencyCode: string
  artist?: string[] | null
}

const Item = ({ item, currencyCode, artist }: ItemProps) => {
  const unitPrice = item.unit_price ?? 0
  const totalPrice = unitPrice * item.quantity

  return (
    <div className="flex w-full border-b border-black" data-testid="product-row">
      <div className="w-16 h-16 flex-shrink-0">
        <Thumbnail thumbnail={item.thumbnail} size="square" />
      </div>

      <div className="flex flex-1 justify-between py-2 px-4">
        <div className="flex flex-col">
          {artist && artist.length > 0 && (
            <span>
              {artist.join(", ")}
            </span>
          )}
          <span className="font-bold" data-testid="product-name">
            {item.product_title}
          </span>
        </div>

        <div className="flex flex-col items-end">
          {item.quantity > 1 ? (
            <>
              <span className="text-neutral-500">
                <span data-testid="product-quantity">{item.quantity}</span>
                {" x "}
                {convertToLocale({ amount: unitPrice, currency_code: currencyCode })}
              </span>
              <span data-testid="product-total">
                {convertToLocale({ amount: totalPrice, currency_code: currencyCode })}
              </span>
            </>
          ) : (
            <span data-testid="product-total">
              {convertToLocale({ amount: unitPrice, currency_code: currencyCode })}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

export default Item
