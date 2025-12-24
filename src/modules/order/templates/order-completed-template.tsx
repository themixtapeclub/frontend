// @modules/order/templates/order-completed-template/index.tsx
import { HttpTypes } from "@medusajs/types"
import { cookies as nextCookies } from "next/headers"
import CartTotals from "@modules/common/components/cart-totals"
import Help from "@modules/order/components/help"
import Items from "@modules/order/components/items"
import OnboardingCta from "@modules/order/components/onboarding-cta"
import ShippingDetails from "@modules/order/components/shipping-details"
import PaymentDetails from "@modules/order/components/payment-details"
import WantlistCleanup from "@modules/order/components/wantlist-cleanup"

type OrderCompletedTemplateProps = {
  order: HttpTypes.StoreOrder
}

export default async function OrderCompletedTemplate({
  order,
}: OrderCompletedTemplateProps) {
  const cookies = await nextCookies()
  const isOnboarding = cookies.get("_medusa_onboarding")?.value === "true"
  
  const orderItems = order.items?.map(item => ({
    product_id: item.product_id,
    variant_id: item.variant_id,
  })) || []
  
  return (
    <div className="font-mono text-sm">
      <WantlistCleanup orderItems={orderItems} />
      <div className="border-t border-black" />
      <div className="content-container flex justify-center">
        <div className="max-w-4xl w-full">
          <div className="border-l border-r border-black">
            <p className="mb-8 px-4 pt-4">
              Order #{order.display_id}
            </p>
            {isOnboarding && <div className="px-4"><OnboardingCta orderId={order.id} /></div>}
            <div className="mb-12 px-4" data-testid="order-complete-container">
              <p className="text-3xl mb-2">Your order was placed successfully.</p>
              <h1 className="text-3xl">Thank you!</h1>
            </div>
            <div>
              <Items order={order} />
              <CartTotals totals={order} />
              <ShippingDetails order={order} />
              <PaymentDetails order={order} />
              <Help />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
