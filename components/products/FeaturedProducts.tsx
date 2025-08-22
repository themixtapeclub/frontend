// components/products/FeaturedProducts.tsx
'use client';

import { GridContainer } from 'components/grid/Container';
import { GridItem } from 'components/grid/Item';
import ProductCard from 'components/products/ProductCard';
import { MergedProduct } from 'lib/data/products/index';

type ExtendedMergedProduct = any;

interface FeaturedProductsProps {
  preloadedData?: ExtendedMergedProduct[];
}

declare global {
  var featuredProductIds: string[] | undefined;
  var featuredProductsComplete: boolean | undefined;
}

function ProductCardSkeleton({ variant }: { variant?: 'featured' | 'regular' }) {
  const cardClasses = variant === 'featured' ? 'item-wrapper h-100 bg-black' : 'item-wrapper h-100';

  return (
    <div className={cardClasses}>
      <div
        className="position-relative animate-pulse overflow-hidden"
        style={{ aspectRatio: '1/1' }}
      >
        <div className="w-100 h-100 bg-gray-200" />
      </div>
      <div className="p-2">
        <div className="animate-pulse">
          <div className="mb-2 h-4 w-3/4 rounded bg-gray-200"></div>
          <div className="mb-2 h-3 w-1/2 rounded bg-gray-200"></div>
          <div className="h-4 w-1/4 rounded bg-gray-200"></div>
        </div>
      </div>
    </div>
  );
}

export default function FeaturedProducts({ preloadedData = [] }: FeaturedProductsProps) {
  try {
    global.featuredProductsComplete = false;

    const products = preloadedData || [];

    if (!products?.length) {
      global.featuredProductsComplete = true;
      return null;
    }

    global.featuredProductIds = products
      .map((p: MergedProduct) => p.id)
      .filter((id: string) => !id.startsWith('drafts.'));

    global.featuredProductsComplete = true;

    return (
      <GridContainer>
        {products.map((product: MergedProduct, index: number) => {
          return (
            <GridItem
              key={`featured-${product.sku || product.id}-${index}`}
              type="product"
              id={product.id}
              inStock={product.stock_purchasable}
              stock={product.stock_level}
              category={Array.isArray(product.genre) ? product.genre[0] : product.genre}
              featured={true}
              baseClassName={index < 6 ? 'col-4 m-0 p-0' : undefined}
              className={index < 6 ? '' : ''}
            >
              <ProductCard
                key={product.id || product._id}
                product={product as any}
                variant={index < 6 ? 'featured' : 'regular'}
                priority={index < 3}
                index={index}
                context="default" // Homepage context - should have black background
              />
            </GridItem>
          );
        })}
      </GridContainer>
    );
  } catch (error) {
    global.featuredProductsComplete = true;
    return (
      <div className="d-flex align-items-center justify-content-center min-h-[400px]">
        <div className="text-muted">Unable to load featured products</div>
      </div>
    );
  }
}
