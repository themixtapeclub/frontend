// frontend/src/app/(main)/account/layout.tsx

import { Toaster } from "@medusajs/ui"
import AccountLayoutClient from "@modules/account/templates/account-layout-client"

export const dynamic = "force-dynamic"

export default async function AccountPageLayout({
  dashboard,
  login,
}: {
  dashboard?: React.ReactNode
  login?: React.ReactNode
}) {
  return (
    <>
      <AccountLayoutClient dashboard={dashboard} login={login} />
      <Toaster />
    </>
  )
}