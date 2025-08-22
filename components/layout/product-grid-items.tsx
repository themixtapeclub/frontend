// components/layout/product-grid-items.tsx

import Grid from 'components/grid';
import { GridTileImage } from 'components/grid/tile';
import Link from 'next/link';

export default function ProductGridItems({ products }: { products: any[] }) {
  return (
    <>
      {products.map((product: any) => (
        <Grid.Item key={product.slug} className="animate-fadeIn">
          <Link className="relative inline-block h-full w-full" href={`/product/${product.slug}`}>
            <GridTileImage
              alt={product.name}
              label={{
                title: product.name,
                amount: product.price,
                currencyCode: product.currency
              }}
              src={product.images[0]?.file.url || ''}
              fill
              sizes="(min-width: 768px) 33vw, (min-width: 640px) 50vw, 100vw"
            />
          </Link>
        </Grid.Item>
      ))}
    </>
  );
}
