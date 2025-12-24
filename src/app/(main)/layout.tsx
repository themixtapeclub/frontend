// src/app/(main)/layout.tsx
import { Metadata } from "next"
import { getBaseURL } from "@lib/util/env"
import Footer from "@modules/layout/templates/footer"
import Nav from "@modules/layout/templates/nav"
import MainContent from "@modules/layout/components/main-content"
import Providers from "@modules/layout/components/providers"
import { PersistentPlayerManager } from "@modules/mixcloud/components/mixcloud-player/persistent-player"
import ClientCartMismatchBanner from "@modules/layout/components/cart-mismatch-banner/client"

export const dynamic = "force-static"

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
}

export default async function PageLayout(props: { children: React.ReactNode }) {
  return (
    <Providers>
      <div className="flex flex-col min-h-screen">
        <Nav />
        <ClientCartMismatchBanner />
        <MainContent>
          {props.children}
        </MainContent>
        <Footer />
        <PersistentPlayerManager />
      </div>
    </Providers>
  )
}