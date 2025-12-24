// src/modules/checkout/templates/checkout-form/index.tsx
import { listCartShippingMethods } from "@lib/data/fulfillment"
import { listCartPaymentMethods } from "@lib/data/payment"
import { HttpTypes } from "@medusajs/types"
import Addresses from "@modules/checkout/components/addresses"
import Payment from "@modules/checkout/components/payment"
import Review from "@modules/checkout/components/review"
import Shipping from "@modules/checkout/components/shipping"
import StepRedirect from "@modules/checkout/components/step-redirect"

export default async function CheckoutForm({
  cart,
  customer,
}: {
  cart: HttpTypes.StoreCart | null
  customer: HttpTypes.StoreCustomer | null
}) {
  if (!cart) {
    return null
  }
  const shippingMethods = await listCartShippingMethods(cart.id)
  const paymentMethods = await listCartPaymentMethods(cart.region?.id ?? "")
  if (!shippingMethods || !paymentMethods) {
    return null
  }
  return (
    <div className="w-full">
      <StepRedirect cart={cart} />
      <div className="p-4 border-b border-black">
        <Addresses cart={cart} customer={customer} />
      </div>
      <div className="p-4 border-b border-black">
        <Shipping cart={cart} availableShippingMethods={shippingMethods} />
      </div>
      <div className="p-4 border-b border-black">
        <Payment cart={cart} availablePaymentMethods={paymentMethods} />
      </div>
      <div className="p-4">
        <Review cart={cart} />
      </div>
    </div>
  )
}