// src/app/(main)/shop/new/page.tsx
import { Metadata } from "next"
import { Suspense } from "react"
import { DEFAULT_COUNTRY_CODE } from "@lib/data/region-cookie"
import { getRecentWeeksProducts } from "@lib/data/week"
import { getRegion } from "@lib/data/regions"
import ProductCard from "@modules/products/components/product-card"
import { Pagination } from "@modules/store/components/pagination"

export const metadata: Metadata = {
  title: "Shop at The Mixtape Club",
  description: "Shop our latest arrivals on vinyl, cassette and CD",
}

export const dynamic = "force-static"
export const revalidate = 300

type Params = {
  searchParams: Promise<{
    sortBy?: string
    page?: string
  }>
}

const PRODUCT_LIMIT = 48

async function ShopProducts({
  page,
  sortBy,
  countryCode
}: {
  page: number
  sortBy?: string
  countryCode: string
}) {
  const region = await getRegion(countryCode)
  
  if (!region) {
    return null
  }

  const { products, total, pages } = await getRecentWeeksProducts({
    weeks: 5,
    page,
    limit: PRODUCT_LIMIT,
    sort: sortBy === "price_asc" ? "price_usd" : sortBy === "price_desc" ? "price_usd" : "order_position",
    order: sortBy === "price_asc" ? "asc" : sortBy === "price_desc" ? "desc" : "asc",
    requireImage: true
  })

  if (products.length === 0) {
    return (
      <div className="w-full text-center py-12">
        <h2 className="text-xl font-semibold mb-3">No Products Found</h2>
        <p className=" mb-4">Check back soon for new arrivals.</p>
      </div>
    )
  }

  return (
    <div className="w-full">
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

export default async function ShopPage(props: Params) {
  const searchParams = await props.searchParams
  const page = searchParams.page ? parseInt(searchParams.page) : 1

  return (
    <div className="flex flex-col pb-4" data-testid="shop-container">
      <Suspense fallback={null}>
        <ShopProducts
          page={page}
          sortBy={searchParams.sortBy}
          countryCode={DEFAULT_COUNTRY_CODE}
        />
      </Suspense>
    </div>
  )
}
