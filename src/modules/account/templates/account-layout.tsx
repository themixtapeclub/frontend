// frontend/src/modules/account/templates/account-layout.tsx
import React from "react"
import AccountNav from "../components/account-nav"
import { HttpTypes } from "@medusajs/types"

interface AccountLayoutProps {
  customer: HttpTypes.StoreCustomer | null
  children: React.ReactNode
}

const AccountLayout: React.FC<AccountLayoutProps> = ({
  customer,
  children,
}) => {
  return (
    <div className="flex-1" data-testid="account-page">
      {customer && <AccountNav />}
      <div className="content-container h-full max-w-5xl mx-auto">
        <div className="py-12">
          {children}
        </div>
      </div>
    </div>
  )
}

export default AccountLayout