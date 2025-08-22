// app/product/[handle]/page.tsx
import { ProductDescription } from '@/components/product/Content';
import { OptimizedImages } from 'components/common/OptimizedImages';
import {
  ImagesErrorBoundary,
  ProductDetailsErrorBoundary,
  ProductErrorBoundary,
  RelatedProductsErrorBoundary
} from 'components/error-boundaries/ApiErrorBoundary';
import ClientSideRelatedProducts from 'components/product/ClientSideRelatedProducts';
import { ScrollToTop } from 'components/ui/ScrollToTop';
import { getBatchProductsCached, getNewProductsCached } from 'lib/data/products/index';
import { SanityContent } from 'lib/data/products/types';
import { getRelatedProducts } from 'lib/queries/sanity/products/relatedProducts';
import { getProductDataBySwell } from 'lib/services/optimizedProduct';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

// Generate static params for homepage products + limited new products
export async function generateStaticParams() {
  try {
    console.log('🏠 Generating static params for homepage and new products...');

    // Get homepage products (existing)
    const productsData = await getBatchProductsCached();
    const allHomepageProducts = [...productsData.featured, ...productsData.new];
    const uniqueHomepageProducts = allHomepageProducts.filter(
      (product, index, arr) => arr.findIndex((p) => p.slug === product.slug) === index
    );

    console.log(`🏠 Found ${uniqueHomepageProducts.length} homepage products`);

    // Get just 10 new products to avoid timeouts
    const newProducts = await getNewProductsCached();
    const limitedNewProducts = newProducts?.slice(0, 10) || [];

    console.log(`🆕 Adding ${limitedNewProducts.length} new products`);

    // Combine and deduplicate
    const allProducts = [...uniqueHomepageProducts, ...limitedNewProducts];
    const uniqueProducts = allProducts.filter(
      (product, index, arr) => arr.findIndex((p) => p.slug === product.slug) === index
    );

    console.log(`🚀 Total: ${uniqueProducts.length} static products`);

    return uniqueProducts.map((product) => ({ handle: product.slug }));
  } catch (error) {
    console.error('❌ Error generating static params:', error);
    return [];
  }
}

export const revalidate = 3600;

interface OptimizedProduct {
  id: string;
  name: string;
  price: number;
  currency: string;
  description: string;
  stock_level: number;
  stock_purchasable?: boolean;
  images?: any[];
  category?: string;
  sanityContent?: any;
  swellProductId?: string;
  [key: string]: any;
}

interface ProductData {
  product: OptimizedProduct;
  sanityData: SanityContent | any;
}

const productCache = new Map<string, { data: ProductData; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

async function getProductDataOptimized(handle: string): Promise<ProductData | null> {
  // Check cache first
  const cached = productCache.get(handle);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  try {
    // Single attempt with timeout
    const result = await Promise.race([
      getProductDataBySwell(handle),
      new Promise<null>((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000))
    ]);

    if (result) {
      productCache.set(handle, {
        data: result as ProductData,
        timestamp: Date.now()
      });
      return result as ProductData;
    }
  } catch (error) {
    // Return stale cache if available
    if (cached) {
      return cached.data;
    }
    throw error;
  }

  return null;
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ handle: string }>;
}): Promise<Metadata> {
  const { handle } = await params;

  const defaultMetadata: Metadata = {
    title: 'The Mixtape Club - Vinyl Records',
    description: 'Discover rare and classic vinyl records',
    other: {
      'format-detection': 'telephone=no'
    }
  };

  try {
    const data = await Promise.race([
      getProductDataOptimized(handle),
      new Promise<null>((resolve) => setTimeout(() => resolve(null), 2000))
    ]);

    if (!data) {
      return defaultMetadata;
    }

    const { product, sanityData } = data;
    const title = sanityData?.title || product?.name || 'Product';
    const description =
      sanityData?.description || product?.description || `Shop ${title} at The Mixtape Club`;
    const imageUrl =
      sanityData?.mainImage?.asset?.url ||
      (product?.images && product.images.length > 0 ? product.images[0]?.file?.url : null);

    const metadata: Metadata = {
      title: `${title} - The Mixtape Club`,
      description: description?.slice(0, 160) || defaultMetadata.description,
      other: {
        'format-detection': 'telephone=no'
      }
    };

    if (imageUrl) {
      const width = sanityData?.mainImage?.asset?.metadata?.dimensions?.width || 1200;
      const height = sanityData?.mainImage?.asset?.metadata?.dimensions?.height || 630;

      metadata.openGraph = {
        type: 'website',
        title,
        description: metadata.description || '',
        images: [{ url: imageUrl, width, height, alt: title }]
      };

      metadata.twitter = {
        card: 'summary_large_image',
        title,
        description: metadata.description || '',
        images: { url: imageUrl, alt: title }
      };
    }

    return metadata;
  } catch (error) {
    return defaultMetadata;
  }
}

