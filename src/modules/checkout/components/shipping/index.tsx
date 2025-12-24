// src/modules/checkout/components/shipping/index.tsx
"use client"

import { Radio, RadioGroup } from "@headlessui/react"
import { setShippingMethod } from "@lib/data/cart"
import { calculatePriceForShippingOption } from "@lib/data/fulfillment"
import { convertToLocale } from "@lib/util/money"
import { CheckCircleSolid, Loader } from "@medusajs/icons"
import { HttpTypes } from "@medusajs/types"
import { clx, Heading, Text } from "@medusajs/ui"
import ErrorMessage from "@modules/checkout/components/error-message"
import MedusaRadio from "@modules/common/components/radio"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"

type ShippingProps = {
  cart: HttpTypes.StoreCart
  availableShippingMethods: HttpTypes.StoreCartShippingOption[] | null
}

const Shipping: React.FC<ShippingProps> = ({
  cart,
  availableShippingMethods,
}) => {
  const searchParams = useSearchParams()
  const router = useRouter()

  const isOpen = searchParams.get("step") === "delivery"

  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingPrices, setIsLoadingPrices] = useState(true)
  const [calculatedPricesMap, setCalculatedPricesMap] = useState<Record<string, number>>({})
  const [error, setError] = useState<string | null>(null)
  const [shippingMethodId, setShippingMethodId] = useState<string | null>(
    cart.shipping_methods?.at(-1)?.shipping_option_id || null
  )

  useEffect(() => {
    setIsLoadingPrices(true)

    if (availableShippingMethods?.length) {
      const promises = availableShippingMethods
        .filter((sm) => sm.price_type === "calculated")
        .map((sm) => calculatePriceForShippingOption(sm.id, cart.id))

      if (promises.length) {
        Promise.allSettled(promises).then((res) => {
          const pricesMap: Record<string, number> = {}
          res
            .filter((r) => r.status === "fulfilled")
            .forEach((p) => (pricesMap[p.value?.id || ""] = p.value?.amount!))

          setCalculatedPricesMap(pricesMap)
          setIsLoadingPrices(false)
        })
      } else {
        setIsLoadingPrices(false)
      }
    }
  }, [availableShippingMethods, cart.id])

  const handleEdit = () => {
    router.push("/checkout?step=delivery", { scroll: false })
  }

  const handleSetShippingMethod = async (id: string) => {
    setError(null)

    let currentId: string | null = null
    setIsLoading(true)
    setShippingMethodId((prev) => {
      currentId = prev
      return id
    })

    await setShippingMethod({ cartId: cart.id, shippingMethodId: id })
      .then(() => {
        router.push("/checkout?step=payment", { scroll: false })
      })
      .catch((err) => {
        setShippingMethodId(currentId)
        setError(err.message)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  useEffect(() => {
    setError(null)
  }, [isOpen])

  return (
    <div className="bg-white">
      <div className="flex flex-row items-center justify-between mb-6">
        <Heading
          level="h2"
          className={clx(
            "flex flex-row text-3xl-regular gap-x-2 items-baseline",
            {
              "opacity-50 pointer-events-none select-none":
                !isOpen && cart.shipping_methods?.length === 0,
            }
          )}
        >
          Delivery
          {!isOpen && (cart.shipping_methods?.length ?? 0) > 0 && (
            <CheckCircleSolid className="text-green-500" />
          )}
        </Heading>
        {!isOpen &&
          cart?.shipping_address &&
          cart?.billing_address &&
          cart?.email && (
            <Text>
              <button
                onClick={handleEdit}
                className="text-ui-fg-interactive hover:text-ui-fg-interactive-hover"
                data-testid="edit-delivery-button"
              >
                Edit
              </button>
            </Text>
          )}
      </div>
      {isOpen ? (
        <>
          <div data-testid="delivery-options-container">
            <RadioGroup
              value={shippingMethodId}
              onChange={(v) => {
                if (v) {
                  handleSetShippingMethod(v)
                }
              }}
              className="border border-ui-border-base"
            >
              {availableShippingMethods?.map((option, index) => {
                const isDisabled =
                  option.price_type === "calculated" &&
                  !isLoadingPrices &&
                  typeof calculatedPricesMap[option.id] !== "number"

                const isLast = index === (availableShippingMethods?.length ?? 0) - 1

                return (
                  <Radio
                    key={option.id}
                    value={option.id}
                    data-testid="delivery-option-radio"
                    disabled={isDisabled || isLoading}
                    className={clx(
                      "flex items-center justify-between text-small-regular cursor-pointer h-11 px-4",
                      {
                        "bg-ui-bg-subtle": option.id === shippingMethodId,
                        "cursor-not-allowed opacity-50": isDisabled || isLoading,
                        "border-b border-ui-border-base": !isLast,
                      }
                    )}
                  >
                    <div className="flex items-center gap-x-4">
                      <MedusaRadio
                        checked={option.id === shippingMethodId}
                      />
                      <span className="text-base-regular">
                        {option.name}
                      </span>
                    </div>
                   <span className="justify-self-end text-ui-fg-base">
                    {option.price_type === "flat" && option.amount && option.amount > 0 ? (
                      convertToLocale({
                        amount: option.amount,
                        currency_code: cart?.currency_code,
                      })
                    ) : calculatedPricesMap[option.id] && calculatedPricesMap[option.id] > 0 ? (
                      convertToLocale({
                        amount: calculatedPricesMap[option.id],
                        currency_code: cart?.currency_code,
                      })
                    ) : isLoadingPrices && option.price_type === "calculated" ? (
                      <Loader />
                    ) : null}
                  </span>
                  </Radio>
                )
              })}
            </RadioGroup>
          </div>

          {error && (
            <div className="mt-4">
              <ErrorMessage
                error={error}
                data-testid="delivery-option-error-message"
              />
            </div>
          )}

          {isLoading && (
            <div className="mt-4 flex items-center gap-2 text-ui-fg-subtle">
              <Loader className="animate-spin" />
              <span>Setting shipping method...</span>
            </div>
          )}
        </>
      ) : (
        <div>
          <div>
            {cart && (cart.shipping_methods?.length ?? 0) > 0 && (
              <div className="flex flex-col w-full">
                <span className="text-ui-fg-base mb-1">
                  Method
                </span>
                <span className="text-large mono text-ui-fg-subtle">
                  {cart.shipping_methods!.at(-1)!.name}
                  {cart.shipping_methods!.at(-1)!.amount && cart.shipping_methods!.at(-1)!.amount! > 0 && (
                    <> {convertToLocale({
                      amount: cart.shipping_methods!.at(-1)!.amount!,
                      currency_code: cart?.currency_code,
                    })}</>
                  )}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default Shipping