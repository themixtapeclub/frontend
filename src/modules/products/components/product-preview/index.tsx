// src/modules/product/components/product-preview/index.tsx
import { getProductPrice } from "@lib/util/get-product-price"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Thumbnail from "../thumbnail"
import PreviewPrice from "./price"

export default async function ProductPreview({
  product,
  isFeatured,
  region,
}: {
  product: HttpTypes.StoreProduct
  isFeatured?: boolean
  region: HttpTypes.StoreRegion
}) {
  const { cheapestPrice } = getProductPrice({
    product,
  })

  const artist = product.metadata?.artist as string | undefined
  const label = product.metadata?.label as string | undefined

  return (
    <LocalizedClientLink href={`/product/${product.handle}`} className="group">
      <div className="product m-0 p-0">
        <div className="bg-black">
          <Thumbnail
            thumbnail={product.thumbnail}
            images={product.images}
            size="full"
            isFeatured={isFeatured}
          />
        </div>
        
        <div className="pt-2 px-2 pb-4">
          <div className="artist-title">
            {artist && (
              <span className="artist">{artist}</span>
            )}
            <span className="title">{product.title}</span>
          </div>
          
          {label && (
            <p className="label-text mt-0.5">{label}</p>
          )}
          
          <div className="flex items-center gap-2 mt-2">
            {cheapestPrice && (
              <PreviewPrice price={cheapestPrice} />
            )}
          </div>
        </div>
      </div>
    </LocalizedClientLink>
  )
}