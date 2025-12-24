// frontend/src/modules/order/components/shipping-details/index.tsx
import { convertToLocale } from "@lib/util/money"
import { HttpTypes } from "@medusajs/types"

type ShippingDetailsProps = {
  order: HttpTypes.StoreOrder
}

const ShippingDetails = ({ order }: ShippingDetailsProps) => {
  return (
    <div className="py-4 px-4">
      <div className="flex items-start gap-x-8">
        <div
          className="flex flex-col w-1/3"
          data-testid="shipping-address-summary"
        >
          <p className="mb-1 font-sans text-neutral-500">Shipping Address</p>
          <p>
            {order.shipping_address?.first_name}{" "}
            {order.shipping_address?.last_name}
          </p>
          <p>
            {order.shipping_address?.address_1}{" "}
            {order.shipping_address?.address_2}
          </p>
          <p>
            {order.shipping_address?.postal_code},{" "}
            {order.shipping_address?.city}
          </p>
          <p>
            {order.shipping_address?.country_code?.toUpperCase()}
          </p>
        </div>

        <div
          className="flex flex-col w-1/3"
          data-testid="shipping-contact-summary"
        >
          <p className="mb-1 font-sans text-neutral-500">Contact</p>
          <p>
            {order.shipping_address?.phone}
          </p>
          <p>{order.email}</p>
        </div>

        <div
          className="flex flex-col w-1/3"
          data-testid="shipping-method-summary"
        >
          <p className="mb-1 font-sans text-neutral-500">Method</p>
          <p>
            {(order as any).shipping_methods[0]?.name} (
            {convertToLocale({
              amount: order.shipping_methods?.[0].total ?? 0,
              currency_code: order.currency_code,
            })}
            )
          </p>
        </div>
      </div>
    </div>
  )
}

export default ShippingDetails
