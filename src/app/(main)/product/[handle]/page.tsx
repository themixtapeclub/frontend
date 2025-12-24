// src/app/(main)/product/[handle]/page.tsx
import { Metadata } from "next"
import { notFound } from "next/navigation"
import { cookies } from "next/headers"
import { getProductByHandle } from "@lib/data/products"
import { getFirstPageProductHandles } from "@lib/data/static-params"
import { getRegionFromCookie, DEFAULT_COUNTRY_CODE } from "@lib/data/region-cookie"
import { retrieveCustomer } from "@lib/data/customer"
import ProductTemplate from "@modules/products/templates"
import { AdminHiddenIndicator } from "@modules/common/components/admin-indicator"
import { getBaseURL } from "@lib/util/env"

type Props = {
  params: Promise<{ handle: string }>
}

export const dynamic = "force-static"
export const dynamicParams = true
export const revalidate = 3600

export async function generateStaticParams() {
  try {
    return await getFirstPageProductHandles()
  } catch (error) {
    console.error("Failed to generate static paths:", error)
    return []
  }
}

function generateProductSchema(product: any, url: string) {
  const p = product as any
  const variant = p.variants?.[0]
  const price = variant?.prices?.find((pr: any) => pr.currency_code === "usd")

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.description || `${product.title} vinyl record`,
    image: product.thumbnail ? [product.thumbnail] : [],
    url: url,
    brand: p.label?.[0] ? { "@type": "Brand", name: p.label[0] } : undefined,
    category: "Music > Vinyl Records",
    offers: {
      "@type": "Offer",
      url: url,
      priceCurrency: "USD",
      price: price?.amount ? (price.amount / 100).toFixed(2) : undefined,
      availability: variant?.inventory_quantity > 0
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      seller: {
        "@type": "Organization",
        name: "The Mixtape Club",
      },
    },
    ...(p.artist?.[0] && {
      creator: {
        "@type": "MusicGroup",
        name: Array.isArray(p.artist) ? p.artist.join(", ") : p.artist,
      },
    }),
  }
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params
  const product = await getProductByHandle(params.handle)

  if (!product) {
    return {
      title: "Product Not Found",
      description: "The requested product could not be found.",
      robots: { index: false, follow: false },
    }
  }

  const p = product as any
  const artist = Array.isArray(p.artist) ? p.artist.join(", ") : p.artist
  const label = Array.isArray(p.label) ? p.label[0] : p.label
  const format = Array.isArray(p.format) ? p.format.join(", ") : p.format
  const genre = Array.isArray(p.genre) ? p.genre.join(", ") : p.genre

  const titleParts = [product.title]
  if (artist && artist.toLowerCase() !== "various") {
    titleParts.unshift(artist)
  }
  const pageTitle = titleParts.join(" - ")

  const descriptionParts = []
  if (artist) descriptionParts.push(`by ${artist}`)
  if (label) descriptionParts.push(`on ${label}`)
  if (format) descriptionParts.push(`(${format})`)
  if (genre) descriptionParts.push(`Genre: ${genre}.`)

  const description = product.description
    || `Shop ${product.title} ${descriptionParts.join(" ")}. Available at The Mixtape Club.`

  const url = `${getBaseURL()}/product/${params.handle}`

  return {
    title: pageTitle,
    description: description.slice(0, 160),
    openGraph: {
      title: pageTitle,
      description: description.slice(0, 160),
      url: url,
      type: "website",
      images: product.thumbnail
        ? [
            {
              url: product.thumbnail,
              width: 800,
              height: 800,
              alt: `${product.title}${artist ? ` by ${artist}` : ""} - Album Cover`,
            },
          ]
        : [],
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description: description.slice(0, 160),
      images: product.thumbnail ? [product.thumbnail] : [],
    },
    alternates: {
      canonical: url,
    },
  }
}

export default async function ProductPage(props: Props) {
  const params = await props.params
  const [region, product, customer] = await Promise.all([
    getRegionFromCookie(),
    getProductByHandle(params.handle),
    retrieveCustomer(),
  ])

  if (!region || !product) {
    notFound()
  }

  const p = product as any
  if (p.hidden) {
    const cookieStore = await cookies()
    const adminCookie = cookieStore.get("_tmc_admin")
    if (adminCookie?.value !== "authenticated") {
      notFound()
    }
  }

  const variants = product.variants || []
  const inStockVariant = variants.find((v: any) => (v.inventory_quantity || 0) > 0)
  const selectedVariant = inStockVariant || variants[0]

  const productWithSelectedVariant = {
    ...product,
    selectedVariant,
  }

  const url = `${getBaseURL()}/product/${params.handle}`
  const schema = generateProductSchema(product, url)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      {p.hidden && <AdminHiddenIndicator />}
      <ProductTemplate
        product={productWithSelectedVariant}
        region={region}
        countryCode={DEFAULT_COUNTRY_CODE}
        customer={customer}
      />
    </>
  )
}
