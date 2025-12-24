// @modules/order/components/payment-details/index.tsx
import { isStripe, paymentInfoMap } from "@lib/constants"
import { convertToLocale } from "@lib/util/money"
import { HttpTypes } from "@medusajs/types"

type PaymentDetailsProps = {
  order: HttpTypes.StoreOrder
}

const formatCardBrand = (brand: string) => {
  return brand.charAt(0).toUpperCase() + brand.slice(1)
}

const PaymentDetails = ({ order }: PaymentDetailsProps) => {
  const payment = order.payment_collections?.[0].payments?.[0]

  return (
    <div className="border-t border-black py-4 px-4">
      <div>
        {payment && (
          <div className="flex items-start gap-x-1 w-full">
            <div className="flex flex-col w-1/3">
              <p className="mb-1 font-sans text-neutral-500">Payment Method</p>
              <p data-testid="payment-method">
                {paymentInfoMap[payment.provider_id]?.title || "Credit card"}
              </p>
            </div>
            <div className="flex flex-col w-2/3">
              <p className="mb-1 font-sans text-neutral-500">Payment Details</p>
              <div className="flex gap-2 items-center">
                <p data-testid="payment-amount">
                  {isStripe(payment.provider_id) && payment.data?.card_brand && payment.data?.card_last4
                    ? `${formatCardBrand(payment.data.card_brand as string)} ~${payment.data.card_last4}`
                    : `${convertToLocale({
                        amount: payment.amount,
                        currency_code: order.currency_code,
                      })} paid at ${new Date(
                        payment.created_at ?? ""
                      ).toLocaleString()}`}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default PaymentDetails