// src/modules/checkout/templates/checkout-summary/index.tsx
import { Heading } from "@medusajs/ui"
import ItemsPreviewTemplate from "@modules/cart/templates/preview"
import DiscountCode from "@modules/checkout/components/discount-code"
import CartTotals from "@modules/common/components/cart-totals"

const CheckoutSummary = ({ cart }: { cart: any }) => {
  return (
    <div className="h-full flex flex-col">
      <div className="pl-4 pr-6 py-4 border-b border-black">
        <Heading
          level="h2"
          className="flex flex-row text-3xl-regular items-baseline"
        >
          In your Cart
        </Heading>
      </div>
      <div className="flex-1 overflow-y-auto">
        <ItemsPreviewTemplate cart={cart} />
      </div>
      <div className="sticky bottom-0 bg-white">
        <CartTotals totals={cart} discountCode={<DiscountCode cart={cart} />} />
      </div>
    </div>
  )
}

export default CheckoutSummary