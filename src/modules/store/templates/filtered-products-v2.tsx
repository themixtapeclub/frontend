// src/modules/store/templates/filtered-products.tsx
import { getFilteredProducts, FilterType } from "@lib/data/filter"
import { getRegion } from "@lib/data/regions"
import ProductCard from "@modules/products/components/product-card"
import { Pagination } from "@modules/store/components/pagination"
import Link from "next/link"

const PRODUCT_LIMIT = 48

export default async function FilteredProducts({
  type,
  value,
  sortBy,
  page,
  countryCode,
}: {
  type: FilterType
  value: string
  sortBy?: string
  page: number
  countryCode: string
}) {
  const region = await getRegion(countryCode)
  
  if (!region) {
    return null
  }

  const { products, total, pages, filter } = await getFilteredProducts({
    type,
    value,
    page,
    limit: PRODUCT_LIMIT,
    sort: sortBy === "price_asc" ? "price_usd" : sortBy === "price_desc" ? "price_usd" : "created_at",
    order: sortBy === "price_asc" ? "asc" : "desc"
  })

  if (products.length === 0) {
    return (
      <div className="w-full text-center py-12">
        <h2 className="text-xl font-semibold mb-3">
          No releases found for {filter.display_name}
        </h2>
        <p className=" mb-4">
          We couldn&apos;t find any products for this {type}.
        </p>
        <Link href="/shop" className="underline">
          Browse All Products
        </Link>
      </div>
    )
  }

  return (
    <div className="w-full">
      <ul className="flex flex-wrap justify-center w-full">
        {products.map((product: any, index: number) => (
          <li
            key={product.id}
            className="w-1/2 sm:w-1/3 lg:w-1/4"
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