// src/modules/checkout/components/payment-button/index.tsx
"use client"

import { isManual, isStripe, isPaypal } from "@lib/constants"
import { placeOrder } from "@lib/data/cart"
import { HttpTypes } from "@medusajs/types"
import Button from "@modules/common/components/button"
import { PayPalButtons, usePayPalScriptReducer } from "@paypal/react-paypal-js"
import React, { useState, useEffect } from "react"
import ErrorMessage from "../error-message"

type PaymentButtonProps = {
  cart: HttpTypes.StoreCart
  "data-testid": string
}

const PaymentButton: React.FC<PaymentButtonProps> = ({
  cart,
  "data-testid": dataTestId,
}) => {
  const notReady =
    !cart ||
    !cart.shipping_address ||
    !cart.billing_address ||
    !cart.email ||
    (cart.shipping_methods?.length ?? 0) < 1

  const paymentSession = cart.payment_collection?.payment_sessions?.[0]

  switch (true) {
    case isStripe(paymentSession?.provider_id):
      return (
        <StripePaymentButton
          notReady={notReady}
          cart={cart}
          data-testid={dataTestId}
        />
      )
    case isPaypal(paymentSession?.provider_id):
      return (
        <PayPalPaymentButton
          notReady={notReady}
          cart={cart}
          session={paymentSession}
          data-testid={dataTestId}
        />
      )
    case isManual(paymentSession?.provider_id):
      return (
        <ManualTestPaymentButton notReady={notReady} data-testid={dataTestId} />
      )
    default:
      return <Button disabled>Select a payment method</Button>
  }
}

const PayPalPaymentButton = ({
  cart,
  session,
  notReady,
  "data-testid": dataTestId,
}: {
  cart: HttpTypes.StoreCart
  session: HttpTypes.StorePaymentSession | undefined
  notReady: boolean
  "data-testid"?: string
}) => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [{ isPending }] = usePayPalScriptReducer()

  const onPaymentCompleted = async () => {
    await placeOrder().catch((err) => {
      setErrorMessage(err.message)
    })
  }

  const paypalOrderId = session?.data?.id as string | undefined

  if (isPending) {
    return (
      <div className="flex items-center justify-center p-4">
        <span className="text-ui-fg-subtle">Loading PayPal...</span>
      </div>
    )
  }

  if (notReady || !paypalOrderId) {
    return (
      <>
        <Button disabled data-testid={dataTestId}>
          Paypal not ready
        </Button>
        {!paypalOrderId && (
          <ErrorMessage error="PayPal session not initialized properly" />
        )}
      </>
    )
  }

  return (
    <>
      <PayPalButtons
        style={{
          color: "black",
          shape: "rect",
          label: "pay",
          height: 48,
        }}
        data-testid={dataTestId}
        createOrder={async () => paypalOrderId || ""}
        onApprove={async () => {
          await onPaymentCompleted()
        }}
        onError={(err) => {
          setErrorMessage(typeof err === "object" && err && "message" in err ? String(err.message) : "An error occurred with PayPal")
        }}
        onCancel={() => {
          setErrorMessage("Payment cancelled")
        }}
      />
      <ErrorMessage
        error={errorMessage}
        data-testid="paypal-payment-error-message"
      />
    </>
  )
}

