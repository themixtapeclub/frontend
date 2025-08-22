// components/products/ArchivePage.tsx

import { GridContainer } from 'components/grid/Container';
import { GridItem } from 'components/grid/Item';
import { ArchivePagination } from 'components/products/ArchivePagination';
import Product from 'components/products/ProductCard';
import { HIDDEN_PRODUCT_TAG } from 'lib/shared/constants/global';
import { slugToDisplayName } from 'lib/utils/slug';
import type { Metadata } from 'next';
import Link from 'next/link';
import SubmenuProvider from '../layout/header/submenuProvider'; // Use the provider

// export const runtime = 'edge'; // Removed to allow static generation

// Performance logging utility with SSR/Client compatibility
class PerformanceLogger {
  private static timers: Map<string, number> = new Map();
  private static isEnabled =
    process.env.NODE_ENV === 'development' || process.env.ENABLE_PERF_LOGGING === 'true';

  // Get current time in milliseconds (works in both server and client)
  private static now(): number {
    if (typeof performance !== 'undefined' && performance.now) {
      return performance.now();
    }
    // Fallback for server-side or environments without performance.now()
    return Date.now();
  }

  static start(label: string): void {
    if (!this.isEnabled) return;
    this.timers.set(label, this.now());
  }

  static end(label: string): number {
    if (!this.isEnabled) return 0;

    const startTime = this.timers.get(label);
    if (!startTime) {
      return 0;
    }

    const duration = this.now() - startTime;
    this.timers.delete(label);

    // Color code based on duration
    const color = duration < 100 ? '🟢' : duration < 500 ? '🟡' : '🔴';

    return duration;
  }

  static measure(label: string, fn: () => any): any {
    if (!this.isEnabled) return fn();

    this.start(label);
    try {
      const result = fn();
      this.end(label);
      return result;
    } catch (error) {
      this.end(label);
      throw error;
    }
  }

  static async measureAsync<T>(label: string, fn: () => Promise<T>): Promise<T> {
    if (!this.isEnabled) return fn();

    this.start(label);
    try {
      const result = await fn();
      this.end(label);
      return result;
    } catch (error) {
      this.end(label);
      throw error;
    }
  }

  static logMemoryUsage(label: string): void {
    if (!this.isEnabled || typeof window === 'undefined') return;

    try {
      if (typeof performance !== 'undefined' && 'memory' in performance) {
        const memory = (performance as any).memory;
      }
    } catch (error) {
      // Silently fail if memory API is not available
    }
  }

  static logPageMetrics(slug: string, config: any): void {
    if (!this.isEnabled) return;

    const isServer = typeof window === 'undefined';
  }
}

// Helper function to determine the active navigation item
function getActiveNavItem(slug: string, configType: string): string | undefined {
  return PerformanceLogger.measure('getActiveNavItem', () => {
    // For genre pages, the slug should match the subnav genre items
    if (configType === 'genre') {
      // Map common genre slugs to subnav item IDs
      const genreMap: Record<string, string> = {
        house: 'house',
        disco: 'disco',
        jazz: 'jazz',
        ambient: 'ambient',
        brazil: 'brazil',
        africa: 'africa',
        asia: 'asia',
        latin: 'latin',
        world: 'world',
        reggae: 'reggae',
        electronic: 'electronic',
        techno: 'techno',
        edits: 'edits',
        gospel: 'gospel',
        experimental: 'experimental',
        rock: 'rock',
        library: 'library',
        downtempo: 'downtempo',
        'hip-hop': 'hip-hop',
        hip_hop: 'hip-hop', // Alternative mapping for underscore version
        rare: 'rare',
        'funk-soul': 'funk-soul',
        funk_soul: 'funk-soul' // Alternative mapping for underscore version
      };

      return genreMap[slug];
    }

    // For format pages (if config.type is 'format'), map format slugs
    if (configType === 'format') {
      const formatMap: Record<string, string> = {
        '12': '12',
        lp: 'lp',
        '7': '7',
        compilation: 'compilation',
        original: 'original',
        bundle: 'bundle',
        cassette: 'cassette',
        cd: 'cd',
        publication: 'publication',
        merchandise: 'merchandise'
      };

      return formatMap[slug];
    }

    // For special pages
    if (slug === 'new') {
      return 'new';
    }

    // For artist and label pages, or unmapped items, return undefined (no active item)
    return undefined;
  });
}

// Helper function to decode HTML entities
function decodeHtmlEntities(str: string): string {
  return PerformanceLogger.measure('decodeHtmlEntities', () => {
    return str
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'");
  });
}

