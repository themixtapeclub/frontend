import { Metadata } from "next"
import Wantlist from "@modules/account/components/wantlist"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Wantlist",
  description: "Items you want to be notified about when back in stock",
}

export default async function WantlistPage() {
  return (
    <div className="w-full">
      <Wantlist />
    </div>
  )
}
