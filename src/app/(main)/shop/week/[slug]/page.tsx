// src/app/(main)/shop/week/[slug]/page.tsx
import { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { cookies } from "next/headers"
import { DEFAULT_COUNTRY_CODE } from "@lib/data/region-cookie"
import { getWeekProducts } from "@lib/data/week"
import { getRegion } from "@lib/data/regions"
import ProductCard from "@modules/products/components/product-card"
import { Pagination } from "@modules/store/components/pagination"
import { AdminHiddenIndicator } from "@modules/common/components/admin-indicator"

export const dynamic = "force-static"

type Props = {
  params: Promise<{ slug: string }>
  searchParams: Promise<{
    sortBy?: string
    page?: string
  }>
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params
  const { week } = await getWeekProducts({
    week: params.slug,
    page: 1,
    limit: 1
  })
  return {
    title: `${week.display_name} New Arrivals | The Mixtape Club`,
    description: `Shop new vinyl arrivals from ${week.display_name}.`,
  }
}

const PRODUCT_LIMIT = 48

export default async function WeekPage(props: Props) {
  const cookieStore = await cookies()
  const adminCookie = cookieStore.get("_tmc_admin")
  
  if (adminCookie?.value !== "authenticated") {
    notFound()
  }

  const params = await props.params
  const searchParams = await props.searchParams
  const page = searchParams.page ? parseInt(searchParams.page) : 1
  const sortBy = searchParams.sortBy
  const region = await getRegion(DEFAULT_COUNTRY_CODE)
  
  if (!region) {
    return null
  }

  const { products, pages, week: weekInfo } = await getWeekProducts({
    week: params.slug,
    page,
    limit: PRODUCT_LIMIT,
    sort: sortBy === "price_asc" ? "price_usd" : sortBy === "price_desc" ? "price_usd" : "order_position",
    order: sortBy === "price_asc" ? "asc" : sortBy === "price_desc" ? "desc" : "asc"
  })

  if (products.length === 0) {
    return (
      <div className="w-full text-center py-12">
        <h2 className="text-xl font-semibold mb-3">
          No releases found for {weekInfo.display_name}
        </h2>
        <p className=" mb-4">
          We couldn&apos;t find any products for this week.
        </p>
        <Link href="/shop" className="underline">
          Browse All Products
        </Link>
      </div>
    )
  }

  return (
    <div className="w-full relative">
      <AdminHiddenIndicator />
      <ul className="flex flex-wrap justify-center w-full list-none m-0 p-0">
        {products.map((product: any, index: number) => (
          <li
            key={product.id}
            className="w-1/2 sm:w-1/3 lg:w-1/4 flex-shrink-0"
            data-id={product.id}
            data-type="product"
          >
            <ProductCard
              product={product}
              priority={index < 4}
            />
          </li>
        ))}
      </ul>
      {pages > 1 && (
        <Pagination
          page={page}
          totalPages={pages}
        />
      )}
    </div>
  )
}