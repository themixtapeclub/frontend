type ExtendedMergedProduct = any; // components/products/NewProducts.tsx
import { GridContainer } from 'components/grid/Container';
import { GridItem } from 'components/grid/Item';
import ProductCard from 'components/products/ProductCard';
import { MergedProduct, getNewProducts } from 'lib/data/products/index';

interface NewProductsProps {
  preloadedData?: ExtendedMergedProduct[];
  excludedIds?: string[];
}

export default async function NewProducts({ preloadedData, excludedIds = [] }: NewProductsProps) {
  try {
    let products: MergedProduct[] = [];

    if (preloadedData && preloadedData.length > 0) {
      // FIXED: Don't filter again - backend already excluded featured products
      products = preloadedData;
    } else {
      // Fallback: fetch new products directly (only used if preloaded data fails)
      products = (await getNewProducts(24, excludedIds)) as MergedProduct[];
    }

    if (!products?.length) {
      return <div className="py-8 text-center text-gray-500">No new products available</div>;
    }

    return (
      <section className="new-products">
        <h2 className="mb-6 text-2xl font-bold">New Products</h2>
        <GridContainer>
          {products.map((product: MergedProduct, index: number) => (
            <GridItem
              key={`new-${product.sku || product.id}-${index}`}
              type="product"
              id={product.id}
              inStock={product.stock_purchasable}
              stock={product.stock_level}
              category={Array.isArray(product.genre) ? product.genre[0] : product.genre}
              featured={false}
            >
              <ProductCard key={product.id || product._id} product={product as any} index={index} />
            </GridItem>
          ))}
        </GridContainer>
      </section>
    );
  } catch (error) {
    return <div className="py-8 text-center text-red-500">Error loading new products</div>;
  }
}
