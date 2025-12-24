// frontend/src/modules/products/components/related-products/index.tsx
import { HttpTypes } from "@medusajs/types"
import { getRegion } from "@lib/data/regions"
import { getRelatedProducts, RelatedProduct } from "@lib/data/related-products"
import ProductCard from "../product-card"
import RelatedSection from "@modules/common/components/related-section"

type RelatedProductsProps = {
  product: HttpTypes.StoreProduct
  countryCode: string
}

function getMoreByTitle(
  products: RelatedProduct[],
  validArtists: string[],
  validLabels: string[]
): string | null {
  if (products.length === 0) return null

  const matchedArtists = new Set<string>()
  const matchedLabels = new Set<string>()

  products.forEach((product) => {
    const productArtists = product.artist || []
    const productLabels = product.label || []

    productArtists.forEach((artist) => {
      if (validArtists.some((va) => va.toLowerCase() === artist.toLowerCase())) {
        matchedArtists.add(artist)
      }
    })

    productLabels.forEach((label) => {
      if (validLabels.some((vl) => vl.toLowerCase() === label.toLowerCase())) {
        matchedLabels.add(label)
      }
    })
  })

  const artistList = Array.from(matchedArtists)
  const labelList = Array.from(matchedLabels)

  const hasArtistMatches = artistList.length > 0
  const hasLabelMatches = labelList.length > 0

  if (hasArtistMatches && hasLabelMatches) {
    const artistPart =
      artistList.length === 1
        ? artistList[0]
        : artistList.slice(0, 2).join(" & ")

    const labelPart =
      labelList.length === 1
        ? labelList[0]
        : labelList.slice(0, 2).join(" & ")

    return `More by ${artistPart} & ${labelPart}`
  } else if (hasArtistMatches) {
    if (artistList.length === 1) {
      return `More by ${artistList[0]}`
    } else {
      return `More by ${artistList.slice(0, 2).join(" & ")}`
    }
  } else if (hasLabelMatches) {
    if (labelList.length === 1) {
      return `More by ${labelList[0]}`
    } else {
      return `More by ${labelList.slice(0, 2).join(" & ")}`
    }
  }

  return null
}

export default async function RelatedProducts({
  product,
  countryCode,
}: RelatedProductsProps) {
  const region = await getRegion(countryCode)

  if (!region) {
    return null
  }

  const { artistLabelProducts, tagBasedProducts, validArtists, validLabels } =
    await getRelatedProducts(product.id, 12)

  const totalProducts = artistLabelProducts.length + tagBasedProducts.length

  if (totalProducts === 0) {
    return null
  }

  const shouldConsolidate = artistLabelProducts.length <= 1

  let finalArtistLabelProducts: RelatedProduct[] = []
  let finalTagBasedProducts: RelatedProduct[] = []

  if (shouldConsolidate) {
    finalArtistLabelProducts = []
    finalTagBasedProducts = [...artistLabelProducts, ...tagBasedProducts]
  } else {
    finalArtistLabelProducts = artistLabelProducts
    finalTagBasedProducts = tagBasedProducts
  }

  const shownProductIds = new Set<string>([product.id])
  finalArtistLabelProducts.forEach((p) => shownProductIds.add(p.id))
  
  const deduplicatedTagProducts = finalTagBasedProducts.filter(
    (p) => !shownProductIds.has(p.id)
  )

  const moreByTitle = getMoreByTitle(
    finalArtistLabelProducts,
    validArtists,
    validLabels
  )

  const showMoreBy = !shouldConsolidate && finalArtistLabelProducts.length > 0 && moreByTitle

  return (
    <div className="related-products">
      {showMoreBy && (
        <RelatedSection title={moreByTitle} isFirst>
          {finalArtistLabelProducts.slice(0, 12).map((relatedProduct, index) => (
            <li 
              key={relatedProduct.id}
              className="w-1/2 small:w-1/3 medium:w-1/4 large:w-1/6"
            >
              <ProductCard 
                product={relatedProduct} 
                priority={index < 6}
              />
            </li>
          ))}
        </RelatedSection>
      )}

      {deduplicatedTagProducts.length > 0 && (
        <RelatedSection title="More like this" isFirst={!showMoreBy}>
          {deduplicatedTagProducts.slice(0, 12).map((relatedProduct, index) => (
            <li 
              key={relatedProduct.id}
              className="w-1/2 small:w-1/3 medium:w-1/4 large:w-1/6"
            >
              <ProductCard 
                product={relatedProduct} 
                priority={index < 6}
              />
            </li>
          ))}
        </RelatedSection>
      )}
    </div>
  )
}