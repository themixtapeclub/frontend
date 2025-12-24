// src/modules/home/components/dynamic-sections/product-grid-section.tsx
"use client"
import Link from "next/link"
import ProductCard from "@modules/products/components/product-card"

interface Product {
  id: string
  title: string
  handle: string
  thumbnail?: string
  artist?: string | string[]
  label?: string | string[]
  price_usd?: number
  stock?: number
  tracklist?: any[]
}

interface ProductGridSectionProps {
  section: {
    title?: string
    section_type: string
    products?: Product[]
  }
}

const SECTION_CONFIG: Record<string, { title: string; link: string; linkText: string }> = {
  featured_products: { title: "Featured", link: "/shop/featured", linkText: "View All" },
  new_products: { title: "New Arrivals", link: "/shop/new", linkText: "View All" },
  merchandise: { title: "Merchandise", link: "/shop/merchandise", linkText: "View All" },
  coming_soon: { title: "Coming Soon", link: "/shop/coming-soon", linkText: "View All" },
}

export default function ProductGridSection({ section }: ProductGridSectionProps) {
  const products = section.products || []
  const isFeatured = section.section_type === "featured_products"
  const isComingSoon = section.section_type === "coming_soon"
  const config = SECTION_CONFIG[section.section_type]

  if (products.length === 0) return null

  if (isFeatured) {
    return (
      <section className="w-full bg-black">
        <div className="flex flex-wrap justify-center">
          {products.map((product, index) => (
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
    )
  }

  return (
    <section className="w-full bg-white">
      {config && (
        <div className="flex justify-between items-center px-4 py-4 border-b border-gray-200">
          <h2 className="text-lg font-bold">{section.title || config.title}</h2>
          <Link href={config.link} className="text-black hover:underline">
            {config.linkText}
          </Link>
        </div>
      )}
      
      <div className="flex flex-wrap justify-center">
        {products.map((product) => (
          <div key={product.id} className="w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/5">
            <ProductCard 
              product={product} 
              hideOutOfStockStyle={isComingSoon}
            />
          </div>
        ))}
      </div>
    </section>
  )
}
