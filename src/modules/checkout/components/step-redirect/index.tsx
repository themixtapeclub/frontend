// src/modules/checkout/components/step-redirect/index.tsx
"use client"

import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { useEffect } from "react"

const StepRedirect = ({ cart }: { cart: any }) => {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const currentStep = searchParams.get("step")

  const isAddressComplete = Boolean(
    cart?.shipping_address?.first_name &&
    cart?.shipping_address?.last_name &&
    cart?.shipping_address?.address_1 &&
    cart?.shipping_address?.city &&
    cart?.shipping_address?.postal_code &&
    cart?.shipping_address?.country_code &&
    cart?.email
  )
  
  const hasShippingMethod = cart.shipping_methods?.length > 0

  useEffect(() => {
    if (currentStep) return

    let targetStep = "address"
    if (!isAddressComplete) {
      targetStep = "address"
    } else if (!hasShippingMethod) {
      targetStep = "delivery"
    } else {
      targetStep = "payment"
    }

    router.replace(pathname + "?step=" + targetStep, { scroll: false })
  }, [currentStep, isAddressComplete, hasShippingMethod, router, pathname])

  return null
}

export default StepRedirect