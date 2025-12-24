// src/modules/checkout/components/review/index.tsx
"use client"
import { isStripe, isPaypal } from "@lib/constants"
import { Heading, Text, clx } from "@medusajs/ui"
import PaymentButton from "../payment-button"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { useEffect } from "react"

const Review = ({ cart }: { cart: any }) => {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const currentStep = searchParams.get("step")
  
  const paymentSession = cart.payment_collection?.payment_sessions?.find(
    (s: any) => s.status === "pending"
  )
  
  const paidByGiftcard =
    cart?.gift_cards && cart?.gift_cards?.length > 0 && cart?.total === 0

  const hasShippingAddress = Boolean(cart.shipping_address)
  const hasShippingMethod = cart.shipping_methods?.length > 0
  const hasPaymentCollection = Boolean(cart.payment_collection || paidByGiftcard)
  
  const isStripePayment = isStripe(paymentSession?.provider_id)
  const isPaypalPayment = isPaypal(paymentSession?.provider_id)

  const hasValidPaymentSession = Boolean(
    paymentSession && 
    (isStripePayment ? paymentSession.data?.client_secret : true)
  )

  const previousStepsCompleted =
    hasShippingAddress &&
    hasShippingMethod &&
    hasPaymentCollection

  const isOpen = currentStep === "review"

  const canShowReview = isOpen && previousStepsCompleted && hasValidPaymentSession

  useEffect(() => {
    if (currentStep !== "review") return

    if (!hasShippingAddress) {
      router.push(pathname + "?step=address", { scroll: false })
    } else if (!hasShippingMethod) {
      router.push(pathname + "?step=delivery", { scroll: false })
    } else if (!hasPaymentCollection || !hasValidPaymentSession) {
      router.push(pathname + "?step=payment", { scroll: false })
    }
  }, [currentStep, hasShippingAddress, hasShippingMethod, hasPaymentCollection, hasValidPaymentSession, router, pathname])

  if (!currentStep) {
    return null
  }

  return (
    <div className="bg-white">
      <div className="flex flex-row items-center justify-between mb-6">
        <Heading
          level="h2"
          className={clx(
            "flex flex-row text-3xl-regular gap-x-2 items-baseline",
            {
              "opacity-50 pointer-events-none select-none": !canShowReview,
            }
          )}
        >
          Review
        </Heading>
      </div>
      {canShowReview && (
        <>
          <div className="flex items-start gap-x-1 w-full mb-6">
            <div className="w-full">
              <Text className="txt-medium-plus text-ui-fg-base mb-1">
                By clicking the {isPaypalPayment ? "PayPal button" : "Place Order button"}, you confirm that you have
                read, understand and accept our Terms of Use, Terms of Sale and
                Returns Policy and acknowledge that you have read our
                Privacy Policy.
              </Text>
            </div>
          </div>
          <PaymentButton cart={cart} data-testid="submit-order-button" />
        </>
      )}
    </div>
  )
}

export default Review