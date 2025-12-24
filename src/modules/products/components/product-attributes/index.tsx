// src/modules/products/components/product-attributes/index.tsx
import LocalizedClientLink from "@modules/common/components/localized-client-link"

type ProductAttributesProps = {
  product: any
  isOutOfStock?: boolean
}

function createSlug(text: string): string {
  if (!text || typeof text !== 'string') return ''
  const normalized = text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  return normalized.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

function formatArtistName(name: string): React.ReactNode {
  const prefixes = ["The ", "DJ "]
  for (const prefix of prefixes) {
    if (name.startsWith(prefix)) {
      return (
        <>
          <sup>{prefix.trim()}</sup> {name.slice(prefix.length)}
        </>
      )
    }
  }
  return name
}

function Condition({ product, isOutOfStock }: { product: any; isOutOfStock?: boolean }) {
  if (isOutOfStock) return null
  
  const selectedVariant = product.selectedVariant
  const conditionMedia = selectedVariant?.condition_media || product.condition_media
  const conditionSleeve = selectedVariant?.condition_sleeve || product.condition_sleeve
  const conditionNotes = selectedVariant?.condition_notes || product.condition_notes
  const inventoryQuantity = selectedVariant?.inventory_quantity ?? product.stock ?? 0

  if (!conditionMedia) return null

  const isMint = ["M", "Mint", "MINT", "m", "mint"].includes(conditionMedia)

  const formatSleeve = (sleeve: string | null): string => {
    if (!sleeve) return ""
    if (sleeve === "NM" || sleeve === "Near Mint") return "NM"
    return sleeve
  }

  if (isMint) {
    if (inventoryQuantity > 1) {
      return (
        <div className="condition pb-3">
          <span>New</span>
          {conditionNotes && (
            <div className="text-xs text-gray-600 mt-1 italic">
              {conditionNotes}
            </div>
          )}
        </div>
      )
    } else {
      const sleeveDisplay = conditionSleeve ? formatSleeve(conditionSleeve) : null
      return (
        <div className="condition pb-3">
          <div className="mb-1">
            <span className="bold mr-1">Media:</span>
            <span>NM <sup>(Shop Copy)</sup></span>
          </div>
          {sleeveDisplay && (
            <div className="mb-1">
              <span className="bold mr-1">Sleeve:</span>
              <span>{sleeveDisplay}</span>
            </div>
          )}
          {conditionNotes && (
            <div className="text-xs text-gray-600 mt-1 italic">
              {conditionNotes}
            </div>
          )}
        </div>
      )
    }
  }

  const sleeveDisplay = conditionSleeve ? formatSleeve(conditionSleeve) : null

  return (
    <div className="condition pb-3">
      <div className="mb-1">
        <span className="bold mr-1">Media:</span>
        <span>{conditionMedia}</span>
      </div>
      {sleeveDisplay && (
        <div className="mb-1">
          <span className="bold mr-1">Sleeve:</span>
          <span>{sleeveDisplay}</span>
        </div>
      )}
      {conditionNotes && (
        <div className="text-xs text-gray-600 mt-1 italic">
          {conditionNotes}
        </div>
      )}
    </div>
  )
}

export function FormatYearCountry({ product }: { product: any }) {
  const parts: React.ReactNode[] = []
  
  if (product.format && Array.isArray(product.format) && product.format.length > 0) {
    product.format.forEach((item: string, index: number) => {
      parts.push(
        <LocalizedClientLink 
          key={`format-${index}`}
          href={`/shop/format/${createSlug(item)}`}
          className="hover:underline"
        >
          {item}
        </LocalizedClientLink>
      )
    })
  }
  
  if (product.country) {
    parts.push(<span key="country">{product.country}</span>)
  }
  
  if (product.year) {
    parts.push(<span key="year">{product.year}</span>)
  }
  
  if (parts.length === 0) return null
  
  return (
    <div className="mb-2">
      {parts.map((part, index) => (
        <span key={index}>
          {part}
          {index < parts.length - 1 && ', '}
        </span>
      ))}
    </div>
  )
}

export function GenreField({ items, basePath, isOutOfStock }: { items: string[] | null; basePath: string; isOutOfStock?: boolean }) {
  if (!items || !Array.isArray(items) || items.length === 0) return null

  return (
    <div className={`flex flex-wrap mono text-small ${isOutOfStock ? 'text-gray-500' : ''}`}>
      {items.map((item, index) => (
        <LocalizedClientLink 
          key={`${item}-${index}`}
          href={`${basePath}/${createSlug(item)}`}
          className="hover:underline whitespace-nowrap mr-4"
        >
          {item}
        </LocalizedClientLink>
      ))}
    </div>
  )
}

export default function ProductAttributes({ product, isOutOfStock = false }: ProductAttributesProps) {
  return (
    <div className="product-attributes px-3">
      <Condition product={product} isOutOfStock={isOutOfStock} />
    </div>
  )
}

const DISABLED_ARTISTS = ['various', 'unknown', 'unknown artist', 'n/a']
const DISABLED_LABELS = ['not on label', 'unknown', 'n/a']

export function ArtistLink({ artist }: { artist: string[] | string | null }) {
  if (!artist) return <span>Unknown Artist</span>
  
  const artists = Array.isArray(artist) ? artist : [artist]

  return (
    <span className="bg-white">
      {artists.map((name, index) => {
        const isDisabled = DISABLED_ARTISTS.includes(name.toLowerCase().trim())
        const displayContent = formatArtistName(name)
        return (
          <span key={`${name}-${index}`}>
            {isDisabled ? (
              <span>{displayContent}</span>
            ) : (
              <LocalizedClientLink 
                href={`/shop/artist/${createSlug(name)}`}
                className="hover:underline"
              >
                {displayContent}
              </LocalizedClientLink>
            )}
            {index < artists.length - 1 && ', '}
          </span>
        )
      })}
    </span>
  )
}

export function LabelLink({ label }: { label: string[] | string | null }) {
  if (!label) return <span>Unknown Label</span>
  
  const labels = Array.isArray(label) ? label : [label]

  return (
    <span>
      {labels.map((name, index) => {
        const isDisabled = DISABLED_LABELS.includes(name.toLowerCase().trim())
        return (
          <span key={`${name}-${index}`}>
            {isDisabled ? (
              <span>{name}</span>
            ) : (
              <LocalizedClientLink 
                href={`/shop/label/${createSlug(name)}`}
                className="hover:underline"
              >
                {name}
              </LocalizedClientLink>
            )}
            {index < labels.length - 1 && ', '}
          </span>
        )
      })}
    </span>
  )
}