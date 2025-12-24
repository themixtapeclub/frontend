// frontend/src/modules/checkout/components/shipping-address/index.tsx
import { HttpTypes } from "@medusajs/types"
import { Container } from "@medusajs/ui"
import Checkbox from "@modules/common/components/checkbox"
import Input from "@modules/common/components/input"
import { mapKeys } from "lodash"
import React, { useEffect, useMemo, useState } from "react"
import AddressSelect from "../address-select"
import CountrySelect from "../country-select"
import StateSelect from "../state-select"

const ShippingAddress = ({
  customer,
  cart,
  checked,
  onChange,
  onSavedAddressSelect,
}: {
  customer: HttpTypes.StoreCustomer | null
  cart: HttpTypes.StoreCart | null
  checked: boolean
  onChange: () => void
  onSavedAddressSelect?: (address: HttpTypes.StoreCartAddress) => void
}) => {
  const [formData, setFormData] = useState<Record<string, any>>({
    "shipping_address.first_name": cart?.shipping_address?.first_name || "",
    "shipping_address.last_name": cart?.shipping_address?.last_name || "",
    "shipping_address.address_1": cart?.shipping_address?.address_1 || "",
    "shipping_address.address_2": cart?.shipping_address?.address_2 || "",
    "shipping_address.company": cart?.shipping_address?.company || "",
    "shipping_address.postal_code": cart?.shipping_address?.postal_code || "",
    "shipping_address.city": cart?.shipping_address?.city || "",
    "shipping_address.country_code": cart?.shipping_address?.country_code || "",
    "shipping_address.province": cart?.shipping_address?.province?.toLowerCase() || "",
    "shipping_address.phone": cart?.shipping_address?.phone || "",
    email: cart?.email || "",
  })

  const countriesInRegion = useMemo(
    () => cart?.region?.countries?.map((c) => c.iso_2),
    [cart?.region]
  )

  const addressesInRegion = useMemo(
    () =>
      customer?.addresses.filter(
        (a) => a.country_code && countriesInRegion?.includes(a.country_code)
      ),
    [customer?.addresses, countriesInRegion]
  )

  const setFormAddress = (
    address?: HttpTypes.StoreCartAddress,
    email?: string
  ) => {
    if (address) {
      setFormData((prevState: Record<string, any>) => ({
        ...prevState,
        "shipping_address.first_name": address?.first_name || "",
        "shipping_address.last_name": address?.last_name || "",
        "shipping_address.address_1": address?.address_1 || "",
        "shipping_address.address_2": address?.address_2 || "",
        "shipping_address.company": address?.company || "",
        "shipping_address.postal_code": address?.postal_code || "",
        "shipping_address.city": address?.city || "",
        "shipping_address.country_code": address?.country_code || "",
        "shipping_address.province": address?.province?.toLowerCase() || "",
        "shipping_address.phone": address?.phone || "",
      }))
      onSavedAddressSelect?.(address)
    }

    email &&
      setFormData((prevState: Record<string, any>) => ({
        ...prevState,
        email: email,
      }))
  }

  useEffect(() => {
    if (cart && cart.shipping_address) {
      setFormData((prevState) => ({
        ...prevState,
        "shipping_address.first_name": cart.shipping_address?.first_name || "",
        "shipping_address.last_name": cart.shipping_address?.last_name || "",
        "shipping_address.address_1": cart.shipping_address?.address_1 || "",
        "shipping_address.address_2": cart.shipping_address?.address_2 || "",
        "shipping_address.company": cart.shipping_address?.company || "",
        "shipping_address.postal_code": cart.shipping_address?.postal_code || "",
        "shipping_address.city": cart.shipping_address?.city || "",
        "shipping_address.country_code": cart.shipping_address?.country_code || "",
        "shipping_address.province": cart.shipping_address?.province?.toLowerCase() || "",
        "shipping_address.phone": cart.shipping_address?.phone || "",
        email: cart.email || prevState.email,
      }))
    }

    if (cart && !cart.email && customer?.email) {
      setFormData((prevState) => ({
        ...prevState,
        email: customer.email,
      }))
    }
  }, [cart, customer?.email])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <>
      {customer && (addressesInRegion?.length || 0) > 0 && (
        <Container className="mb-6 flex flex-col gap-y-4 p-5">
          <p className="text-small-regular">
            {`Hi ${customer.first_name}, do you want to use one of your saved addresses?`}
          </p>
          <AddressSelect
            addresses={customer.addresses}
            addressInput={
              mapKeys(formData, (_, key) =>
                key.replace("shipping_address.", "")
              ) as HttpTypes.StoreCartAddress
            }
            onSelect={setFormAddress}
          />
        </Container>
      )}
      <div className="grid grid-cols-2 border border-ui-border-base">
        <div className="border-b border-r border-ui-border-base">
          <Input
            label="Email"
            name="email"
            type="email"
            title="Enter a valid email address."
            autoComplete="email"
            value={formData.email}
            onChange={handleChange}
            required
            data-testid="shipping-email-input"
          />
        </div>
        <div className="border-b border-ui-border-base">
          <Input
            label="Phone"
            name="shipping_address.phone"
            autoComplete="tel"
            value={formData["shipping_address.phone"]}
            onChange={handleChange}
            data-testid="shipping-phone-input"
          />
        </div>
        <div className="border-b border-r border-ui-border-base">
          <Input
            label="First name"
            name="shipping_address.first_name"
            autoComplete="given-name"
            value={formData["shipping_address.first_name"]}
            onChange={handleChange}
            required
            data-testid="shipping-first-name-input"
          />
        </div>
        <div className="border-b border-ui-border-base">
          <Input
            label="Last name"
            name="shipping_address.last_name"
            autoComplete="family-name"
            value={formData["shipping_address.last_name"]}
            onChange={handleChange}
            required
            data-testid="shipping-last-name-input"
          />
        </div>
        <div className="border-b border-r border-ui-border-base">
          <Input
            label="Address"
            name="shipping_address.address_1"
            autoComplete="address-line1"
            value={formData["shipping_address.address_1"]}
            onChange={handleChange}
            required
            data-testid="shipping-address-input"
          />
        </div>
        <div className="border-b border-ui-border-base">
          <Input
            label="Apartment, suite, etc."
            name="shipping_address.address_2"
            autoComplete="address-line2"
            value={formData["shipping_address.address_2"]}
            onChange={handleChange}
            data-testid="shipping-address-2-input"
          />
        </div>
        <div className="border-b border-r border-ui-border-base">
          <Input
            label="Postal code"
            name="shipping_address.postal_code"
            autoComplete="postal-code"
            value={formData["shipping_address.postal_code"]}
            onChange={handleChange}
            required
            data-testid="shipping-postal-code-input"
          />
        </div>
        <div className="border-b border-ui-border-base">
          <Input
            label="City"
            name="shipping_address.city"
            autoComplete="address-level2"
            value={formData["shipping_address.city"]}
            onChange={handleChange}
            required
            data-testid="shipping-city-input"
          />
        </div>
        <div className="border-r border-ui-border-base">
          <CountrySelect
            name="shipping_address.country_code"
            autoComplete="country"
            region={cart?.region}
            value={formData["shipping_address.country_code"]}
            onChange={handleChange}
            required
            data-testid="shipping-country-select"
          />
        </div>
        <div>
          <StateSelect
            name="shipping_address.province"
            autoComplete="address-level1"
            countryCode={formData["shipping_address.country_code"]}
            value={formData["shipping_address.province"]}
            onChange={handleChange}
            data-testid="shipping-province-select"
          />
        </div>
      </div>
      <div className="my-8">
        <Checkbox
          label="Billing address same as shipping address"
          name="same_as_billing"
          checked={checked}
          onChange={onChange}
          data-testid="billing-address-checkbox"
        />
      </div>
    </>
  )
}

export default ShippingAddress