// frontend/src/modules/account/templates/account-layout-client.tsx

"use client"

import { useEffect, useState, ReactNode } from "react"
import { HttpTypes } from "@medusajs/types"
import AccountNav from "../components/account-nav"

interface Props {
  dashboard?: ReactNode
  login?: ReactNode
}

export default function AccountLayoutClient({ dashboard, login }: Props) {
  const [customer, setCustomer] = useState<HttpTypes.StoreCustomer | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/customer')
      .then(res => res.json())
      .then(data => {
        setCustomer(data.customer || null)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex-1" data-testid="account-page">
        <div className="content-container h-full max-w-4xl mx-auto">
          <div className="py-12 flex justify-center">
            Loading...
          </div>
        </div>
      </div>
    )
  }

  if (!customer) {
    return (
      <div className="flex-1" data-testid="account-page">
        <div className="content-container h-full max-w-4xl mx-auto">
          <div className="py-12">
            {login}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1" data-testid="account-page">
      <AccountNav />
      <div className="border-t border-black" />
      <div className="content-container flex justify-center">
        <div className="max-w-4xl w-full">
          <div className="border-l border-r border-black min-h-[calc(100vh-200px)]">
            <div className="px-4 py-4 text-center">
              <span className="text-xl-semi mono" data-testid="welcome-message" data-value={customer.first_name}>
                Hello {customer.first_name}
              </span>
            </div>
            {dashboard}
          </div>
        </div>
      </div>
    </div>
  )
}
