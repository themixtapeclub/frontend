// frontend/src/modules/account/components/account-nav/index.tsx
"use client"

import { clx } from "@medusajs/ui"
import { useParams, usePathname } from "next/navigation"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { signout } from "@lib/data/customer"

const accountLinks = [
  { name: "Overview", href: "/account" },
  { name: "Profile", href: "/account/profile" },
  { name: "Addresses", href: "/account/addresses" },
  { name: "Orders", href: "/account/orders" },
  { name: "Wantlist", href: "/account/wantlist" },
]

const AccountNav = () => {
  const pathname = usePathname()
  const { countryCode } = useParams() as { countryCode: string }

  const handleLogout = async () => {
    await signout()
  }

  const currentPath = pathname?.split(countryCode)[1] || pathname
  const isActive = (href: string) => {
    if (href === "/account") {
      return currentPath === "/account"
    }
    return currentPath?.startsWith(href)
  }

  return (
    <div className="page-nav submenu w-full z-30">
      <div className="genre relative">
        <div className="flex justify-center items-center px-4">
          <ul className="flex justify-center text-base flex-wrap p-0 m-0 list-none">
            {accountLinks.map((link) => {
              const active = isActive(link.href)
              return (
                <li key={link.href} className="menu-item whitespace-nowrap">
                  <LocalizedClientLink
                    href={link.href}
                    className={clx(
                      "mono mx-1 px-2 inline-block",
                      active ? "active font-bold" : ""
                    )}
                    data-testid={`${link.name.toLowerCase()}-link`}
                  >
                    {link.name}
                  </LocalizedClientLink>
                </li>
              )
            })}
            <li className="menu-item whitespace-nowrap">
              <button
                type="button"
                onClick={handleLogout}
                className="mono mx-1 px-2 inline-block"
                data-testid="logout-button"
              >
                Log out
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default AccountNav
