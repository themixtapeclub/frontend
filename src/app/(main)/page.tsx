// src/app/(main)/page.tsx
import { Metadata } from "next"
import { getHomePage } from "@lib/data/pages"
import DynamicSections from "@modules/home/components/dynamic-sections"
import FeaturedProducts from "@modules/home/components/featured-products"
import Hero from "@modules/home/components/hero"
import { listCollections } from "@lib/data/collections"
import { getRegionFromCookie } from "@lib/data/region-cookie"

export const metadata: Metadata = {
  title: "The Mixtape Club",
  description: "Vinyl records and mixtapes.",
}

export const dynamic = "force-static"

export default async function Home() {
  const region = await getRegionFromCookie()
  
  try {
    const pageData = await getHomePage()
    
    if (pageData?.page?.sections && pageData.page.sections.length > 0) {
      return (
        <div data-homepage="true">
          <DynamicSections sections={pageData.page.sections} />
        </div>
      )
    }
  } catch (error) {
    console.error("[Home] Failed to fetch dynamic homepage:", error)
  }

  const { collections } = await listCollections({
    fields: "id, handle, title",
  })

  if (!collections || !region) {
    return null
  }

  return (
    <div data-homepage="true">
      <Hero />
      <div className="py-12">
        <ul className="flex flex-col gap-x-4">
          <FeaturedProducts collections={collections} region={region} />
        </ul>
      </div>
    </div>
  )
}
