// frontend/src/modules/products/templates/index.tsx
import React from "react"
import ImageGallery from "@modules/products/components/image-gallery"
import ProductActions from "@modules/products/components/product-actions"
import ProductInfo from "@modules/products/templates/product-info"
import ProductAttributes from "@modules/products/components/product-attributes"
import TracklistColumn from "@modules/products/components/tracklist-column"
import RelatedProducts from "@modules/products/components/related-products"
import NowPlayingOverlay from "@modules/products/components/now-playing-overlay"
import OscilloscopeLine from "@modules/products/components/oscilloscope-line"
import { notFound } from "next/navigation"
import { HttpTypes } from "@medusajs/types"

type ProductTemplateProps = {
  product: HttpTypes.StoreProduct & { selectedVariant?: any }
  region: HttpTypes.StoreRegion
  countryCode: string
  customer?: { id: string; email: string } | null
}

const ProductTemplate: React.FC<ProductTemplateProps> = ({
  product,
  region,
  countryCode,
  customer,
}) => {
  if (!product || !product.id) {
    return notFound()
  }

  const p = product as any
  const selectedVariant = p.selectedVariant
  const hasMultipleVariants = (product.variants?.length || 0) > 1
  
  const variantImages: HttpTypes.StoreProductImage[] = []
  if (selectedVariant?.image_main_url) {
    variantImages.push({ 
      id: `variant_img_main_${selectedVariant.id}`,
      rank: 0, 
      url: selectedVariant.image_main_url 
    })
  }
  if (selectedVariant?.additional_images && Array.isArray(selectedVariant.additional_images)) {
    selectedVariant.additional_images.forEach((url: string, idx: number) => {
      if (url) {
        variantImages.push({ 
          id: `variant_img_${selectedVariant.id}_${idx}`,
          rank: idx + 1, 
          url 
        })
      }
    })
  }
  
  const displayImages = hasMultipleVariants 
    ? variantImages 
    : (variantImages.length > 0 ? variantImages : (product?.images || []))
  
  const discogsReleaseId = selectedVariant?.discogs_release_id || p.discogs_release_id
  const tracklist = p.tracklist  
  const hasTracklist = tracklist && Array.isArray(tracklist) && tracklist.length > 0
  const canEnrichTracklist = !!discogsReleaseId
  const showTracklistColumn = hasTracklist || canEnrichTracklist

  const isOutOfStock = selectedVariant ? (selectedVariant.inventory_quantity ?? 0) <= 0 : product.variants?.every(
    (v) => v.manage_inventory && (v.inventory_quantity ?? 0) <= 0
  ) ?? false

  const productForGallery = {
    ...product,
    discogs_release_id: discogsReleaseId,
  }

  return (
    <>
      <div className="product-images bg-black w-full relative">
        <ImageGallery images={displayImages} product={productForGallery} />
        <OscilloscopeLine images={displayImages} productHandle={product?.handle} />
        <NowPlayingOverlay />
      </div>

      <div className="product-details flex flex-col small:flex-row border-b border-black">
        <div 
          className={`product-info-col border-b small:border-b-0 flex flex-col ${isOutOfStock ? '!min-h-0' : 'min-h-[400px]'} ${showTracklistColumn ? 'flex-1 small:border-r border-black' : 'flex-[2] small:border-r border-black'}`}
        >
          <ProductInfo product={product} isOutOfStock={isOutOfStock} />
        </div>

        {showTracklistColumn && (
          <TracklistColumn tracklist={tracklist} product={productForGallery} />
        )}

        <div className={`product-actions-col small:w-[280px] ${isOutOfStock ? '!min-h-0' : ''}`}>
          <div className="sticky sticky-below-header">
            <ProductActions product={product} region={region} countryCode={countryCode} customer={customer} />
            <ProductAttributes product={product} isOutOfStock={isOutOfStock} />
          </div>
        </div>
      </div>

      <RelatedProducts product={product} countryCode={countryCode} />
    </>
  )
}

export default ProductTemplate