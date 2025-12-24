// src/modules/home/components/dynamic-sections/index.tsx
"use client"

import CarouselSection from "./carousel-section"
import FeaturedMixtapeSection from "./featured-mixtape-section"
import ProductGridSection from "./product-grid-section"
import ProductCollectionSection from "./product-collection-section"

interface Section {
  id: string
  section_type: string
  title?: string
  order_position: number
  is_visible: boolean
  settings: any
  slides?: any[]
  mixtape?: any
  products?: any[]
}

interface DynamicSectionsProps {
  sections: Section[]
}

export default function DynamicSections({ sections }: DynamicSectionsProps) {
  if (!sections || sections.length === 0) return null

  return (
    <>
      {sections
        .filter((section) => section.is_visible)
        .sort((a, b) => a.order_position - b.order_position)
        .map((section) => {
          switch (section.section_type) {
            case "carousel":
              return (
                <CarouselSection
                  key={section.id}
                  section={section}
                />
              )
            case "featured_mixtape":
              return (
                <FeaturedMixtapeSection
                  key={section.id}
                  section={section}
                />
              )
            case "featured_products":
            case "new_products":
            case "merchandise":
            case "coming_soon":
              return (
                <ProductGridSection
                  key={section.id}
                  section={section}
                />
              )
            case "product_collection":
              return (
                <ProductCollectionSection
                  key={section.id}
                  section={section}
                />
              )
            default:
              return null
          }
        })}
    </>
  )
}
