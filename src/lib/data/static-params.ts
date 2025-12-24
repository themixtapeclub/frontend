// src/lib/data/static-params.ts
import { getRecentWeeksProducts } from "./week"
import { getFeaturedProducts } from "./products"
import { getForthcomingProducts, getFilteredProducts, getFilterValues } from "./filter"
import { getMixtapes, getMixtape } from "./mixtapes"
import { getHomePage } from "./pages"

export interface StaticProductHandle {
  handle: string
}

export interface StaticMixtapeSlug {
  slug: string
}

export async function getFirstPageProductHandles(): Promise<StaticProductHandle[]> {
  const handles = new Set<string>()

  try {
    const [
      newProducts,
      featuredProducts,
      comingSoonProducts,
      homePageData,
    ] = await Promise.all([
      getRecentWeeksProducts({ weeks: 5, page: 1, limit: 48, requireImage: true }),
      getFeaturedProducts(36, 0),
      getForthcomingProducts({ page: 1, limit: 48 }),
      getHomePage(),
    ])

    newProducts.products.forEach((p: any) => {
      if (p.handle) handles.add(p.handle)
    })

    featuredProducts.products.forEach((p: any) => {
      if (p.handle) handles.add(p.handle)
    })

    comingSoonProducts.products.forEach((p: any) => {
      if (p.handle) handles.add(p.handle)
    })

    if (homePageData?.page?.sections) {
      homePageData.page.sections.forEach((section: any) => {
        if (section.products) {
          section.products.forEach((p: any) => {
            if (p.handle) handles.add(p.handle)
          })
        }
        if (section.slides) {
          section.slides.forEach((slide: any) => {
            if (slide.reference_data?.handle) {
              handles.add(slide.reference_data.handle)
            }
          })
        }
      })
    }

    const genres = await getFilterValues("genre")
    const formats = await getFilterValues("format")

    const genrePromises = genres.map(genre =>
      getFilteredProducts({ type: "genre", value: genre, page: 1, limit: 48 })
    )
    const formatPromises = formats.map(format =>
      getFilteredProducts({ type: "format", value: format, page: 1, limit: 48 })
    )

    const [genreResults, formatResults] = await Promise.all([
      Promise.all(genrePromises),
      Promise.all(formatPromises),
    ])

    genreResults.forEach(result => {
      result.products.forEach((p: any) => {
        if (p.handle) handles.add(p.handle)
      })
      if (result.featuredProducts) {
        result.featuredProducts.forEach((p: any) => {
          if (p.handle) handles.add(p.handle)
        })
      }
    })

    formatResults.forEach(result => {
      result.products.forEach((p: any) => {
        if (p.handle) handles.add(p.handle)
      })
    })

  } catch (error) {
    console.error("Error collecting product handles for static generation:", error)
  }

  return Array.from(handles).map(handle => ({ handle }))
}

export async function getFirstPageMixtapeSlugs(): Promise<StaticMixtapeSlug[]> {
  const slugs = new Set<string>()

  try {
    const [{ mixtapes }, homePageData] = await Promise.all([
      getMixtapes({ limit: 50, offset: 0, featured: true }),
      getHomePage(),
    ])

    mixtapes.forEach(m => {
      if (m.slug) slugs.add(m.slug)
    })

    if (homePageData?.page?.sections) {
      const mixtapeIds: string[] = []
      homePageData.page.sections.forEach((section: any) => {
        if (section.section_type === "featured_mixtape" && section.settings?.mixtape_id) {
          mixtapeIds.push(section.settings.mixtape_id)
        }
      })

      const results = await Promise.all(
        mixtapeIds.map(async (id) => {
          const mixtape = await getMixtape(id)
          return mixtape?.slug || null
        })
      )

      results.forEach(slug => {
        if (slug) slugs.add(slug)
      })
    }
  } catch (error) {
    console.error("Error collecting mixtape slugs for static generation:", error)
  }

  return Array.from(slugs).map(slug => ({ slug }))
}
