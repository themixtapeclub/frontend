// src/modules/store/templates/week-grouped-products.tsx
import { getProductsByRecentWeeks } from "@lib/data/week"
import { getRegion } from "@lib/data/regions"
import ProductCard from "@modules/products/components/product-card"
import Link from "next/link"

export default async function WeekGroupedProducts({
  sortBy,
  countryCode,
  maxWeeks = 5,
}: {
  sortBy?: string
  countryCode: string
  maxWeeks?: number
}) {
  const region = await getRegion(countryCode)
  
  if (!region) {
    return null
  }

  const weekGroups = await getProductsByRecentWeeks(maxWeeks)

  if (weekGroups.length === 0) {
    return (
      <div className="w-full text-center py-12">
        <h2 className="text-xl font-semibold mb-3">No Products Found</h2>
        <p className="">Check back soon for new arrivals.</p>
      </div>
    )
  }

  return (
    <div className="w-full">
      {weekGroups.map((group, groupIndex) => (
        <section key={group.week.value} className="mb-12">
          {/* Week Header */}
          <div className="flex items-center justify-between mb-4 border-b border-gray-200 pb-2">
            <h2 className="text-lg font-medium">
              {group.week.display_name}
            </h2>
            {group.week.product_count && group.week.product_count > group.products.length && (
              <Link 
                href={`/shop/week/${group.week.value}`}
                className="text-sm  hover:text-black transition-colors"
              >
                View all {group.week.product_count} →
              </Link>
            )}
          </div>

          {/* Products Grid */}
          <ul className="flex flex-wrap w-full list-none m-0 p-0">
            {group.products.map((product: any, index: number) => (
              <li
                key={product.id}
                className="w-1/2 sm:w-1/3 lg:w-1/4 flex-shrink-0"
                data-id={product.id}
                data-type="product"
              >
                <ProductCard
                  product={product}
                  priority={groupIndex === 0 && index < 4}
                />
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}