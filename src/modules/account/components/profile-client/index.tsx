// frontend/src/modules/account/components/profile-client/index.tsx
"use client"

import { useEffect, useState } from "react"
import { HttpTypes } from "@medusajs/types"
import ProfilePhone from "@modules/account/components/profile-phone"
import ProfileBillingAddress from "@modules/account/components/profile-billing-address"
import ProfileEmail from "@modules/account/components/profile-email"
import ProfileName from "@modules/account/components/profile-name"
import Spinner from "@modules/common/icons/spinner"

export default function ProfileClient() {
  const [customer, setCustomer] = useState<HttpTypes.StoreCustomer | null>(null)
  const [regions, setRegions] = useState<HttpTypes.StoreRegion[] | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchData = () => {
    Promise.all([
      fetch('/api/customer').then(r => r.json()),
      fetch('/api/regions').then(r => r.json())
    ])
      .then(([customerData, regionsData]) => {
        setCustomer(customerData.customer || null)
        setRegions(regionsData.regions || null)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }

  useEffect(() => {
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 border-t border-black">
        <Spinner />
      </div>
    )
  }

  if (!customer || !regions) {
    return null
  }

  return (
    <div className="w-full border-t border-black" data-testid="profile-page-wrapper">
      <div className="flex flex-col w-full">
        <div className="px-4 py-4 border-b border-black">
          <ProfileName customer={customer} />
        </div>
        <div className="px-4 py-4 border-b border-black">
          <ProfileEmail customer={customer} />
        </div>
        <div className="px-4 py-4 border-b border-black">
          <ProfilePhone customer={customer} />
        </div>
        <div className="px-4 py-4 border-b border-black">
          <ProfileBillingAddress customer={customer} regions={regions} />
        </div>
      </div>
    </div>
  )
}
