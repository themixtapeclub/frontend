// src/modules/store/templates/filter-page.tsx
import { FilterType } from "@lib/data/filter"
import FilteredProducts from "./filtered-products"

interface FilterPageProps {
  type: FilterType
  slug: string
  displayName: string
  sortBy?: string
  page: number
  countryCode: string
}

export default function FilterPage({
  type,
  slug,
  displayName,
  sortBy,
  page,
  countryCode,
}: FilterPageProps) {
  return (
    <div className="w-full px-0">
      <FilteredProducts
        type={type}
        value={slug}
        sortBy={sortBy}
        page={page}
        countryCode={countryCode}
      />
    </div>
  )
}