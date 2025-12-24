// src/modules/checkout/components/payment/index.tsx
"use client"

import { RadioGroup } from "@headlessui/react"
import { isStripe as isStripeFunc, isPaypal as isPaypalFunc, paymentInfoMap } from "@lib/constants"
import { initiatePaymentSession } from "@lib/data/cart"
import { CheckCircleSolid, Loader } from "@medusajs/icons"
import { Heading, Text, clx } from "@medusajs/ui"
import ErrorMessage from "@modules/checkout/components/error-message"
import PaymentContainer, {
  StripeCardContainer,
} from "@modules/checkout/components/payment-container"
import { useRouter, useSearchParams } from "next/navigation"
import { useCallback, useEffect, useState, useRef } from "react"

const Payment = ({
  cart,
  availablePaymentMethods,
}: {
  cart: any
  availablePaymentMethods: any[]
}) => {
  const activeSession = cart.payment_collection?.payment_sessions?.find(
    (paymentSession: any) => paymentSession.status === "pending"
  )

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cardBrand, setCardBrand] = useState<string | null>(null)
  const [cardComplete, setCardComplete] = useState(false)
  const stripeMethod = availablePaymentMethods.find((m: any) => isStripeFunc(m.id))
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(
    activeSession?.provider_id ?? stripeMethod?.id ?? ""
  )
  const initAttempted = useRef(false)
  const hasAutoAdvanced = useRef(false)

  const searchParams = useSearchParams()
  const router = useRouter()

  const isOpen = searchParams.get("step") === "payment"

  const sortedPaymentMethods = [...availablePaymentMethods].sort((a, b) => {
    if (isStripeFunc(a.id) && !isStripeFunc(b.id)) return -1
    if (!isStripeFunc(a.id) && isStripeFunc(b.id)) return 1
    return 0
  })

  const isStripe = isStripeFunc(selectedPaymentMethod)
  const isPaypal = isPaypalFunc(selectedPaymentMethod)
  const isActivePaypal = isPaypalFunc(activeSession?.provider_id)

  const setPaymentMethod = async (method: string) => {
    setError(null)
    setSelectedPaymentMethod(method)
    if (isStripeFunc(method) && activeSession?.provider_id !== method) {
      try {
        await initiatePaymentSession(cart, {
          provider_id: method,
        })
        window.location.reload()
      } catch (err: any) {
        setError(err.message)
      }
    }
  }

  const paidByGiftcard =
    cart?.gift_cards && cart?.gift_cards?.length > 0 && cart?.total === 0

  const paymentReady =
    (activeSession && cart?.shipping_methods.length !== 0) || paidByGiftcard

  const shippingCompleted =
    cart.shipping_address && cart.shipping_methods?.length > 0

  const handleEdit = () => {
    router.push("/checkout?step=payment", {
      scroll: false,
    })
  }

  useEffect(() => {
    if (isOpen && stripeMethod && !activeSession && !initAttempted.current) {
      initAttempted.current = true
      initiatePaymentSession(cart, { provider_id: stripeMethod.id })
        .then(() => {
          window.location.reload()
        })
        .catch((err) => {
          setError(err.message)
        })
    }
  }, [isOpen, stripeMethod, activeSession, cart])

  useEffect(() => {
    setError(null)
    hasAutoAdvanced.current = false
  }, [isOpen])

  useEffect(() => {
    if (isOpen && cardComplete && !hasAutoAdvanced.current) {
      hasAutoAdvanced.current = true
      router.push("/checkout?step=review", { scroll: false })
    }
  }, [isOpen, cardComplete, router])

  const paymentComplete = isActivePaypal || cardComplete
  const isInitializing = isOpen && stripeMethod && !activeSession

  return (
    <div className="bg-white">
      <div className="flex flex-row items-center justify-between mb-6">
        <Heading
          level="h2"
          className={clx(
            "flex flex-row text-3xl-regular gap-x-2 items-baseline",
            {
              "opacity-50 pointer-events-none select-none":
                !isOpen && !paymentReady,
            }
          )}
        >
          Payment
          {!isOpen && paymentReady && paymentComplete && <CheckCircleSolid className="text-green-500" />}
        </Heading>
        {!isOpen && shippingCompleted && (
          <Text>
            <button
              onClick={handleEdit}
              className="text-ui-fg-interactive hover:text-ui-fg-interactive-hover"
              data-testid="edit-payment-button"
            >
              Edit
            </button>
          </Text>
        )}
      </div>
      <div>
        {isInitializing ? (
          <div className="flex items-center justify-center py-8 gap-2">
            <Loader className="animate-spin" />
            <span className="text-ui-fg-subtle">Loading payment options...</span>
          </div>
        ) : (
          <>
            {!paidByGiftcard && availablePaymentMethods?.length && (
              <RadioGroup
                value={selectedPaymentMethod}
                onChange={(value: string) => setPaymentMethod(value)}
                className={isOpen ? "border border-ui-border-base" : "absolute opacity-0 pointer-events-none h-0 overflow-hidden"}
              >
                {sortedPaymentMethods.map((paymentMethod, index) => (
                  <div key={paymentMethod.id}>
                    {isStripeFunc(paymentMethod.id) ? (
                      <StripeCardContainer
                        paymentProviderId={paymentMethod.id}
                        selectedPaymentOptionId={selectedPaymentMethod}
                        paymentInfoMap={paymentInfoMap}
                        setCardBrand={setCardBrand}
                        setError={setError}
                        setCardComplete={setCardComplete}
                        isFirst={index === 0}
                        isLast={index === sortedPaymentMethods.length - 1}
                      />
                    ) : (
                      <PaymentContainer
                        paymentInfoMap={paymentInfoMap}
                        paymentProviderId={paymentMethod.id}
                        selectedPaymentOptionId={selectedPaymentMethod}
                        isFirst={index === 0}
                        isLast={index === sortedPaymentMethods.length - 1}
                      />
                    )}
                  </div>
                ))}
              </RadioGroup>
            )}

            {isOpen && (
              <>
                {paidByGiftcard && (
                  <div className="flex flex-col w-full">
                    <Text className="txt-medium-plus text-ui-fg-base mb-1">
                      Payment method
                    </Text>
                    <Text
                      className="txt-medium text-ui-fg-subtle"
                      data-testid="payment-method-summary"
                    >
                      Gift card
                    </Text>
                  </div>
                )}

                <ErrorMessage
                  error={error}
                  data-testid="payment-method-error-message"
                />
              </>
            )}
          </>
        )}

        <div className={isOpen ? "hidden" : "block"}>
          {cart && paymentReady && activeSession && paymentComplete ? (
            <div className="flex items-start gap-x-1 w-full">
              <div className="flex flex-col w-full">
                <span className="text-ui-fg-base mb-1">
                  Payment method
                </span>
                <span
                  className="text-large mono text-ui-fg-subtle"
                  data-testid="payment-method-summary"
                >
                  {paymentInfoMap[activeSession?.provider_id]?.title ||
                    activeSession?.provider_id}
                </span>
              </div>
              {!isActivePaypal && (
                <div className="flex flex-col w-full">
                  <span className="text-ui-fg-base mb-1">
                    Payment details
                  </span>
                  <span
                    className="text-large mono text-ui-fg-subtle"
                    data-testid="payment-details-summary"
                  >
                    {cardBrand || "Credit card"}
                  </span>
                </div>
              )}
            </div>
          ) : paidByGiftcard ? (
            <div className="flex flex-col w-full">
              <span className="text-ui-fg-base mb-1">
                Payment method
              </span>
              <span
                className="text-large mono text-ui-fg-subtle"
                data-testid="payment-method-summary"
              >
                Gift card
              </span>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}

export default Payment