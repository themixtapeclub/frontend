// src/app/(main)/product/[handle]/[sku5]/page.tsx
import { Metadata } from "next"
import { notFound } from "next/navigation"
import { cookies } from "next/headers"
import { getProductByHandle, listProducts } from "@lib/data/products"
import { getRegionFromCookie, DEFAULT_COUNTRY_CODE } from "@lib/data/region-cookie"
import { retrieveCustomer } from "@lib/data/customer"
import ProductTemplate from "@modules/products/templates"
import { AdminHiddenIndicator } from "@modules/common/components/admin-indicator"

type Props = {
  params: Promise<{ handle: string; sku5: string }>
}

export async function generateStaticParams() {
  try {
    const { response } = await listProducts({
      countryCode: DEFAULT_COUNTRY_CODE,
      queryParams: { limit: 100, fields: "handle,variants" },
    })
    
    const params: { handle: string; sku5: string }[] = []
    
    for (const product of response.products) {
      if (!product.handle) continue
      for (const variant of product.variants || []) {
        if (variant.sku && variant.sku.length >= 5) {
          params.push({ handle: product.handle, sku5: variant.sku.slice(-5) })
        }
      }
    }
    
    return params
  } catch (error) {
    console.error(`Failed to generate static paths: ${error instanceof Error ? error.message : "Unknown error"}`)
    return []
  }
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params
  const product = await getProductByHandle(params.handle)

  if (!product) {
    return { title: "Product Not Found | The Mixtape Club" }
  }

  const variant = product.variants?.find((v: any) => v.sku?.endsWith(params.sku5)) as any
  const condition = variant?.condition_media ? ` (${variant.condition_media})` : ""

  return {
    title: `${product.title}${condition} | The Mixtape Club`,
    description: variant?.condition_notes || product.description || `${product.title}`,
    openGraph: {
      title: `${product.title}${condition} | The Mixtape Club`,
      description: variant?.condition_notes || product.description || `${product.title}`,
      images: variant?.image_main_url ? [variant.image_main_url] : product.thumbnail ? [product.thumbnail] : [],
    },
  }
}

export default async function ProductSkuPage(props: Props) {
  const params = await props.params
  const [region, product, customer] = await Promise.all([
    getRegionFromCookie(),
    getProductByHandle(params.handle),
    retrieveCustomer(),
  ])

  if (!region || !product) {
    notFound()
  }

  if (product.hidden) {
    const cookieStore = await cookies()
    const adminCookie = cookieStore.get("_tmc_admin")
    if (adminCookie?.value !== "authenticated") {
      notFound()
    }
  }

  const variant = product.variants?.find((v: any) => v.sku?.endsWith(params.sku5))
  
  if (!variant) {
    notFound()
  }

  const productWithSelectedVariant = {
    ...product,
    selectedVariant: variant,
  }

  return (
    <>
      {product.hidden && <AdminHiddenIndicator />}
      <ProductTemplate
        product={productWithSelectedVariant}
        region={region}
        countryCode={DEFAULT_COUNTRY_CODE}
        customer={customer}
      />
    </>
  )
}