// Featured Products Section Component - Simple full width black, 3 up
// Featured Products Section Component - Remove column padding for edge-to-edge display
const FeaturedProductsSection: React.FC<{
  products: any[];
  displayName: string;
  config: any;
}> = ({ products, displayName, config }) => {
  if (!products || products.length === 0) return null;

  // Remove LQIP data from featured products to prevent blur placeholders
  const productsWithoutLqip = products.map((product) => ({
    ...product,
    mainImage: product.mainImage
      ? {
          ...product.mainImage,
          asset: product.mainImage.asset
            ? {
                ...product.mainImage.asset,
                metadata: product.mainImage.asset.metadata
                  ? {
                      ...product.mainImage.asset.metadata,
                      lqip: undefined // Remove LQIP to prevent blur
                    }
                  : undefined
              }
            : undefined
        }
      : undefined,
    sanityContent: product.sanityContent
      ? {
          ...product.sanityContent,
          mainImage: product.sanityContent.mainImage
            ? {
                ...product.sanityContent.mainImage,
                asset: product.sanityContent.mainImage.asset
                  ? {
                      ...product.sanityContent.mainImage.asset,
                      metadata: product.sanityContent.mainImage.asset.metadata
                        ? {
                            ...product.sanityContent.mainImage.asset.metadata,
                            lqip: undefined // Remove LQIP to prevent blur
                          }
                        : undefined
                    }
                  : undefined
              }
            : undefined
        }
      : undefined
  }));

  return (
    <div className="w-100 pb-5">
      {' '}
      {/* Remove bg-black from outer container */}
      <div className="container-fluid p-0">
        {' '}
        {/* Remove container padding */}
        <div className="row g-0">
          {' '}
          {/* Remove gutter spacing */}
          {productsWithoutLqip.map((product, index) => (
            <div key={product.id} className="col-6 col-md-4 col-lg-4 p-0">
              {' '}
              {/* 2 cols at md breakpoint (768px), 3 cols at lg */}
              <Product
                product={product}
                variant="featured"
                priority={index < 3}
                index={index}
                isFeatured={true}
                context="archive"
                configType={config.type}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

interface ArchivePageProps {
  params: {
    slug: string;
  };
  searchParams: {
    page?: string;
    sort?: string;
  };
  // Configuration for different page types
  config: {
    type: 'artist' | 'label' | 'genre' | 'format' | 'tag' | 'week';
    getProductsFunction: (slug: string, page: number, sort: string) => Promise<any>;
    pluralName: string; // "Artists", "Labels", "Genres"
    singularName: string; // "Artist", "Label", "Genre"
    collectionTitle: string; // "Music Collection", "Record Label Collection", "Genre Collection"
    breadcrumbPath: string; // "/shop/artists", "/shop/labels", "/shop/genres"
    basePath: string; // "/shop/artist", "/shop/label", "/shop/genre"
    schemaType: '@type'; // "MusicGroup", "Organization", "ItemList"
    bgColor?: string; // Optional background color for debug section
  };
}

// Generate metadata function - FIXED to use actualName
export async function generateArchiveMetadata(
  params: { slug: string },
  config: ArchivePageProps['config']
): Promise<Metadata> {
  return PerformanceLogger.measureAsync(
    `generateMetadata-${config.type}-${params.slug}`,
    async () => {
      try {
        PerformanceLogger.logMemoryUsage('metadata-start');

        // Get the result to access actualName
        const result = await PerformanceLogger.measureAsync('metadata-getProducts', () =>
          config.getProductsFunction(params.slug, 1, 'menuOrder')
        );

        // Use actualName if available, otherwise fall back to slug-generated name
        const rawDisplayName = result.actualName || slugToDisplayName(params.slug);
        const displayName = decodeHtmlEntities(rawDisplayName);

        const metadata: Metadata = {
          title: `${displayName} - ${config.collectionTitle}`,
          description: `Discover music releases ${
            config.type === 'artist' ? 'by' : config.type === 'genre' ? 'in the' : 'from'
          } ${displayName}. Browse vinyl records, CDs, and digital releases.`,
          robots: {
            index: true,
            follow: true,
            googleBot: {
              index: true,
              follow: true
            }
          },
          openGraph: {
            title: `${displayName} - ${config.collectionTitle}`,
            description: `Discover music releases ${
              config.type === 'artist' ? 'by' : config.type === 'genre' ? 'in the' : 'from'
            } ${displayName}`,
            images: result.products?.[0]?.images?.[0]?.file?.url
              ? [
                  {
                    url: result.products[0].images[0].file.url,
                    width: result.products[0].images[0].file.width || 600,
                    height: result.products[0].images[0].file.height || 600,
                    alt: `${displayName} music`
                  }
                ]
              : []
          }
        };

        PerformanceLogger.logMemoryUsage('metadata-end');

        return metadata;
      } catch (error) {
        // Fallback metadata if product fetch fails
        const displayName = slugToDisplayName(params.slug);
        return {
          title: `${displayName} - ${config.collectionTitle}`,
          description: `Discover music releases ${
            config.type === 'artist' ? 'by' : config.type === 'genre' ? 'in the' : 'from'
          } ${displayName}`,
          robots: { index: true, follow: true }
        };
      }
    }
  );
}

export default async function ArchivePage({ params, searchParams, config }: ArchivePageProps) {
  // Safe timing that works in both server and client environments
  const pageStartTime =
    typeof performance !== 'undefined' && performance.now ? performance.now() : Date.now();
  PerformanceLogger.start('archive-page-total');
  PerformanceLogger.logPageMetrics(params.slug, config);
  PerformanceLogger.logMemoryUsage('page-start');

  const slug = params.slug;
  const currentPage = parseInt(searchParams.page || '1');
  const sortBy = searchParams.sort || 'menuOrder';

  // Calculate the active navigation item based on slug and config type
  const activeNavItem = getActiveNavItem(slug, config.type);

  // Only log in development
  if (process.env.NODE_ENV === 'development') {
  }

  try {
    PerformanceLogger.start('data-fetch');
    const result = await config.getProductsFunction(slug, currentPage, sortBy);
    PerformanceLogger.end('data-fetch');

    const {
      products,
      total,
      pages,
      actualName,
      featuredProducts = [],
      showFeatured = false
    } = result;

    // FIXED: Use actualName from database if available, decode HTML entities
    PerformanceLogger.start('name-processing');
    const rawDisplayName = actualName || slugToDisplayName(slug);
    const displayName = decodeHtmlEntities(rawDisplayName);
    PerformanceLogger.end('name-processing');

    // Don't 404 immediately, let debug info show what's happening
    const hasResults = products && products.length > 0;
    const shouldShow404 = !hasResults && currentPage === 1 && total === 0;

    // Only log in development
    if (process.env.NODE_ENV === 'development') {
    }

    // Filter out hidden products
    PerformanceLogger.start('product-filtering');
    const visibleProducts =
      products?.filter((product: any) => !product.tags?.includes(HIDDEN_PRODUCT_TAG)) || [];
    const visibleFeatured =
      featuredProducts?.filter((product: any) => !product.tags?.includes(HIDDEN_PRODUCT_TAG)) || [];
    PerformanceLogger.end('product-filtering');

    // Generate appropriate JSON-LD schema
    const generateJsonLd = () => {
      return PerformanceLogger.measure('generate-jsonld', () => {
        const baseSchema = {
          '@context': 'https://schema.org',
          name: displayName,
          url: `${process.env.NEXT_PUBLIC_SITE_URL}${config.basePath}/${slug}`
        };

        if (config.type === 'artist') {
          return {
            ...baseSchema,
            '@type': 'MusicGroup',
            album: visibleProducts.map((product: any) => ({
              '@type': 'MusicAlbum',
              name: product.name,
              image: product.images?.[0]?.file?.url,
              offers: {
                '@type': 'Offer',
                price: product.price,
                priceCurrency: product.currency,
                availability: product.stockPurchasable
                  ? 'https://schema.org/InStock'
                  : 'https://schema.org/OutOfStock'
              }
            }))
          };
        } else if (config.type === 'label') {
          return {
            ...baseSchema,
            '@type': 'Organization',
            '@id': `${process.env.NEXT_PUBLIC_SITE_URL}${config.basePath}/${slug}`,
            description: `Music releases from ${displayName}`,
            mainEntity: {
              '@type': 'ItemList',
              numberOfItems: visibleProducts.length,
              itemListElement: visibleProducts.map((product: any, index: number) => ({
                '@type': 'ListItem',
                position: index + 1,
                item: {
                  '@type': 'MusicAlbum',
                  name: product.name,
                  image: product.images?.[0]?.file?.url,
                  offers: {
                    '@type': 'Offer',
                    price: product.price,
                    priceCurrency: product.currency,
                    availability: product.stockPurchasable
                      ? 'https://schema.org/InStock'
                      : 'https://schema.org/OutOfStock'
                  }
                }
              }))
            }
          };
        } else {
          // genre
          return {
            ...baseSchema,
            '@type': 'ItemList',
            name: `${displayName} Music`,
            description: `Music releases in the ${displayName} genre`,
            numberOfItems: visibleProducts.length,
            itemListElement: visibleProducts.map((product: any, index: number) => ({
              '@type': 'ListItem',
              position: index + 1,
              item: {
                '@type': 'MusicAlbum',
                name: product.name,
                image: product.images?.[0]?.file?.url,
                genre: displayName,
                offers: {
                  '@type': 'Offer',
                  price: product.price,
                  priceCurrency: product.currency,
                  availability: product.stockPurchasable
                    ? 'https://schema.org/InStock'
                    : 'https://schema.org/OutOfStock'
                }
              }
            }))
          };
        }
      });
    };

    PerformanceLogger.start('schema-generation');
    const jsonLd = generateJsonLd();
    PerformanceLogger.end('schema-generation');

    PerformanceLogger.logMemoryUsage('before-render');

    const renderStartTime =
      typeof performance !== 'undefined' && performance.now ? performance.now() : Date.now();

    const jsx = (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd)
          }}
        />
        {/* UPDATED: Use SubmenuProvider with server-side data - no flickering */}
        <SubmenuProvider />

        {/* Featured Products Section - Only show on page 1 */}
        {showFeatured && visibleFeatured.length > 0 && (
          <FeaturedProductsSection
            products={visibleFeatured}
            displayName={displayName}
            config={config}
          />
        )}

        {/* Products Grid - FIXED with index props */}
        {visibleProducts.length > 0 ? (
          <>
            <GridContainer>
              {visibleProducts.map((product: any, index: number) =>
                config.type === 'genre' ? (
                  <GridItem
                    key={product.id}
                    type="product"
                    id={product.id}
                    inStock={product.stockPurchasable}
                    category={displayName}
                    featured={false}
                  >
                    <Product
                      product={product}
                      index={index}
                      priority={!showFeatured && index < 2}
                    />
                  </GridItem>
                ) : (
                  <div
                    key={product.id}
                    className={`col-6 col-sm-4 col-lg-3 product instock category-${config.type} m-0 p-0 pb-5`}
                    data-id={product.id}
                    data-type="product"
                  >
                    <Product
                      product={product}
                      index={index}
                      priority={!showFeatured && index < 2}
                    />
                  </div>
                )
              )}
            </GridContainer>

            {/* Pagination */}
            {(pages || 0) > 1 && (
              <div className="container-fluid mt-5">
                <ArchivePagination
                  currentPage={currentPage}
                  totalPages={pages || 0}
                  basePath={`${config.basePath}/${slug}`}
                />
              </div>
            )}
          </>
        ) : (
          // Only show no results if we don't have featured products either
          !showFeatured && (
            <div className="container-fluid">
              <div className="row py-5">
                <div className="col-12 text-center">
                  <h2 className="h3 fw-semibold mb-3">No releases found for {displayName}</h2>
                  <p className="text-muted mb-4">
                    We couldn't find any products for this {config.type}.
                    {total === 0 && <span> (Function returned 0 results)</span>}
                  </p>
                  <Link href="/shop" className="btn btn-primary">
                    Browse All Products
                  </Link>
                </div>
              </div>
            </div>
          )
        )}
      </>
    );

    const renderTime =
      (typeof performance !== 'undefined' && performance.now ? performance.now() : Date.now()) -
      renderStartTime;
    const totalTime =
      (typeof performance !== 'undefined' && performance.now ? performance.now() : Date.now()) -
      pageStartTime;

    PerformanceLogger.end('archive-page-total');
    PerformanceLogger.logMemoryUsage('page-end');

    return jsx;
  } catch (error) {
    PerformanceLogger.end('archive-page-total');
    const errorTime =
      (typeof performance !== 'undefined' && performance.now ? performance.now() : Date.now()) -
      pageStartTime;

    // Error fallback UI
    return (
      <div className="container-fluid">
        <div className="row bg-danger py-4 text-white">
          <div className="col-12">
            <h1>Error Loading {config.singularName} Page</h1>
            <p>
              {config.singularName}: {slugToDisplayName(slug)} ({slug})
            </p>
            <p>Error: {error instanceof Error ? error.message : 'Unknown error'}</p>
            <p>Stack: {error instanceof Error ? error.stack : 'No stack trace'}</p>
            <p>
              Time to error:{' '}
              {(
                (typeof performance !== 'undefined' && performance.now
                  ? performance.now()
                  : Date.now()) - pageStartTime
              ).toFixed(2)}
              ms
            </p>
          </div>
        </div>
        <div className="row py-5">
          <div className="col-12 text-center">
            <Link href="/shop" className="btn btn-primary">
              Back to Shop
            </Link>
          </div>
        </div>
      </div>
    );
  }
}