export default async function OptimizedProductPage({
  params
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  let data: ProductData | null = null;
  let relatedProductsData: any = null;

  try {
    data = await getProductDataOptimized(handle);

    // Fetch related products in parallel with timeout
    if (data?.product) {
      try {
        relatedProductsData = await Promise.race([
          getRelatedProducts(data.product, 12),
          new Promise<null>((resolve) => setTimeout(() => resolve(null), 2000))
        ]);
      } catch (relatedError) {
        // Silently fail - client will handle it
      }
    }
  } catch (err) {}

  if (!data) {
    notFound();
  }

  const { product, sanityData } = data;

  if (!product.id && !product.name) {
    notFound();
  }

  const isGiftCard =
    product?.category === 'giftcard' || product?.name?.toLowerCase().includes('gift card');
  let enhancedProduct: OptimizedProduct = { ...product };

  if (isGiftCard) {
    let giftCardPrice = 25;
    enhancedProduct = {
      ...product,
      price: giftCardPrice,
      stock_purchasable: true,
      stock_level: 999
    };
  }

  enhancedProduct = {
    ...enhancedProduct,
    sanityContent: sanityData
  };

  const imageUrl =
    sanityData?.mainImage?.asset?.url ||
    (product?.images && product.images.length > 0 ? product.images[0]?.file?.url : null);

  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: sanityData?.title || product?.name || 'Unknown Product',
    ...(imageUrl && { image: imageUrl }),
    offers: {
      '@type': 'Offer',
      availability: enhancedProduct?.stock_purchasable
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      priceCurrency: product?.currency || 'USD',
      price: enhancedProduct?.price ?? 0
    }
  };

  return (
    <ProductErrorBoundary>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />

      <ScrollToTop />

      <div className="container-fluid">
        <ImagesErrorBoundary>
          <ProductImagesOptimized
            handle={handle}
            product={enhancedProduct}
            sanityData={sanityData}
          />
        </ImagesErrorBoundary>

        <ProductDetailsErrorBoundary>
          <ProductDetailsOptimized
            handle={handle}
            product={enhancedProduct}
            sanityData={sanityData}
          />
        </ProductDetailsErrorBoundary>
      </div>

      <RelatedProductsErrorBoundary>
        <ClientSideRelatedProducts
          currentProduct={enhancedProduct}
          limit={12}
          serverData={relatedProductsData}
        />
      </RelatedProductsErrorBoundary>
    </ProductErrorBoundary>
  );
}

function ProductImagesOptimized({
  handle,
  product,
  sanityData
}: {
  handle: string;
  product: OptimizedProduct;
  sanityData: any;
}) {
  try {
    return (
      <OptimizedImages
        handle={handle}
        product={product}
        sanityBasic={sanityData}
        enableFadeIn={true}
      />
    );
  } catch {
    return <div className="col-12">Unable to load product images</div>;
  }
}

function ProductDetailsOptimized({
  handle,
  product,
  sanityData
}: {
  handle: string;
  product: OptimizedProduct;
  sanityData: any;
}) {
  try {
    return (
      <div className="row product-details">
        <ProductDescription
          product={product}
          initialSanityContent={sanityData}
          sanityProduct={sanityData}
        />
      </div>
    );
  } catch {
    return (
      <div className="row product-details">
        <div className="col-12">
          <h1>{sanityData?.title || product?.name || 'Product'}</h1>
          <p>Unable to load full product details</p>
        </div>
      </div>
    );
  }
}
