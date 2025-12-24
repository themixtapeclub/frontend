// src/app/(main)/shop/week/page.tsx
import { Metadata } from "next"
import Link from "next/link"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { getRecentWeeks } from "@lib/data/week"

export const dynamic = "force-static"

export const metadata: Metadata = {
  title: "The Mixtape Club",
  robots: { index: false, follow: false },
  description: "Browse new vinyl arrivals by week.",
}

export default async function WeekIndexPage() {
  const cookieStore = await cookies()
  const adminCookie = cookieStore.get("_tmc_admin")
  
  if (adminCookie?.value !== "authenticated") {
    redirect("/")
  }

  const { recentWeeks } = await getRecentWeeks()

  return (
    <div className="flex flex-col py-4 content-container">
      <div className="mb-8">
        <h1 className="text-2xl-semi mb-2">New Arrivals by Week</h1>
        <p className="">Browse our latest additions organized by arrival week.</p>
      </div>

      {recentWeeks.length > 0 && (
        <div className="mb-12">
          <h2 className="text-lg font-medium mb-4">Recent Weeks</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentWeeks.map((week) => (
              <Link
                key={week.value}
                href={`/shop/week/${week.value}`}
                className="block p-4 border border-gray-200 rounded-lg hover:border-black transition-colors"
              >
                <div className="text-lg font-medium mb-1">{week.display_name}</div>
                {week.product_count !== undefined && (
                  <div className="text-sm ">
                    {week.product_count} {week.product_count === 1 ? 'product' : 'products'}
                  </div>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}


      {recentWeeks.length === 0 && (
        <div className="text-center py-12">
          <p className=" mb-4">No weeks with products found.</p>
          <Link href="/shop" className="underline">
            Browse All Products
          </Link>
        </div>
      )}
    </div>
  )
}