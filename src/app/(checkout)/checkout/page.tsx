// frontend/src/app/(checkout)/checkout/page.tsx

import { retrieveCart } from "@lib/data/cart"
import { retrieveCustomer } from "@lib/data/customer"
import PaymentWrapper from "@modules/checkout/components/payment-wrapper"
import CheckoutForm from "@modules/checkout/templates/checkout-form"
import CheckoutSummary from "@modules/checkout/templates/checkout-summary"
import { Metadata } from "next"
import { notFound } from "next/navigation"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Checkout",
}
export default async function Checkout() {
  const cart = await retrieveCart()
  if (!cart) {
    return notFound()
  }
  const customer = await retrieveCustomer()
  return (
     <>
    <div className="w-full border-b border-black" />
    <div className="grid grid-cols-1 small:grid-cols-[1fr_1px_416px] w-full flex-1">
      <PaymentWrapper cart={cart}>
        <CheckoutForm cart={cart} customer={customer} />
      </PaymentWrapper>
      <div className="hidden small:block bg-black" />
      <CheckoutSummary cart={cart} />
    </div>
  </>
  )
}
