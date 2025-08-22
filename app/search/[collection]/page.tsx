// app/search/[collection]/page.tsx

import { getCategory, getProductsByCategory } from 'lib/commerce/swell/client';
import { defaultSort, sorting } from 'lib/shared/constants/global';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { GridContainer } from 'components/grid/Container';
import { GridItem } from 'components/grid/Item';
import ProductCard from 'components/products/ProductCard';

export const runtime = 'edge';

export async function generateMetadata({
  params
}: {
  params: { collection: string };
}): Promise<Metadata> {
  const collection = await getCategory(params.collection);

  if (!collection) return notFound();

  return {
    title: collection.name,
    description:
      collection.metaDescription || collection.description || `${collection.name} products`,
    openGraph: {
      images: [
        {
          url: `/api/og?title=${encodeURIComponent(collection.name)}`,
          width: 1200,
          height: 630
        }
      ]
    }
  };
}

export default async function CategoryPage({
  params,
  searchParams
}: {
  params: { collection: string };
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const { sort, q: searchValue } = searchParams as { [key: string]: string };
  const { sortKey, reverse } = sorting.find((item) => item.slug === sort) || defaultSort;

  console.log('🔍 Category page search params:', {
    collection: params.collection,
    searchValue,
    sort: `${sortKey} ${reverse ? 'desc' : 'asc'}`
  });

  const products = await getProductsByCategory(params.collection, {
    query: searchValue,
    sort: `${sortKey} ${reverse ? 'desc' : 'asc'}`
  } as any);

  console.log(`📦 Found ${products.length} products for category: ${params.collection}`);

  return (
    <section>
      {products.length === 0 ? (
        <div className="py-8 text-center">
          <p className="text-lg text-gray-600">
            {searchValue
              ? `No products found matching "${searchValue}" in this collection`
              : `No products found in this collection`}
          </p>
          {searchValue && (
            <p className="mt-2 text-sm text-gray-500">
              Try adjusting your search terms or browse all products
            </p>
          )}
        </div>
      ) : (
        <>
          {searchValue && (
            <div className="mb-4 rounded-lg bg-blue-50 p-4">
              <p className="text-sm text-blue-700">
                Showing {products.length} result{products.length !== 1 ? 's' : ''} for "
                {searchValue}" in {params.collection}
              </p>
            </div>
          )}

          <GridContainer>
            {products.map((product: any, index: number) => (
              <GridItem
                key={`${product.sku || product._id}-${index}`}
                type="product"
                id={product._id}
                inStock={product.stock > 0 || product.inStock}
                stock={product.stock}
                featured={false}
              >
                <ProductCard key={product._id} product={product} variant="regular" index={index} />
              </GridItem>
            ))}
          </GridContainer>
        </>
      )}
    </section>
  );
}
