// components/grid/three-items.tsx

import { GridTileImage } from 'components/grid/tile';
import { PLACEHOLDER_IMAGE } from 'lib/shared/constants/global';
import { getProductsByCategory } from "lib/commerce/swell/client";
import Link from 'next/link';

interface Product {
  slug: string;
  name: string;
  price: number;
  images: Array<{
    file: {
      url: string;
    };
  }>;
}

function ThreeItemGridItem({
  item,
  size,
  priority
}: {
  item: Product;
  size: 'full' | 'half';
  priority?: boolean;
}) {
  return (
    <div
      className={size === 'full' ? 'md:col-span-4 md:row-span-2' : 'md:col-span-2 md:row-span-1'}
    >
      <Link className="relative block aspect-square h-full w-full" href={`/product/${item.slug}`}>
        <GridTileImage
          src={item.images.length === 0 ? PLACEHOLDER_IMAGE : item.images[0]?.file.url || ''}
          fill
          sizes={
            size === 'full' ? '(min-width: 768px) 66vw, 100vw' : '(min-width: 768px) 33vw, 100vw'
          }
          priority={priority}
          alt={item.name}
          label={{
            position: size === 'full' ? 'center' : 'bottom',
            title: item.name as string,
            amount: String(item.price),
            currencyCode: 'USD'
          }}
        />
      </Link>
    </div>
  );
}

export async function ThreeItemGrid() {
  const homepageItems = await getProductsByCategory('shirts');

  if (!homepageItems[0] || !homepageItems[1] || !homepageItems[2]) return null;

  const [firstProduct, secondProduct, thirdProduct] = homepageItems;

  return (
    <section className="mx-auto grid max-w-screen-2xl gap-4 px-4 pb-4 md:grid-cols-6 md:grid-rows-2">
      <ThreeItemGridItem size="full" item={firstProduct} priority={true} />
      <ThreeItemGridItem size="half" item={secondProduct} priority={true} />
      <ThreeItemGridItem size="half" item={thirdProduct} />
    </section>
  );
}
