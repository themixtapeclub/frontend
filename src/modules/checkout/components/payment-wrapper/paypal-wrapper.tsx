// src/modules/checkout/components/payment-wrapper/paypal-wrapper.tsx
"use client"

import { PayPalScriptProvider } from "@paypal/react-paypal-js"
import { createContext } from "react"

type PayPalWrapperProps = {
  clientId: string
  children: React.ReactNode
}

export const PayPalContext = createContext(false)

const PayPalWrapper: React.FC<PayPalWrapperProps> = ({ clientId, children }) => {
  return (
    <PayPalContext.Provider value={true}>
      <PayPalScriptProvider
        options={{
          clientId,
          currency: "USD",
          intent: "capture",
        }}
      >
        {children}
      </PayPalScriptProvider>
    </PayPalContext.Provider>
  )
}

export default PayPalWrapper
