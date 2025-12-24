// src/app/(checkout)/layout.tsx
import { getBaseURL } from "@lib/util/env"
import Nav from "@modules/layout/templates/nav"
import Footer from "@modules/layout/templates/footer"
import Providers from "@modules/layout/components/providers"
import { Metadata } from "next"

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
}

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <Providers>
      <div className="flex flex-col min-h-screen">
        <Nav />
        <main className="flex-1 flex flex-col" data-testid="checkout-container">
          {children}
        </main>
        <Footer />
      </div>
    </Providers>
  )
}
