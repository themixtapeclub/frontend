// components/products/Products.tsx

import { GridContainer } from 'components/grid/Container';
import { GridItem } from 'components/grid/Item';
import ProductCard from 'components/products/ProductCard';
import { MergedProduct } from 'lib/data/products/index';
import { sanityClient } from 'lib/queries/sanity/core/client';

type ExtendedMergedProduct = MergedProduct & {
  _id?: string;
  stock?: number;
  genre?: string;
  sku?: string;
  title?: string;
  artist?: string;
  label?: string;
  format?: string;
  category?: string;
  country?: string;
  released?: string;
  catalog?: string;
  orderRank?: number;
  mainImage?: any;
};

const extractString = (field: any): string => {
  if (!field) return '';
  if (typeof field === 'string') return field;
  if (Array.isArray(field)) {
    return field
      .map((item) => {
        if (typeof item === 'string') return item;
        if (item && typeof item === 'object' && item.main) return item.main;
        if (item && typeof item === 'object' && item._type) return item.title || item.name || '';
        return String(item);
      })
      .filter(Boolean)
      .join(', ');
  }
  if (typeof field === 'object') {
    if (field.main) return field.main;
    if (field.title) return field.title;
    if (field.name) return field.name;
    return '';
  }
  return String(field);
};

const convertToMergedProduct = (product: any, featured: boolean): ExtendedMergedProduct => ({
  id: product._id,
  slug: product.swellSlug || product.sku || product._id,
  sku: product.sku || product._id,
  name: product.title || 'Untitled',
  price: product.price || 0,
  currency: 'USD',
  description: '',
  stock: product.stock || 0,
  stock_level: product.stock || 0,
  stock_tracking: false,
  stock_purchasable: true,
  sanityContent: product,
  title: product.title || 'Untitled',
  artist: extractString(product.artist),
  label: extractString(product.label),
  format: extractString(product.format),
  category: extractString(product.category),
  genre: extractString(product.genre),
  country: '',
  released: '',
  catalog: '',
  orderRank: product.orderRank,
  mainImage: product.mainImage,
  _id: product._id
});

export default async function Products() {
  const startTime = Date.now();

  try {
    console.log('🛍️ [PRODUCTS] Starting parallel fetch...');

    const [featuredProducts, newProducts] = await Promise.all([
      sanityClient.fetch(`
        *[_type == "product" && !(_id in path("drafts.**")) && featured == true && stock > 0 && defined(mainImage.asset->url)] 
        | order(coalesce(orderRank, 99999) asc, _createdAt desc) [0...10] {
          _id, 
          title, 
          swellSlug,
          sku, 
          artist, 
          label, 
          format,
          category, 
          genre,
          orderRank,
          price,
          stock,
          mainImage { 
            asset->{ url }, 
            alt 
          }
        }
      `),

      sanityClient.fetch(`
        *[_type == "product" && !(_id in path("drafts.**")) && featured != true && stock > 0 && defined(mainImage.asset->url)] 
        | order(coalesce(orderRank, 99999) asc, _createdAt desc) [0...12] {
          _id, 
          title, 
          swellSlug,
          sku, 
          artist, 
          label, 
          format,
          category, 
          genre,
          orderRank,
          price,
          stock,
          mainImage { 
            asset->{ url }, 
            alt 
          }
        }
      `)
    ]);

    console.log(
      `🛍️ [${Date.now() - startTime}ms] Parallel fetch complete - Featured: ${
        featuredProducts?.length || 0
      }, New: ${newProducts?.length || 0}`
    );

    const featuredMergedProducts = (featuredProducts || []).map((product: any) =>
      convertToMergedProduct(product, true)
    );

    const newMergedProducts = (newProducts || []).map((product: any) =>
      convertToMergedProduct(product, false)
    );

    console.log(`🛍️ [${Date.now() - startTime}ms] ✅ Products complete`);

    return (
      <>
        {featuredMergedProducts.length > 0 && (
          <section className="featured-products">
            <GridContainer>
              {featuredMergedProducts.map((product: ExtendedMergedProduct, index: number) => (
                <GridItem
                  key={`featured-${product.sku || product.id}-${index}`}
                  type="product"
                  id={product.id}
                  inStock={(product.stock || 0) > 0}
                  stock={product.stock || 0}
                  category={product.genre}
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
                  />
                </GridItem>
              ))}
            </GridContainer>
          </section>
        )}

        {newMergedProducts.length > 0 && (
          <section className="new-products">
            <GridContainer>
              {newMergedProducts.map((product: ExtendedMergedProduct, index: number) => (
                <GridItem
                  key={`new-${product.sku || product.id}-${index}`}
                  type="product"
                  id={product.id}
                  inStock={(product.stock || 0) > 0}
                  stock={product.stock || 0}
                  category={product.genre}
                  featured={false}
                >
                  <ProductCard
                    key={product.id || product._id}
                    product={product as any}
                    variant="regular"
                    index={index}
                  />
                </GridItem>
              ))}
            </GridContainer>
          </section>
        )}
      </>
    );
  } catch (error) {
    console.error(`❌ [${Date.now() - startTime}ms] Products error:`, error);
    return null;
  }
}
