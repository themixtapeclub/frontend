// lib/data/products/index.ts
export type {
  ArchiveType,
  CacheEntry,
  MergedProduct,
  ProductQueryOptions,
  ProductSearchResult,
  ProductsWithBreakdown,
  SanityContent,
  SwellProduct
} from './types';

export { extractString, extractWeek, slugToLabelName } from './utils/extractors';
export { convertSanityProductOnly, isProductInStock } from './utils/transformers';
export { getCurrentWeekWWYY, getTargetWeeks } from './utils/week-helpers';

export {
  clearAllProductsCache,
  clearNewProductsCache,
  getBatchProductsCache,
  getNewProductsCache,
  setBatchProductsCache,
  setNewProductsCache
} from './services/cache';

import {
  getFeaturedProducts as getFeaturedProductsBase,
  getNewProductsWithBreakdownData,
  getProduct as getProductBase,
  getProductsByArchive as getProductsByArchiveBase,
  searchProducts as searchProductsBase
} from './services/sanity-service';

import type { MergedProduct } from './types';

const isDev = process.env.NODE_ENV === 'development';
const CONTENT_CACHE_TTL = isDev ? 30 * 1000 : 5 * 60 * 1000;
const STATIC_CACHE_TTL = isDev ? 60 * 1000 : 15 * 60 * 1000;

interface CachedResult<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

const memoryCache = new Map<string, CachedResult<any>>();

function getCached<T>(key: string): T | null {
  const cached = memoryCache.get(key);
  if (!cached) return null;

  if (Date.now() - cached.timestamp > cached.ttl) {
    memoryCache.delete(key);
    return null;
  }

  return cached.data;
}

function setCached<T>(key: string, data: T, ttl: number): void {
  memoryCache.set(key, {
    data,
    timestamp: Date.now(),
    ttl
  });
}

export async function getFeaturedProducts(limit: number = 10): Promise<MergedProduct[]> {
  const cacheKey = `featured-${limit}`;
  const cached = getCached<MergedProduct[]>(cacheKey);

  if (cached) return cached;

  const products = await getFeaturedProductsBase(limit);
  setCached(cacheKey, products, CONTENT_CACHE_TTL);
  return products;
}

export async function getNewProducts(
  limit: number = 12,
  excludedIds: string[] = []
): Promise<MergedProduct[]> {
  const cacheKey = `new-${limit}-${excludedIds.length}`;
  const cached = getCached<MergedProduct[]>(cacheKey);

  if (cached) return cached;

  const result = await getNewProductsWithBreakdownData(limit, excludedIds);
  setCached(cacheKey, result.products, CONTENT_CACHE_TTL);
  return result.products;
}

export async function getNewProductsWithBreakdown(
  limit: number = 12,
  excludedIds: string[] = [],
  maxWeeks: number = 8
): Promise<import('./types').ProductsWithBreakdown> {
  const cacheKey = `breakdown-${limit}-${excludedIds.length}-${maxWeeks}`;
  const cached = getCached<import('./types').ProductsWithBreakdown>(cacheKey);

  if (cached) return cached;

  const result = await getNewProductsWithBreakdownData(limit, excludedIds, maxWeeks);
  setCached(cacheKey, result, CONTENT_CACHE_TTL);
  return result;
}

export async function getProductsByArchive(
  archiveType: import('./types').ArchiveType,
  slug: string,
  page: number = 1,
  limit: number = 20,
  includeOutOfStock: boolean = false
): Promise<import('./types').ProductSearchResult> {
  const cacheKey = `archive-${archiveType}-${slug}-${page}-${limit}-${includeOutOfStock}`;
  const cached = getCached<import('./types').ProductSearchResult>(cacheKey);

  if (cached) return cached;

  const result = await getProductsByArchiveBase(archiveType, slug, page, limit, includeOutOfStock);
  setCached(cacheKey, result, CONTENT_CACHE_TTL);
  return result;
}

export async function searchProducts(
  searchTerm: string,
  page: number = 1,
  limit: number = 20
): Promise<import('./types').ProductSearchResult> {
  const cacheKey = `search-${searchTerm}-${page}-${limit}`;
  const cached = getCached<import('./types').ProductSearchResult>(cacheKey);

  if (cached) return cached;

  const result = await searchProductsBase(searchTerm, page, limit);
  setCached(cacheKey, result, CONTENT_CACHE_TTL);
  return result;
}

export async function getProduct(handle: string): Promise<MergedProduct | null> {
  const cacheKey = `product-${handle}`;
  const cached = getCached<MergedProduct | null>(cacheKey);

  if (cached) return cached;

  const product = await getProductBase(handle);
  setCached(cacheKey, product, CONTENT_CACHE_TTL);
  return product;
}

