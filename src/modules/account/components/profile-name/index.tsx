"use client"

import React, { useEffect, useActionState } from "react"
import Input from "@modules/common/components/input"
import AccountInfo from "../account-info"
import { HttpTypes } from "@medusajs/types"
import { updateCustomer } from "@lib/data/customer"

type MyInformationProps = {
  customer: HttpTypes.StoreCustomer
}

const ProfileName: React.FC<MyInformationProps> = ({ customer }) => {
  const [successState, setSuccessState] = React.useState(false)
  const [currentCustomer, setCurrentCustomer] = React.useState(customer)

  const updateCustomerName = async (
    _currentState: Record<string, unknown>,
    formData: FormData
  ) => {
    const customerData = {
      first_name: formData.get("first_name") as string,
      last_name: formData.get("last_name") as string,
    }

    try {
      await updateCustomer(customerData)
      setCurrentCustomer({ ...currentCustomer, ...customerData })
      return { success: true, error: null }
    } catch (error: any) {
      return { success: false, error: error.toString() }
    }
  }

  const [state, formAction] = useActionState(updateCustomerName, {
    error: false,
    success: false,
  })

  const clearState = () => {
    setSuccessState(false)
  }

  useEffect(() => {
    if (state.success) {
      setSuccessState(true)
    }
  }, [state])

  return (
    <form action={formAction} className="w-full overflow-visible">
      <AccountInfo
        label="Name"
        currentInfo={`${currentCustomer.first_name} ${currentCustomer.last_name}`}
        isSuccess={successState}
        isError={!!state?.error}
        clearState={clearState}
        data-testid="account-name-editor"
      >
        <div className="grid grid-cols-2 gap-x-4">
          <Input
            label="First name"
            name="first_name"
            required
            defaultValue={currentCustomer.first_name ?? ""}
            data-testid="first-name-input"
          />
          <Input
            label="Last name"
            name="last_name"
            required
            defaultValue={currentCustomer.last_name ?? ""}
            data-testid="last-name-input"
          />
        </div>
      </AccountInfo>
    </form>
  )
}

export default ProfileName
