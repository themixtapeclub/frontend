// src/modules/store/templates/filtered-products.tsx
import { getFilteredProducts, FilterType } from "@lib/data/filter"
import { getRegion } from "@lib/data/regions"
import ProductCard from "@modules/products/components/product-card"
import { Pagination } from "@modules/store/components/pagination"
import Link from "next/link"

const PRODUCT_LIMIT = 48
const FEATURED_MIN_COUNT = 6

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

  const { products, total, pages, filter, featuredProducts } = await getFilteredProducts({
    type,
    value,
    page,
    limit: PRODUCT_LIMIT,
    sort: sortBy === "price_asc" ? "price_usd" : sortBy === "price_desc" ? "price_usd" : "order_position",
    order: sortBy === "price_asc" ? "asc" : sortBy === "price_desc" ? "desc" : "asc"
  })

  const hasFeatured = featuredProducts && featuredProducts.length > 0
  const canShowFeaturedStyle = hasFeatured && featuredProducts.length >= FEATURED_MIN_COUNT
  const showFeaturedSection = type === "genre" && page === 1 && canShowFeaturedStyle

  const displayProducts = (type === "genre" && page === 1 && hasFeatured && !canShowFeaturedStyle)
    ? [featuredProducts[0], ...products.filter((p: any) => p.id !== featuredProducts[0].id)]
    : products

  if (displayProducts.length === 0 && !showFeaturedSection) {
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
      {showFeaturedSection && (
        <section className="w-full bg-black">
          <div className="flex flex-wrap justify-center">
            {featuredProducts.map((product: any, index: number) => (
              <div key={product.id} className="w-1/2 md:w-1/3">
                <ProductCard
                  product={product}
                  variant="featured"
                  priority={index < 3}
                />
              </div>
            ))}
          </div>
        </section>
      )}

      <ul className="flex flex-wrap justify-center w-full list-none m-0 p-0">
        {displayProducts.map((product: any, index: number) => (
          <li
            key={product.id}
            className="w-1/2 sm:w-1/3 lg:w-1/4 flex-shrink-0"
            data-id={product.id}
            data-type="product"
          >
            <ProductCard
              product={product}
              priority={index < 4 && !showFeaturedSection}
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
