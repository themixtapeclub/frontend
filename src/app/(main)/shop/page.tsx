// src/app/(main)/shop/page.tsx
import { redirect } from "next/navigation"

export const revalidate = 300

export default function ShopPage() {
  redirect("/shop/new/")
}
