// app/sitemap.ts
export const dynamic = 'force-dynamic';

import { getCategories, getProducts } from "lib/commerce/swell/client";
import { validateEnvironmentVariables } from 'lib/utils/core';
import { MetadataRoute } from 'next';

type Route = {
  url: string;
  lastModified: string;
};

const baseUrl = process.env.NEXT_PUBLIC_VERCEL_URL
  ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
  : 'http://localhost:3000';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  validateEnvironmentVariables();

  const routesMap = [''].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString()
  }));

  try {
    console.log('🗺️  Generating sitemap with dynamic content...');

    const collectionsPromise = getCategories()
      .then((categories) =>
        categories.map((category) => ({
          url: `${baseUrl}${category.slug}`,
          lastModified: new Date().toISOString()
        }))
      )
      .catch((error) => {
        console.warn('⚠️  Failed to fetch categories for sitemap:', error.message);
        return [];
      });

    const productsPromise = getProducts({
      limit: 2000,
      sort: 'featured desc,date_updated desc',
      where: {
        active: true
      }
    } as any)
      .then((products) =>
        products.map((product) => ({
          url: `${baseUrl}/product/${product.slug}`,
          lastModified: product.date_updated || new Date().toISOString(),
          priority: product.featured ? 0.9 : 0.7
        }))
      )
      .catch((error) => {
        console.warn('⚠️  Failed to fetch products for sitemap:', error.message);
        return [];
      });

    const fetchedRoutes = (await Promise.all([collectionsPromise, productsPromise])).flat();

    console.log(`✅ Sitemap generated with ${routesMap.length + fetchedRoutes.length} routes`);
    return [...routesMap, ...fetchedRoutes];
  } catch (error) {
    console.warn('⚠️  Sitemap generation fell back to basic routes only:', error.message);
    return routesMap;
  }
}
