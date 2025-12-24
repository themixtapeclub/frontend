// frontend/src/modules/account/components/overview/index.tsx
"use client"

import { useEffect, useState } from "react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { convertToLocale } from "@lib/util/money"
import { HttpTypes } from "@medusajs/types"
import Spinner from "@modules/common/icons/spinner"

const Overview = () => {
  const [customer, setCustomer] = useState<HttpTypes.StoreCustomer | null>(null)
  const [orders, setOrders] = useState<HttpTypes.StoreOrder[] | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/customer').then(r => r.json()),
      fetch('/api/orders').then(r => r.json())
    ])
      .then(([customerData, ordersData]) => {
        setCustomer(customerData.customer || null)
        setOrders(ordersData.orders || null)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 border-t border-black">
        <Spinner />
      </div>
    )
  }

  if (!customer) {
    return null
  }

  return (
    <div data-testid="overview-page-wrapper" className="border-t border-black">
      <div className="px-4 py-4 border-b border-black">
        <span>
          Signed in as:{" "}
          <span
            className="mono"
            data-testid="customer-email"
            data-value={customer?.email}
          >
            {customer?.email}
          </span>
        </span>
      </div>
      <div className="flex flex-col">
        <div className="px-4 py-4 border-b border-black">Recent orders</div>
        <ul className="flex flex-col" data-testid="orders-wrapper">
          {orders && orders.length > 0 ? (
            orders.slice(0, 5).map((order) => (
              <li
                key={order.id}
                data-testid="order-wrapper"
                data-value={order.id}
                className="border-b border-black"
              >
                <LocalizedClientLink
                  href={`/account/orders/details/${order.id}`}
                  className="flex justify-between items-center py-4 px-4 hover:bg-black hover:text-white transition-colors"
                >
                  <div className="grid grid-cols-3 gap-x-4 flex-1">
                    <div>
                      <span className="block text-small text-ui-fg-subtle">Date placed</span>
                      <span data-testid="order-created-date" className="mono">
                        {new Date(order.created_at).toDateString()}
                      </span>
                    </div>
                    <div>
                      <span className="block text-small text-ui-fg-subtle">Order number</span>
                      <span data-testid="order-id" data-value={order.display_id} className="mono">
                        #{order.display_id}
                      </span>
                    </div>
                    <div>
                      <span className="block text-small text-ui-fg-subtle">Total</span>
                      <span data-testid="order-amount" className="mono">
                        {convertToLocale({
                          amount: order.total,
                          currency_code: order.currency_code,
                        })}
                      </span>
                    </div>
                  </div>
                </LocalizedClientLink>
              </li>
            ))
          ) : (
            <span data-testid="no-orders-message" className="text-neutral-500 px-4 py-4">
              No recent orders
            </span>
          )}
        </ul>
      </div>
    </div>
  )
}

export default Overview
