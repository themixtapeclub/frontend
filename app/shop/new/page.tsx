// app/shop/new/page.tsx

import { GridContainer } from 'components/grid/Container';
import { GridItem } from 'components/grid/Item';
import SubmenuProvider from 'components/layout/header/submenuProvider';
import Product from 'components/products/ProductCard';
import { getNewProductsCached } from 'lib/data/products/index';
import { HIDDEN_PRODUCT_TAG } from 'lib/shared/constants/global';
import type { Metadata } from 'next';
import Link from 'next/link';

export async function generateStaticParams() {
  return [{}];
}

export const dynamic = 'force-static';
export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'New Arrivals',
  description:
    'Discover the latest music releases from recent weeks. New vinyl records, CDs, and digital releases.',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true
    }
  },
  openGraph: {
    title: 'New Releases - Music Store',
    description: 'Discover the latest music releases from recent weeks.',
    type: 'website'
  }
};

interface NewProductsPageProps {
  searchParams?: Promise<{
    page?: string;
    sort?: string;
  }>;
}

const PRODUCTS_PER_PAGE = 48;

export default async function NewProductsPage({ searchParams }: NewProductsPageProps) {
  // Handle optional searchParams for static generation
  const params = searchParams ? await searchParams : {};
  const { page, sort } = params;
  const currentPage = parseInt(page || '1');
  const sortBy = sort || 'newest';

  const products = await getNewProductsCached();

  const visibleProducts =
    products?.filter((product) => {
      // Check for hidden tags
      const isHidden =
        product.tags?.includes(HIDDEN_PRODUCT_TAG) ||
        ((product.sanityContent as any)?.tags || []).includes(HIDDEN_PRODUCT_TAG);

      if (isHidden) return false;

      // Check for image URLs - must have a truthy, non-empty string that's not a placeholder
      const imageUrl =
        product.imageUrl ||
        product.images?.[0]?.file?.url ||
        product.sanityContent?.mainImage?.asset?.url ||
        product.mainImage?.asset?.url;

      const hasValidImage =
        imageUrl &&
        typeof imageUrl === 'string' &&
        imageUrl.trim() !== '' &&
        !imageUrl.includes('/placeholder.jpg') &&
        !imageUrl.includes('placeholder.') &&
        !imageUrl.includes('no-image') &&
        !imageUrl.includes('default-image');

      return hasValidImage;
    }) || [];

  const totalProducts = visibleProducts.length;
  const totalPages = Math.max(1, Math.ceil(totalProducts / PRODUCTS_PER_PAGE));
  const isValidPage = currentPage <= totalPages;

  try {
    const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
    const endIndex = startIndex + PRODUCTS_PER_PAGE;
    const paginatedProducts = isValidPage ? visibleProducts.slice(startIndex, endIndex) : [];

    const generatePageUrl = (page: number) => {
      const params = new URLSearchParams();
      params.set('page', page.toString());
      if (sortBy !== 'newest') params.set('sort', sortBy);
      return `/shop/new?${params.toString()}`;
    };

    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: 'New Music Releases',
      description: 'Latest music releases from recent weeks',
      numberOfItems: totalProducts,
      itemListElement: paginatedProducts.map((product, index) => ({
        '@type': 'ListItem',
        position: startIndex + index + 1,
        item: {
          '@type': 'MusicAlbum',
          name: product.name,
          image: product.images?.[0]?.file?.url || product.mainImage?.asset?.url,
          artist: product.artist,
          genre: product.genre,
          offers: {
            '@type': 'Offer',
            price: product.price,
            priceCurrency: product.currency || 'USD',
            availability: product.stock_purchasable
              ? 'https://schema.org/InStock'
              : 'https://schema.org/OutOfStock'
          }
        }
      }))
    };

    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd)
          }}
        />

        <SubmenuProvider />
        {paginatedProducts.length > 0 && isValidPage ? (
          <>
            <GridContainer>
              {paginatedProducts.map((product, index) => (
                <GridItem
                  key={`new-${product.id}-${startIndex + index}`}
                  type="product"
                  id={product.id}
                  inStock={product.stock_purchasable}
                  stock={product.stock_level}
                  category="new"
                  featured={false}
                >
                  <Product product={product as any} index={startIndex + index} />
                </GridItem>
              ))}
            </GridContainer>

            {totalPages > 1 && (
              <div className="container-fluid">
                <div className="row py-4">
                  <div className="col-12">
                    <nav aria-label="New arrivals pagination">
                      <ul className="pagination justify-content-center">
                        {currentPage > 1 && (
                          <li className="page-item">
                            <Link
                              href={generatePageUrl(currentPage - 1)}
                              className="page-link"
                              aria-label="Previous page"
                            >
                              ‹ Previous
                            </Link>
                          </li>
                        )}

                        {(() => {
                          const pages = [];
                          const showPages = 5;
                          let startPage = Math.max(1, currentPage - Math.floor(showPages / 2));
                          let endPage = Math.min(totalPages, startPage + showPages - 1);

                          if (endPage - startPage < showPages - 1) {
                            startPage = Math.max(1, endPage - showPages + 1);
                          }

                          if (startPage > 1) {
                            pages.push(
                              <li key="1" className="page-item">
                                <Link href={generatePageUrl(1)} className="page-link">
                                  1
                                </Link>
                              </li>
                            );
                            if (startPage > 2) {
                              pages.push(
                                <li key="ellipsis1" className="page-item disabled">
                                  <span className="page-link">…</span>
                                </li>
                              );
                            }
                          }

                          for (let i = startPage; i <= endPage; i++) {
                            pages.push(
                              <li
                                key={i}
                                className={`page-item ${i === currentPage ? 'active' : ''}`}
                              >
                                {i === currentPage ? (
                                  <span className="page-link" aria-current="page">
                                    {i}
                                  </span>
                                ) : (
                                  <Link href={generatePageUrl(i)} className="page-link">
                                    {i}
                                  </Link>
                                )}
                              </li>
                            );
                          }

                          if (endPage < totalPages) {
                            if (endPage < totalPages - 1) {
                              pages.push(
                                <li key="ellipsis2" className="page-item disabled">
                                  <span className="page-link">…</span>
                                </li>
                              );
                            }
                            pages.push(
                              <li key={totalPages} className="page-item">
                                <Link href={generatePageUrl(totalPages)} className="page-link">
                                  {totalPages}
                                </Link>
                              </li>
                            );
                          }

                          return pages;
                        })()}

                        {currentPage < totalPages && (
                          <li className="page-item">
                            <Link
                              href={generatePageUrl(currentPage + 1)}
                              className="page-link"
                              aria-label="Next page"
                            >
                              Next ›
                            </Link>
                          </li>
                        )}
                      </ul>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="container-fluid">
            <div className="row py-5">
              <div className="col-12 text-center">
                {!isValidPage ? (
                  <>
                    <h2 className="h3 fw-semibold mb-3">Page Not Found</h2>
                    <p className="text-muted mb-4">
                      Page {currentPage} doesn't exist. There are only {totalPages} page
                      {totalPages !== 1 ? 's' : ''} available.
                    </p>
                    <Link href={`/shop/new?page=${totalPages}`} className="btn btn-primary">
                      Go to Last Page
                    </Link>
                  </>
                ) : (
                  <>
                    <h2 className="h3 fw-semibold mb-3">No New Releases Found</h2>
                    <p className="text-muted mb-4">
                      We couldn't find any new products from the recent weeks. Check back soon for
                      updates!
                    </p>
                    <Link href="/shop" className="btn btn-primary">
                      Browse All Products
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </>
    );
  } catch (error) {
    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebPage',
              name: 'Error - New Arrivals'
            })
          }}
        />

        <main className="main-content">
          <SubmenuProvider />
          <div className="container-fluid">
            <div className="row bg-danger py-4 text-white">
              <div className="col-12">
                <h1>Error Loading New Releases</h1>
                <p>Error: {error instanceof Error ? error.message : 'Unknown error'}</p>
              </div>
            </div>
            <div className="row py-5">
              <div className="col-12 text-center">
                <h2 className="h3 fw-semibold mb-3">Something went wrong</h2>
                <p className="text-muted mb-4">
                  We encountered an error while loading the new releases.
                </p>
                <Link href="/shop" className="btn btn-primary">
                  Back to Shop
                </Link>
              </div>
            </div>
          </div>
        </main>
      </>
    );
  }
}
