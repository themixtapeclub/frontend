// frontend/src/app/(main)/account/@dashboard/addresses/page.tsx
import { Metadata } from "next"
import AddressBook from "@modules/account/components/address-book"

export const metadata: Metadata = {
  title: "Addresses",
  description: "View your addresses",
}

export default function Addresses() {
  return <AddressBook />
}