const StripePaymentButton = ({
  cart,
  notReady,
  "data-testid": dataTestId,
}: {
  cart: HttpTypes.StoreCart
  notReady: boolean
  "data-testid"?: string
}) => {
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [cardComplete, setCardComplete] = useState(false)
  const [cardReady, setCardReady] = useState(false)

  const { useRouter, usePathname } = require("next/navigation")
  const router = useRouter()
  const pathname = usePathname()

  const { useStripe, useElements } = require("@stripe/react-stripe-js")
  const stripe = useStripe()
  const elements = useElements()
  const card = elements?.getElement("card")

  const session = cart.payment_collection?.payment_sessions?.find(
    (s) => s.status === "pending"
  )

  useEffect(() => {
    if (!card) {
      setCardReady(false)
      setCardComplete(false)
      return
    }

    setCardReady(true)
    setCardComplete(true)

    const handleChange = (event: any) => {
      setCardComplete(event.complete)
      if (event.error) {
        setErrorMessage(event.error.message)
      } else {
        setErrorMessage(null)
      }
    }

    card.on("change", handleChange)

    return () => {
      card.off("change", handleChange)
    }
  }, [card])

  const onPaymentCompleted = async () => {
    await placeOrder()
      .catch((err) => {
        setErrorMessage(err.message)
      })
      .finally(() => {
        setSubmitting(false)
      })
  }

  const disabled = !stripe || !elements || !card || !cardReady

  const handlePayment = async () => {
    setSubmitting(true)
    setErrorMessage(null)

    if (!stripe || !elements || !card || !cart) {
      setSubmitting(false)
      return
    }

    await stripe
      .confirmCardPayment(session?.data.client_secret as string, {
        payment_method: {
          card: card,
          billing_details: {
            name:
              cart.billing_address?.first_name +
              " " +
              cart.billing_address?.last_name,
            address: {
              city: cart.billing_address?.city ?? undefined,
              country: cart.billing_address?.country_code ?? undefined,
              line1: cart.billing_address?.address_1 ?? undefined,
              line2: cart.billing_address?.address_2 ?? undefined,
              postal_code: cart.billing_address?.postal_code ?? undefined,
              state: cart.billing_address?.province ?? undefined,
            },
            email: cart.email,
            phone: cart.billing_address?.phone ?? undefined,
          },
        },
      })
      .then(({ error, paymentIntent }: any) => {
        if (error) {
          const pi = error.payment_intent

          if (
            (pi && pi.status === "requires_capture") ||
            (pi && pi.status === "succeeded")
          ) {
            onPaymentCompleted()
          }

          setErrorMessage(error.message || null)
          return
        }

        if (
          (paymentIntent && paymentIntent.status === "requires_capture") ||
          paymentIntent.status === "succeeded"
        ) {
          return onPaymentCompleted()
        }

        return
      })
  }

  if (!cardReady) {
    const handleEditPayment = () => {
      router.push(pathname + "?step=payment", { scroll: false })
    }

    return (
      <Button 
        onClick={handleEditPayment} 
        data-testid={dataTestId} 
        size="large"
        className="!bg-gray-500 hover:!bg-gray-600 !border-0"
      >
        Enter card details
      </Button>
    )
  }

  return (
    <>
      <Button
        disabled={disabled || notReady}
        onClick={handlePayment}
        size="large"
        isLoading={submitting}
        data-testid={dataTestId}
        className="!bg-green-600 hover:!bg-green-700 !border-0 disabled:!bg-gray-400"
      >
        Place order
      </Button>
      <ErrorMessage
        error={errorMessage}
        data-testid="stripe-payment-error-message"
      />
    </>
  )
}

const ManualTestPaymentButton = ({ notReady, "data-testid": dataTestId }: { notReady: boolean, "data-testid"?: string }) => {
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const onPaymentCompleted = async () => {
    await placeOrder()
      .catch((err) => {
        setErrorMessage(err.message)
      })
      .finally(() => {
        setSubmitting(false)
      })
  }

  const handlePayment = () => {
    setSubmitting(true)
    onPaymentCompleted()
  }

  return (
    <>
      <Button
        disabled={notReady}
        isLoading={submitting}
        onClick={handlePayment}
        size="large"
        data-testid={dataTestId || "submit-order-button"}
        className="!bg-green-600 hover:!bg-green-700 !border-0"
      >
        Place order
      </Button>
      <ErrorMessage
        error={errorMessage}
        data-testid="manual-payment-error-message"
      />
    </>
  )
}

export default PaymentButton