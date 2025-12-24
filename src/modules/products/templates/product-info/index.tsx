// frontend/src/modules/products/templates/product-info/index.tsx
import { HttpTypes } from "@medusajs/types"
import { ArtistLink, LabelLink } from "@modules/products/components/product-attributes"
import InMixtapes from "@modules/products/components/in-mixtapes"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { getProductPrice } from "@lib/util/get-product-price"

function createSlug(text: string): string {
  if (!text || typeof text !== 'string') return ''
  const normalized = text.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
  return normalized.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

type ProductInfoProps = {
  product: HttpTypes.StoreProduct & {
    artist?: string[] | string
    label?: string[] | string
    catalog?: string
    format?: string[]
    country?: string
    year?: string
    genre?: string[]
    inmixtapes?: Array<{
      id: string
      title: string
      slug: string
      trackPosition?: number
      trackTitle?: string
      trackArtist?: string
    }>
  }
  isOutOfStock?: boolean
}

const ProductInfo = ({ product, isOutOfStock = false }: ProductInfoProps) => {
  const inMixtapes = (product as any).inmixtapes || []
  const p = product as any

  const { cheapestPrice } = getProductPrice({ product })
  const priceNumber = cheapestPrice?.calculated_price_number
  const formattedPrice = priceNumber ? `$${Math.floor(priceNumber)}` : null
  
return (
  <div id="product-info" className="product-info p-0 flex flex-col h-full">
    <div className="px-4 pt-2 flex-1">
      <div className="sticky sticky-below-header z-10 mb-2">
        <div className="artist-title artist-title--large">
          <span className="artist">
            <span className="bg-white">
              <ArtistLink artist={p.artist} />
            </span>
          </span>
          <h1 className="title">
            <span className="bg-white">{product.title}</span>
          </h1>
        </div>
      </div>
      
      <div className="label-text mb-3 flex flex-wrap">
        <span className="whitespace-nowrap mr-3">
          <LabelLink label={p.label} />
        </span>
        {p.catalog && (
          <span className="whitespace-nowrap mr-3">{p.catalog}</span>
        )}
        {p.format && Array.isArray(p.format) && p.format.length > 0 && (
          <span className="whitespace-nowrap mr-3">
            {p.format.map((item: string, index: number) => (
              <span key={`format-${index}`}>
                <LocalizedClientLink 
                  href={`/shop/format/${createSlug(item)}`}
                  className="hover:underline"
                >
                  {item}
                </LocalizedClientLink>
                {index < p.format.length - 1 && ', '}
              </span>
            ))}
          </span>
        )}
        {p.country && (
          <span className="whitespace-nowrap mr-3">{p.country}</span>
        )}
        {p.year && (
          <span className="whitespace-nowrap mr-3">{p.year}</span>
        )}
        {isOutOfStock && formattedPrice && (
          <span className="whitespace-nowrap mr-3 text-gray-500">{formattedPrice}</span>
        )}
        {isOutOfStock && (
          <span className="whitespace-nowrap text-gray-400">Out of stock</span>
        )}
      </div>
      
      {product.description && (
        <div 
          className="description leading-snug [&>p]:mb-3 [&>p:last-child]:mb-0 mb-10"
          dangerouslySetInnerHTML={{ __html: product.description }}
        />
      )}
    </div>

    {p.genre && Array.isArray(p.genre) && p.genre.length > 0 && (
      <div className="px-4 pb-4 mt-auto flex flex-wrap mono text-small">
        {p.genre.map((item: string, index: number) => (
          <LocalizedClientLink 
            key={`genre-${index}`}
            href={`/shop/genre/${createSlug(item)}`}
            className="hover:underline whitespace-nowrap mr-4"
          >
            {item}
          </LocalizedClientLink>
        ))}
      </div>
    )}
    
    {inMixtapes.length > 0 && (
      <InMixtapes inMixtapes={inMixtapes} />
    )}
  </div>
)
}

export default ProductInfo