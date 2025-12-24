// src/app/(main)/shop/coming-soon/page.tsx
import { Metadata } from "next"
import { DEFAULT_COUNTRY_CODE } from "@lib/data/region-cookie"
import { getRegion } from "@lib/data/regions"
import { getForthcomingProducts } from "@lib/data/filter"
import ProductCard from "@modules/products/components/product-card"
import { Pagination } from "@modules/store/components/pagination"
import { getBaseURL } from "@lib/util/env"

const PRODUCT_LIMIT = 48

type Props = {
  searchParams: Promise<{
    page?: string
  }>
}

const url = `${getBaseURL()}/shop/coming-soon`

export const metadata: Metadata = {
  title: "Coming Soon",
  description: "Forthcoming releases on vinyl, cassette and CD",
  openGraph: {
    title: "Coming Soon, Pre-Orders | The Mixtape Club",
    description: "Forthcoming releases on vinyl, cassette and CD",
    url: url,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Coming Soon, Pre-Orders | The Mixtape Club",
    description: "Forthcoming releases on vinyl, cassette and CD",
  },
  alternates: {
    canonical: url,
  },
}

export const dynamic = "force-static"
export const revalidate = 300

export default async function ComingSoonPage(props: Props) {
  const searchParams = await props.searchParams
  const page = searchParams.page ? parseInt(searchParams.page) : 1
  const region = await getRegion(DEFAULT_COUNTRY_CODE)

  if (!region) {
    return null
  }

  const { products, pages } = await getForthcomingProducts({
    page,
    limit: PRODUCT_LIMIT,
  })

  if (products.length === 0) {
    return (
      <section className="w-full text-center py-12" aria-labelledby="empty-heading">
        <h1 id="empty-heading" className="text-xl font-semibold mb-3">No forthcoming releases</h1>
        <p className="mb-4">Check back soon for new pre-orders.</p>
      </section>
    )
  }

  return (
    <section className="w-full" aria-labelledby="coming-soon-heading">
      <h1 id="coming-soon-heading" className="sr-only">Coming Soon - Pre-Orders</h1>
      <ul
        className="flex flex-wrap justify-center w-full list-none m-0 p-0"
        role="list"
        aria-label="Forthcoming releases"
      >
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
              hideOutOfStockStyle
            />
          </li>
        ))}
      </ul>

      {pages > 1 && (
        <nav className="w-full mt-8" aria-label="Pagination">
          <Pagination page={page} totalPages={pages} />
        </nav>
      )}
    </section>
  )
}
