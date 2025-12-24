// src/app/(main)/search/page.tsx
"use client"

import { Suspense, useCallback, useEffect, useMemo, useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import ProductCard from "@modules/products/components/product-card"
import MixtapeCard from "@modules/mixtapes/components/mixtape-card"
import { Pagination } from "@modules/store/components/pagination"

interface SearchResult {
  id: string
  _type: "product" | "mixtape"
  title: string
  handle?: string
  slug?: string
  thumbnail?: string
  featured_image?: string
  description?: string
  artist?: string[]
  label?: string[]
  format?: string[]
  genre?: string[]
  price_usd?: number
  sku?: string
  sku5?: string
  stock?: number
  tracklist?: any[]
  contributor_name?: string
}

interface SearchState {
  products: SearchResult[]
  mixtapes: SearchResult[]
  isLoading: boolean
  searchTime: number
  total: number
  hasSearched: boolean
  currentPage: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
  productsTotal: number
  mixtapesTotal: number
}

function SearchContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const [searchState, setSearchState] = useState<SearchState>({
    products: [],
    mixtapes: [],
    isLoading: false,
    searchTime: 0,
    total: 0,
    hasSearched: false,
    currentPage: 1,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
    productsTotal: 0,
    mixtapesTotal: 0
  })

  const [previousSearchValue, setPreviousSearchValue] = useState("")

  const searchValue = searchParams.get("q") || ""
  const currentSort = searchParams.get("sort") || "latest-desc"
  const typeFilter = searchParams.get("type") || "all"
  const pageParam = parseInt(searchParams.get("page") || "1", 10)

  const filteredResults = useMemo(() => {
    let filteredProducts = searchState.products
    let filteredMixtapes = searchState.mixtapes

    if (typeFilter === "products") {
      filteredMixtapes = []
    } else if (typeFilter === "mixtapes") {
      filteredProducts = []
    }

    return {
      products: filteredProducts,
      mixtapes: filteredMixtapes,
      totalCount: filteredProducts.length + filteredMixtapes.length
    }
  }, [searchState.products, searchState.mixtapes, typeFilter])

  const performSearch = useCallback(
    async (params: any = {}) => {
      const {
        query = searchValue,
        sort = currentSort,
        page = pageParam,
        type = typeFilter
      } = params

      if (!query?.trim()) {
        setSearchState({
          products: [],
          mixtapes: [],
          isLoading: false,
          searchTime: 0,
          total: 0,
          hasSearched: false,
          currentPage: 1,
          totalPages: 0,
          hasNextPage: false,
          hasPreviousPage: false,
          productsTotal: 0,
          mixtapesTotal: 0
        })
        return
      }

      setSearchState(prev => ({ ...prev, isLoading: true, hasSearched: true }))
      const startTime = Date.now()

      try {
        const backendUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"
        const publishableKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ""
        
        const searchParams = new URLSearchParams({
          q: query,
          sort,
          page: page.toString(),
          type,
          limit: "48"
        })

        const response = await fetch(`${backendUrl}/store/search?${searchParams}`, {
          headers: {
            "Content-Type": "application/json",
            "x-publishable-api-key": publishableKey
          }
        })
        
        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.message || "Search failed")
        }

        const resultProducts = (result.products || []).filter(
          (item: SearchResult) => item._type === "product"
        )
        const resultMixtapes = (result.products || []).filter(
          (item: SearchResult) => item._type === "mixtape"
        )

        const newProductsTotal = result.productsTotal || 0
        const newMixtapesTotal = result.mixtapesTotal || 0
        const newTotal = result.total || 0

        setSearchState({
          products: resultProducts,
          mixtapes: resultMixtapes,
          isLoading: false,
          searchTime: Date.now() - startTime,
          total: newTotal,
          hasSearched: true,
          currentPage: result.page || 1,
          totalPages: result.totalPages || 0,
          hasNextPage: result.hasNextPage || false,
          hasPreviousPage: result.hasPreviousPage || false,
          productsTotal: newProductsTotal,
          mixtapesTotal: newMixtapesTotal
        })

        if ((result.products || []).length > 0) {
          setTimeout(() => {
            const clearEvent = new CustomEvent("clearSearchInputs", {
              bubbles: true,
              detail: { clearValue: true }
            })
            document.dispatchEvent(clearEvent)
          }, 100)
        }
      } catch (error) {
        console.error("Search error:", error)
        setSearchState(prev => ({
          ...prev,
          isLoading: false,
          products: [],
          mixtapes: [],
          total: 0,
          productsTotal: 0,
          mixtapesTotal: 0
        }))
      }
    },
    [searchValue, currentSort, pageParam, typeFilter]
  )

  const goToPage = useCallback(
    (page: number) => {
      if (page < 1 || page > searchState.totalPages) return

      const params = new URLSearchParams()
      if (searchValue) params.set("q", searchValue)
      if (currentSort !== "latest-desc") params.set("sort", currentSort)
      if (typeFilter !== "all") params.set("type", typeFilter)
      params.set("page", page.toString())

      router.push(`${pathname}?${params.toString()}`, { scroll: false })
    },
    [searchValue, currentSort, typeFilter, pathname, router, searchState.totalPages]
  )

  useEffect(() => {
    if (searchValue && searchValue !== previousSearchValue && previousSearchValue !== "") {
      const params = new URLSearchParams()
      params.set("q", searchValue)
      router.replace(`${pathname}?${params.toString()}`, { scroll: false })
    }
    setPreviousSearchValue(searchValue)
  }, [searchValue, previousSearchValue, pathname, router])

  useEffect(() => {
    performSearch({ page: pageParam })
  }, [searchValue, currentSort, pageParam, typeFilter, performSearch])

  const handleSortChange = (sortSlug: string) => {
    const params = new URLSearchParams()
    if (searchValue) params.set("q", searchValue)
    if (sortSlug !== "latest-desc") params.set("sort", sortSlug)
    if (typeFilter !== "all") params.set("type", typeFilter)
    params.set("page", "1")
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }

  const handleTypeChange = (type: string) => {
    const params = new URLSearchParams()
    if (searchValue) params.set("q", searchValue)
    if (type !== "products" && currentSort !== "latest-desc") {
      params.set("sort", currentSort)
    }
    if (type !== "all") params.set("type", type)
    params.set("page", "1")
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }

  const updateFilterBarVisibility = useCallback(() => {
    const hasProducts = searchState.productsTotal > 0
    const hasMixtapes = searchState.mixtapesTotal > 0
    const total = searchState.productsTotal + searchState.mixtapesTotal
    const showSortOptions = (typeFilter === 'products' || typeFilter === 'all') && searchState.productsTotal > 9
    const hideFiltersWhileLoading = searchState.isLoading

    const loadingIndicator = document.getElementById('search-loading-indicator')
    if (loadingIndicator) {
      loadingIndicator.style.display = searchState.isLoading ? 'list-item' : 'none'
    }

    document.querySelectorAll('.sort-option-item').forEach((item) => {
      (item as HTMLElement).style.display = hideFiltersWhileLoading ? 'none' : (showSortOptions ? 'list-item' : 'none')
    })

    document.querySelectorAll('.type-filter-item').forEach((item) => {
      (item as HTMLElement).style.display = hideFiltersWhileLoading ? 'none' : (total > 0 ? 'list-item' : 'none')
    })
    document.querySelectorAll('.type-filter-products').forEach((item) => {
      (item as HTMLElement).style.display = hideFiltersWhileLoading ? 'none' : ((hasProducts || total > 0) ? 'list-item' : 'none')
    })
    document.querySelectorAll('.type-filter-mixtapes').forEach((item) => {
      (item as HTMLElement).style.display = hideFiltersWhileLoading ? 'none' : (hasMixtapes ? 'list-item' : 'none')
    })

    document.querySelectorAll('.sort-option').forEach((btn) => {
      const sortSlug = btn.getAttribute('data-sort') || ''
      const shouldBold = sortSlug === currentSort && currentSort !== 'latest-desc'
      btn.classList.toggle('bold', shouldBold)
    })

    document.querySelectorAll('.type-filter').forEach((btn) => {
      const filterType = btn.getAttribute('data-type') || 'all'
      const shouldBold = filterType === typeFilter
      btn.classList.toggle('bold', shouldBold)
    })

    const resultsCountEl = document.getElementById('search-results-count')
    if (resultsCountEl) {
      resultsCountEl.textContent = `(${total} results)`
      resultsCountEl.parentElement!.style.display = hideFiltersWhileLoading ? 'none' : (total > 0 ? 'list-item' : 'none')
    }
  }, [searchState.productsTotal, searchState.mixtapesTotal, searchState.isLoading, typeFilter, currentSort])

  useEffect(() => {
    updateFilterBarVisibility()
  }, [updateFilterBarVisibility])

  useEffect(() => {
    const handleSortClick = (e: Event) => {
      const target = e.target as HTMLElement
      if (!target.classList.contains('sort-option')) return
      e.preventDefault()
      const sortSlug = target.getAttribute('data-sort') || ''
      handleSortChange(sortSlug)
    }

    const handleTypeClick = (e: Event) => {
      const target = e.target as HTMLElement
      if (!target.classList.contains('type-filter')) return
      e.preventDefault()
      const filterType = target.getAttribute('data-type') || 'all'
      handleTypeChange(filterType)
    }

    document.addEventListener('click', handleSortClick)
    document.addEventListener('click', handleTypeClick)

    return () => {
      document.removeEventListener('click', handleSortClick)
      document.removeEventListener('click', handleTypeClick)
    }
  }, [searchValue, typeFilter, currentSort])

  return (
    <div className="m-0 p-0">
      {searchValue && (
        <div className="text-center py-4">
          <h1
            className="page-title outline m-0 p-0 text-3xl md:text-4xl lg:text-5xl"
            style={searchState.isLoading ? { animation: "searchPulse 0.545s ease-in-out infinite" } : undefined}
          >
            {searchValue}
          </h1>
          <style jsx>{`
            @keyframes searchPulse {
              0%, 100% { opacity: 0.3; }
              50% { opacity: 1; }
            }
          `}</style>
        </div>
      )}

      {!searchState.isLoading && searchState.hasSearched && filteredResults.totalCount > 0 && (
        <>
          {filteredResults.products.length > 0 && (
            <div className="site-content container-fluid m-0 p-0">
              <div className="flex flex-wrap justify-center">
                {filteredResults.products.map((product, index) => (
                  <div
                    key={`product-${product.id}-${index}`}
                    className="w-1/2 sm:w-1/3 lg:w-1/4 xl:w-1/5 2xl:w-1/6 p-0 m-0"
                  >
                    <ProductCard
                      product={{
                        id: product.id,
                        title: product.title,
                        handle: product.handle || product.id,
                        thumbnail: product.thumbnail,
                        artist: product.artist,
                        label: product.label,
                        format: product.format,
                        price_usd: product.price_usd,
                        stock: product.stock
                      }}
                      priority={index < 6}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {filteredResults.mixtapes.length > 0 && (
            <div className="site-content container-fluid m-0 p-0 mt-8">
              {typeFilter === "all" && filteredResults.products.length > 0 && (
                <h2 className="section-title mb-4 text-center">Mixes</h2>
              )}
              <div className="flex flex-wrap justify-center">
                {filteredResults.mixtapes.map((mixtape, index) => (
                  <div
                    key={`mixtape-${mixtape.id}-${index}`}
                    className="w-1/2 sm:w-1/3 lg:w-1/4 xl:w-1/5 2xl:w-1/6 p-0 m-0"
                  >
                    <MixtapeCard
                      mixtape={{
                        id: mixtape.id,
                        title: mixtape.title,
                        slug: mixtape.slug || mixtape.id,
                        description: mixtape.description,
                        featured_image_url: mixtape.featured_image,
                        featured_image_alt: mixtape.title,
                        mixcloud_url: (mixtape as any).mixcloud_url,
                        contributors: (mixtape as any).contributors || [],
                        tags: (mixtape as any).tags || [],
                        tracklist: mixtape.tracklist || [],
                        featured: false,
                        published_at: (mixtape as any).created_at,
                      }}
                      index={index}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          <Pagination
            page={searchState.currentPage}
            totalPages={searchState.totalPages}
            onPageChange={goToPage}
            showPageInfo={true}
            scrollToTop={true}
          />
        </>
      )}

      {!searchState.isLoading && searchState.hasSearched && searchValue && filteredResults.totalCount === 0 && (
        <div className="text-center py-12">
          <p className="mb-4">
            No results found for &quot;{searchValue}&quot;
          </p>
          <p>
            Try searching with different keywords
          </p>
        </div>
      )}

      {!searchState.hasSearched && !searchValue && (
        <div className="text-center py-12">
          <p>
            Enter a search term to find products and mixes
          </p>
        </div>
      )}
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="py-12 text-center">
        <p>Loading search...</p>
      </div>
    }>
      <SearchContent />
    </Suspense>
  )
}
