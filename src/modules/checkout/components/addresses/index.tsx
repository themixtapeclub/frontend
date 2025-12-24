// src/modules/checkout/components/addresses/index.tsx
"use client"

import { setAddresses } from "@lib/data/cart"
import compareAddresses from "@lib/util/compare-addresses"
import { CheckCircleSolid } from "@medusajs/icons"
import { HttpTypes } from "@medusajs/types"
import { clx, Heading, Text, useToggleState } from "@medusajs/ui"
import Spinner from "@modules/common/icons/spinner"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useActionState, useRef } from "react"
import BillingAddress from "../billing_address"
import ErrorMessage from "../error-message"
import ShippingAddress from "../shipping-address"
import { SubmitButton } from "../submit-button"

const formatProvince = (province?: string | null) => {
  if (!province) return ""
  return province.replace(/^[a-z]{2}-/i, "").toUpperCase()
}

const Addresses = ({
  cart,
  customer,
}: {
  cart: HttpTypes.StoreCart | null
  customer: HttpTypes.StoreCustomer | null
}) => {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const formRef = useRef<HTMLFormElement>(null)

  const isOpen = searchParams.get("step") === "address"

  const isAddressComplete = Boolean(
    cart?.shipping_address?.first_name &&
    cart?.shipping_address?.last_name &&
    cart?.shipping_address?.address_1 &&
    cart?.shipping_address?.city &&
    cart?.shipping_address?.postal_code &&
    cart?.shipping_address?.country_code &&
    cart?.email
  )

  const showForm = isOpen || !isAddressComplete

  const { state: sameAsBilling, toggle: toggleSameAsBilling } = useToggleState(
    cart?.shipping_address && cart?.billing_address
      ? compareAddresses(cart?.shipping_address, cart?.billing_address)
      : true
  )

  const handleEdit = () => {
    router.push("/checkout?step=address")
  }

  const [message, formAction] = useActionState(setAddresses, null)

  const handleSavedAddressSelect = (address: HttpTypes.StoreCartAddress) => {
    setTimeout(() => {
      formRef.current?.requestSubmit()
    }, 100)
  }

  return (
    <div className="bg-white">
      <div className="flex flex-row items-center justify-between mb-6">
        <Heading
          level="h2"
          className="flex flex-row text-3xl-regular gap-x-2 items-baseline"
        >
          {showForm ? "Shipping Address" : "Contact"}
          {isAddressComplete && !showForm && <CheckCircleSolid className="text-green-500" />}
        </Heading>
        {!showForm && cart?.shipping_address && (
          <Text>
            <button
              onClick={handleEdit}
              className="text-ui-fg-interactive hover:text-ui-fg-interactive-hover"
              data-testid="edit-address-button"
            >
              Edit
            </button>
          </Text>
        )}
      </div>
      {showForm ? (
        <form ref={formRef} action={formAction}>
          <div className="pb-8">
            <ShippingAddress
              customer={customer}
              checked={sameAsBilling}
              onChange={toggleSameAsBilling}
              cart={cart}
              onSavedAddressSelect={handleSavedAddressSelect}
            />

            {!sameAsBilling && (
              <div>
                <Heading
                  level="h2"
                  className="text-3xl-regular gap-x-4 pb-4 pt-8"
                >
                  Billing address
                </Heading>

                <BillingAddress cart={cart} />
              </div>
            )}
            <SubmitButton className="mt-6" data-testid="submit-address-button">
              Continue to delivery
            </SubmitButton>
            <ErrorMessage error={message} data-testid="address-error-message" />
          </div>
        </form>
      ) : (
        <div>
          <div>
            {cart && cart.shipping_address ? (
              <div className="flex items-start gap-x-8">
                <div className="flex items-start gap-x-1 w-full">
                  <div
                    className={clx("flex flex-col", sameAsBilling ? "w-1/2" : "w-1/3")}
                    data-testid="shipping-address-summary"
                  >
                    <span className="text-ui-fg-base mb-1">
                      {sameAsBilling ? "Address" : "Shipping Address"}
                    </span>
                    <span className="text-large mono text-ui-fg-subtle">
                      {cart.shipping_address.first_name}{" "}
                      {cart.shipping_address.last_name}
                    </span>
                    <span className="text-large mono text-ui-fg-subtle">
                      {cart.shipping_address.address_1}
                      {cart.shipping_address.address_2 && ` ${cart.shipping_address.address_2}`}
                    </span>
                    <span className="text-large mono text-ui-fg-subtle">
                      {cart.shipping_address.city}
                      {cart.shipping_address.province && `, ${formatProvince(cart.shipping_address.province)}`}
                    </span>
                    <span className="text-large mono text-ui-fg-subtle">
                      {cart.shipping_address.postal_code} {cart.shipping_address.country_code?.toUpperCase()}
                    </span>
                    {sameAsBilling && (
                      <span className="text-small text-ui-fg-muted mt-2">
                        *Billing and delivery address are the same.
                      </span>
                    )}
                  </div>
                  <div
                    className={clx("flex flex-col", sameAsBilling ? "w-1/2" : "w-1/3")}
                    data-testid="shipping-contact-summary"
                  >
                    <span className="text-ui-fg-base mb-1">
                      Communication
                    </span>
                    <span className="text-large mono text-ui-fg-subtle">
                      {cart.email}
                    </span>
                    <span className="text-large mono text-ui-fg-subtle">
                      {cart.shipping_address.phone}
                    </span>
                  </div>

                  {!sameAsBilling && (
                    <div
                      className="flex flex-col w-1/3"
                      data-testid="billing-address-summary"
                    >
                      <span className="text-ui-fg-base mb-1">
                        Billing Address
                      </span>
                      <span className="text-large mono text-ui-fg-subtle">
                        {cart.billing_address?.first_name}{" "}
                        {cart.billing_address?.last_name}
                      </span>
                      <span className="text-large mono text-ui-fg-subtle">
                        {cart.billing_address?.address_1}
                        {cart.billing_address?.address_2 && ` ${cart.billing_address.address_2}`}
                      </span>
                      <span className="text-large mono text-ui-fg-subtle">
                        {cart.billing_address?.city}
                        {cart.billing_address?.province && `, ${formatProvince(cart.billing_address.province)}`}
                      </span>
                      <span className="text-large mono text-ui-fg-subtle">
                        {cart.billing_address?.postal_code} {cart.billing_address?.country_code?.toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div>
                <Spinner />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default Addresses