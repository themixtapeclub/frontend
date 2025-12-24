// frontend/src/modules/account/components/address-book/index.tsx
"use client"

import React, { useEffect, useState } from "react"
import AddAddress from "../address-card/add-address"
import EditAddress from "../address-card/edit-address-modal"
import { HttpTypes } from "@medusajs/types"
import Spinner from "@modules/common/icons/spinner"

const AddressBook = () => {
  const [customer, setCustomer] = useState<HttpTypes.StoreCustomer | null>(null)
  const [region, setRegion] = useState<HttpTypes.StoreRegion | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/customer').then(r => r.json()),
      fetch('/api/regions').then(r => r.json())
    ])
      .then(([customerData, regionsData]) => {
        setCustomer(customerData.customer || null)
        const regions = regionsData.regions || []
        setRegion(regions[0] || null)
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

  if (!customer || !region) {
    return null
  }

  const { addresses } = customer

  return (
    <div className="w-full border-t border-black">
      {addresses.map((address, index) => (
        <EditAddress 
          region={region} 
          address={address} 
          key={address.id} 
          isLast={index === addresses.length - 1}
        />
      ))}
      <AddAddress region={region} addresses={addresses} />
    </div>
  )
}

export default AddressBook
