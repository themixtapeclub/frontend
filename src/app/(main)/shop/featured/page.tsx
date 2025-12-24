// src/app/(main)/shop/featured/page.tsx
import { Metadata } from "next"
import { getFeaturedProducts } from "@lib/data/products"
import ProductCard from "@modules/products/components/product-card"
import Link from "next/link"
import { getBaseURL } from "@lib/util/env"

const url = `${getBaseURL()}/shop/featured`

export const metadata: Metadata = {
  title: "Featured Vinyl Records, CDs and Cassettes",
  description: "Featured releases on vinyl, cassette and CD",
  openGraph: {
    title: "Featured Vinyl Records, CDs and Cassettes | The Mixtape Club",
    description: "Featured releases on vinyl, cassette and CD",
    url: url,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Featured Vinyl Records, CDs and Cassettes | The Mixtape Club",
    description: "Featured releases on vinyl, cassette and CD",
  },
  alternates: {
    canonical: url,
  },
}

export const dynamic = "force-static"
export const revalidate = 300

const PRODUCTS_PER_PAGE = 36

export default async function FeaturedPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const params = await searchParams
  const page = parseInt(params.page || "1")
  const offset = (page - 1) * PRODUCTS_PER_PAGE

  const { products, count } = await getFeaturedProducts(PRODUCTS_PER_PAGE, offset)
  const totalPages = Math.ceil(count / PRODUCTS_PER_PAGE)

  return (
    <section className="w-full" aria-labelledby="featured-heading">
      <h1 id="featured-heading" className="sr-only">Featured Products</h1>

      {products.length === 0 ? (
        <div className="text-center py-12" role="status">
          <p>No featured products available at the moment.</p>
        </div>
      ) : (
        <>
          <div className="w-full bg-black">
            <ul
              className="flex flex-wrap justify-center list-none m-0 p-0"
              role="list"
              aria-label="Featured products"
            >
              {products.map((product, index) => (
                <li key={product.id} className="w-1/2 md:w-1/3">
                  <ProductCard
                    product={product}
                    variant="featured"
                    priority={index < 3}
                  />
                </li>
              ))}
            </ul>
          </div>

          {totalPages > 1 && (
            <nav
              className="flex justify-center items-center gap-4 py-8 bg-black"
              aria-label="Pagination"
            >
              {page > 1 && (
                <Link
                  href={`/shop/featured?page=${page - 1}`}
                  className="px-4 py-2 text-white hover:underline mono focus:outline-none focus:ring-2 focus:ring-teal-400"
                  aria-label="Go to previous page"
                >
                  ← Previous
                </Link>
              )}

              <span className="mono" aria-current="page">
                Page {page} of {totalPages}
              </span>

              {page < totalPages && (
                <Link
                  href={`/shop/featured?page=${page + 1}`}
                  className="px-4 py-2 text-white hover:underline mono focus:outline-none focus:ring-2 focus:ring-teal-400"
                  aria-label="Go to next page"
                >
                  Next →
                </Link>
              )}
            </nav>
          )}
        </>
      )}
    </section>
  )
}
