// file: src/modules/layout/components/header/index.tsx
import { Suspense } from 'react'
import { listRegions } from "@lib/data/regions"
import { retrieveCustomer } from "@lib/data/customer"
import CartButton from "@modules/layout/components/cart-button"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import HeaderClient from './header-client'

export default async function Header() {
  const [regions, customer] = await Promise.all([
    listRegions(),
    retrieveCustomer()
  ])
  return (
    <HeaderClient regions={regions} customer={customer}>
      <Suspense
        fallback={
          <LocalizedClientLink href="/cart" className="outline mono">
            Cart
          </LocalizedClientLink>
        }
      >
        <CartButton />
      </Suspense>
    </HeaderClient>
  )
}