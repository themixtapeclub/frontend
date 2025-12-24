// @modules/common/components/cart-totals/index.tsx
"use client"
import { convertToLocale } from "@lib/util/money"
import React from "react"

type CartTotalsProps = {
  totals: {
    total?: number | null
    subtotal?: number | null
    tax_total?: number | null
    currency_code: string
    item_subtotal?: number | null
    shipping_subtotal?: number | null
    discount_subtotal?: number | null
    shipping_methods?: Array<{ name?: string; amount?: number }> | null
  }
  discountCode?: React.ReactNode
}

const CartTotals: React.FC<CartTotalsProps> = ({ totals, discountCode }) => {
  const {
    currency_code,
    tax_total,
    item_subtotal,
    shipping_subtotal,
    discount_subtotal,
    shipping_methods,
  } = totals

  const correctedShipping = shipping_subtotal ?? 0
  const correctedTotal = (item_subtotal ?? 0) + correctedShipping + (tax_total ?? 0) - (discount_subtotal ?? 0)

  const shippingMethod = shipping_methods?.[shipping_methods.length - 1]
  const isPickup = shippingMethod?.name?.toLowerCase().includes("pickup")
  const shippingLabel = isPickup ? "Local Pickup" : "Shipping"

  return (
    <div>
      <div className="border-t border-black" />
      <div className="flex flex-col gap-y-2 px-4 py-4">
        <div className="flex items-center justify-between">
          <span>Subtotal</span>
          <span className="mono" data-testid="cart-subtotal" data-value={item_subtotal || 0}>
            {convertToLocale({ amount: item_subtotal ?? 0, currency_code })}
          </span>
        </div>
        {shippingMethod && (
          <div className="flex items-center justify-between">
            <span>{shippingLabel}</span>
            <span className="mono" data-testid="cart-shipping" data-value={shipping_subtotal || 0}>
              {correctedShipping > 0 && convertToLocale({ amount: correctedShipping, currency_code })}
            </span>
          </div>
        )}
        {!!discount_subtotal && (
          <div className="flex items-center justify-between">
            <span>Discount</span>
            <span className="mono" data-testid="cart-discount" data-value={discount_subtotal || 0}>
              -{convertToLocale({ amount: discount_subtotal ?? 0, currency_code })}
            </span>
          </div>
        )}
        {!!tax_total && (
          <div className="flex items-center justify-between">
            <span>Taxes</span>
            <span className="mono" data-testid="cart-taxes" data-value={tax_total || 0}>
              {convertToLocale({ amount: tax_total ?? 0, currency_code })}
            </span>
          </div>
        )}
        {discountCode && <div className="mt-2">{discountCode}</div>}
      </div>
      <div className="flex items-center justify-between px-4 py-4 bg-black text-white">
        <span>Total</span>
        <span className="mono text-large" data-testid="cart-total" data-value={correctedTotal || 0}>
          {convertToLocale({ amount: correctedTotal, currency_code })}
        </span>
      </div>
    </div>
  )
}

export default CartTotals