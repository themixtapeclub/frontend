import { listProducts } from "@lib/data/products"
import { HttpTypes } from "@medusajs/types"
import ProductActions from "@modules/products/components/product-actions"

/**
 * Fetches real time pricing for a product and renders the product actions component.
 */
export default async function ProductActionsWrapper({
  id,
  countryCode,
  region,
}: {
  id: string
  region: HttpTypes.StoreRegion
  countryCode: string
}) {
  const product = await listProducts({
    queryParams: { id: [id] },
    regionId: region.id,
  countryCode,
  }).then(({ response }) => response.products[0])

  if (!product) {
    return null
  }

  return <ProductActions product={product} region={region} countryCode={countryCode} />
}
