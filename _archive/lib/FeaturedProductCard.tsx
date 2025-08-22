'use client';

import { preloadRelatedProducts } from 'lib/relatedProducts';
import Image from 'next/image';
import Link from 'next/link';
import Price from '../../components/ui/price';

interface SwellProduct {
  id?: string;
  _id?: string;
  name: string;
  title?: string;
  slug?: string;
  handle?: string;
  sku?: string;
  price?: number;
  images?: Array<{
    file: {
      url: string;
      width?: number;
      height?: number;
    };
    caption?: string;
  }>;
  mainImage?: {
    asset: {
      url: string;
      metadata?: {
        lqip?: string;
        dimensions?: {
          width: number;
          height: number;
        };
      };
    };
  };
  imageUrl?: string;
  description?: string;
  content?: {
    artist?: string | string[];
    label?: string | string[];
    genre?: string | string[];
    format?: string | string[];
    week?: string[];
  };
  artist?: string | string[];
  label?: string | string[];
  format?: string | string[];
  stock?: number;
  stockLevel?: number;
  stock_status?: string;
  inStock?: boolean;
}

function createSlug(text: string): string {
  let decodedText = text;

  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = text;
    decodedText = tempDiv.textContent || tempDiv.innerText || text;
  } else {
    decodedText = text
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&nbsp;/g, ' ');
  }

  return decodedText
    .toLowerCase()
    .replace(/\s*&\s*/g, ' ')
    .replace(/\s+/g, '-')
    .replace(/[^\w-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

// Helper function to normalize arrays from various data sources
function normalizeToArray(value: string | string[] | undefined): string[] {
  if (!value) return [];

  if (Array.isArray(value)) {
    return value
      .flatMap((item) =>
        typeof item === 'string' && item.includes(',')
          ? item
              .split(',')
              .map((s) => s.trim())
              .filter(Boolean)
          : [item]
      )
      .filter((item) => item && typeof item === 'string' && item.trim());
  }

  if (typeof value === 'string') {
    if (value.includes(',')) {
      return value
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
    }
    return value.trim() ? [value.trim()] : [];
  }

  return [];
}

export default function ProductCard({ product }: { product: SwellProduct }) {
  // Handle images - prioritize Swell images, then Sanity, then fallback
  const imageUrl =
    product.images?.[0]?.file?.url ||
    product.mainImage?.asset?.url ||
    product.imageUrl ||
    '/placeholder.jpg';

  // Handle product name
  const productName = product.name || product.title || 'Untitled';

  // Use LQIP from Sanity if available, otherwise create blur URL
  const blurDataURL =
    product.mainImage?.asset?.metadata?.lqip ||
    (imageUrl.includes('sanity') ? imageUrl.split('?')[0] + '?w=10&h=10&blur=50&q=20' : undefined);

  // Handle price
  const price = product.price ? `$${product.price.toFixed(2)}` : 'Price TBA';

  // Handle artist/label/format
  const allArtists = normalizeToArray(product.content?.artist || product.artist);
  const allLabels = normalizeToArray(product.content?.label || product.label);
  const formatArray = normalizeToArray(product.content?.format || product.format);
  const format = formatArray.length > 0 ? formatArray[0] : null;

  // Handle stock status
  const isInStock =
    product.inStock ||
    product.stock_status === 'in_stock' ||
    (product.stock !== undefined && product.stock > 0) ||
    (product.stockLevel !== undefined && product.stockLevel > 0);

  // Handle URL generation
  const productSlug = product.slug || product.sku || product.id;
  const productUrl = `/product/${productSlug}`;

  // Simple preload handler
  const handlePreload = () => {
    try {
      preloadRelatedProducts(product.id || product._id || '');
    } catch (error) {
      console.warn('Preload failed:', error);
    }
  };

  // Helper to render artist/label links
  const renderArtistLinks = (artists: string[]) => {
    if (artists.length === 0) return null;

    return artists.map((artist, index) => (
      <span key={`artist-${index}-${artist}`}>
        <Link
          href={`/shop/artist/${createSlug(artist)}`}
          className="text-decoration-none hover:text-primary text-white"
        >
          {artist}
        </Link>
        {index < artists.length - 1 && <span className="text-white">, </span>}
      </span>
    ));
  };

  const renderLabelLinks = (labels: string[]) => {
    if (labels.length === 0) return null;

    return labels.map((label, index) => (
      <span key={`label-${index}-${label}`}>
        <Link
          href={`/shop/label/${createSlug(label)}`}
          className="text-decoration-none hover:text-primary text-white"
        >
          {label}
        </Link>
        {index < labels.length - 1 && <span className="text-white">, </span>}
      </span>
    ));
  };

  return (
    <article className="item-wrapper h-100 bg-black text-white">
      <div className="position-relative overflow-hidden" style={{ aspectRatio: '1/1' }}>
        <Link
          href={productUrl}
          className="d-block position-relative h-100"
          onMouseEnter={handlePreload}
        >
          <Image
            key={`${product.id || product._id}-${imageUrl}`} // Force remount on product change
            src={imageUrl}
            alt={productName}
            fill
            className="object-fit-cover p-5"
            sizes="(max-width: 576px) 50vw, (max-width: 768px) 33vw, (max-width: 992px) 25vw, 16vw"
            placeholder={blurDataURL ? 'blur' : 'empty'}
            blurDataURL={blurDataURL}
            onError={(e) => {
              // Fallback to placeholder if image fails to load
              const target = e.target as HTMLImageElement;
              target.src = '/placeholder.jpg';
            }}
          />
        </Link>

        {/* Out of stock overlay */}
        {!isInStock && (
          <div className="position-absolute d-flex align-items-center justify-content-center bg-dark start-0 top-0 bg-opacity-50">
            <span className="badge bg-warning">Out of Stock</span>
          </div>
        )}
      </div>

      <div className="item-content d-flex flex-column p-3">
        <h6 className="item-title fw-semibold text-truncate" title={productName}>
          <Link href={productUrl} className="text-decoration-none text-white">
            {productName}
          </Link>
        </h6>

        {/* Artist information */}
        {allArtists.length > 0 && (
          <p className="item-meta small text-white">{renderArtistLinks(allArtists)}</p>
        )}

        {/* Label information */}
        {allLabels.length > 0 && (
          <p className="item-meta small text-white">{renderLabelLinks(allLabels)}</p>
        )}

        <div className="d-flex justify-content-between align-items-center mt-auto">
          <div className="item-price">
            {product.price ? (
              <Price
                amount={product.price.toString()}
                currencyCode="USD"
                className="d-inline"
                currencyCodeClassName="d-none" // Hide the USD since it's already in the symbol
              />
            ) : (
              <span>Price TBA</span>
            )}
          </div>{' '}
          {/* {format && <small className="text-white">{format}</small>} */}
        </div>
      </div>
    </article>
  );
}