export async function getBatchProducts(): Promise<{
  featured: MergedProduct[];
  new: MergedProduct[];
}> {
  const cacheKey = 'batch-products';
  const cached = getCached<{ featured: MergedProduct[]; new: MergedProduct[] }>(cacheKey);

  if (cached) return cached;

  try {
    const timeout = isDev ? 3000 : 8000;

    const [featuredResult, newResult] = await Promise.all([
      Promise.race([
        getFeaturedProducts(10),
        new Promise<MergedProduct[]>((_, reject) =>
          setTimeout(() => reject(new Error('Featured timeout')), timeout)
        )
      ]).catch(() => [] as MergedProduct[]),

      Promise.race([
        getNewProducts(24, []),
        new Promise<MergedProduct[]>((_, reject) =>
          setTimeout(() => reject(new Error('New timeout')), timeout)
        )
      ]).catch(() => [] as MergedProduct[])
    ]);

    const featured = featuredResult || [];
    const newProducts = newResult || [];
    const featuredIds = new Set(featured.map((p) => p.id));
    const filteredNew = newProducts.filter((p) => !featuredIds.has(p.id)).slice(0, 18);

    const result = { featured, new: filteredNew };
    setCached(cacheKey, result, STATIC_CACHE_TTL);
    return result;
  } catch (error) {
    return { featured: [], new: [] };
  }
}

export async function getBatchProductsCached(): Promise<{
  featured: MergedProduct[];
  new: MergedProduct[];
}> {
  return getBatchProducts();
}

export async function getNewProductsOptimized(limit: number = 144): Promise<MergedProduct[]> {
  const cacheKey = `optimized-new-${limit}`;
  const cached = getCached<MergedProduct[]>(cacheKey);

  if (cached) return cached;

  try {
    const { sanityClient } = await import('../../cms');
    const { BASE_PRODUCT_FILTER, BASE_PRODUCT_FILTER_WITH_IMAGE, FAST_QUERY_FIELDS } = await import(
      './constants'
    );
    const { convertSanityProductOnly } = await import('./utils/transformers');
    const { getTargetWeeks } = await import('./utils/week-helpers');

    const allWeeksQuery = `*[${BASE_PRODUCT_FILTER} && defined(week) && count(week) > 0] { week }`;
    const allWeeksResult = await sanityClient.fetch(allWeeksQuery);

    const uniqueWeeks = [...new Set(allWeeksResult.flatMap((p: any) => p.week || []))].filter(
      (week): week is string => typeof week === 'string' && /^\d{4}$/.test(week)
    );

    const targetWeeks = getTargetWeeks(4, uniqueWeeks);

    if (targetWeeks.length === 0) {
      return [];
    }

    const weekFilter = targetWeeks.map((week) => `"${week}" in week[]`).join(' || ');

    const query = `*[${BASE_PRODUCT_FILTER_WITH_IMAGE}
      && (${weekFilter})
      && stock > 0 
&& (inStock == true || inStock == null)] | order(coalesce(orderRank, "zzz") asc) [0...${limit}] {
      ${FAST_QUERY_FIELDS}
    }`;

    const products = await sanityClient.fetch(query);

    if (!products || !Array.isArray(products)) {
      return [];
    }

    const result = products.map((product: any) => convertSanityProductOnly(product, false));
    setCached(cacheKey, result, CONTENT_CACHE_TTL);
    return result;
  } catch (error) {
    const result = await getNewProductsWithBreakdown(144, [], 4);
    return result.products;
  }
}

export async function getNewProductsCached(): Promise<MergedProduct[]> {
  return getNewProductsOptimized(144);
}

export function getCacheStats(): {
  size: number;
  keys: string[];
  totalAge: number;
} {
  const now = Date.now();
  const keys = Array.from(memoryCache.keys());
  const totalAge = Array.from(memoryCache.values()).reduce(
    (sum, entry) => sum + (now - entry.timestamp),
    0
  );

  return {
    size: memoryCache.size,
    keys,
    totalAge: totalAge / 1000
  };
}

export function clearCache(): void {
  memoryCache.clear();
}

export function invalidateProductCache(productId?: string): void {
  if (productId) {
    for (const key of memoryCache.keys()) {
      if (key.includes(productId) || key.startsWith('batch-') || key.startsWith('new-')) {
        memoryCache.delete(key);
      }
    }
  } else {
    clearCache();
  }
}

export const getProductsByArtist = (slug: string, page: number = 1, limit: number = 20) =>
  getProductsByArchive('artist', slug, page, limit, true);
export const getProductsByLabel = (slug: string, page: number = 1, limit: number = 20) =>
  getProductsByArchive('label', slug, page, limit, true);
export const getProductsByGenre = (slug: string, page: number = 1, limit: number = 20) =>
  getProductsByArchive('genre', slug, page, limit, false);
export const getProductsByFormat = (slug: string, page: number = 1, limit: number = 20) =>
  getProductsByArchive('format', slug, page, limit, false);
export const getProductsByWeek = (week: string, page: number = 1, limit: number = 20) =>
  getProductsByArchive('week', week, page, limit, false);
export const getProductsByTag = (slug: string, page: number = 1, limit: number = 20) =>
  getProductsByArchive('tag', slug, page, limit, false);

export const getNewProductsFromSanity = (limit: number = 20) => getNewProducts(limit);
export const getCachedNewProductsFromSanity = (limit: number = 24) => getNewProducts(limit);
