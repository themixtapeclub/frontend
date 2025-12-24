// frontend/src/app/(main)/account/@dashboard/orders/page.tsx
import { Metadata } from "next"
import OrderOverview from "@modules/account/components/order-overview"
import { listOrders } from "@lib/data/orders"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Orders",
  description: "Overview of your previous orders.",
}

export default async function Orders() {
  const orders = await listOrders()

  if (!orders) {
    return null
  }

  return <OrderOverview orders={orders} />
}
