// _archive/lib/sanity/client.ts
// Unified client combining your optimizations with timeout/retry fixes

import { createClient } from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';
import { unstable_cache } from 'next/cache';

// Performance monitoring from your optimized-queries.ts
class PerformanceBaseline {
  private static baselines = new Map<string, number[]>();

  static record(operation: string, duration: number) {
    if (!this.baselines.has(operation)) {
      this.baselines.set(operation, []);
    }
    const times = this.baselines.get(operation)!;
    times.push(duration);
    if (times.length > 50) times.shift();
  }

  static getStats(operation: string) {
    const times = this.baselines.get(operation) || [];
    if (times.length === 0) return null;
    const sorted = [...times].sort((a, b) => a - b);
    return {
      count: times.length,
      min: sorted[0],
      max: sorted[sorted.length - 1],
      median: sorted[Math.floor(sorted.length / 2)],
      p95: sorted[Math.floor(sorted.length * 0.95)],
      average: times.reduce((a, b) => a + b, 0) / times.length
    };
  }
}

// FIXED: Create fetch with timeout (shorter than your current 5min)
const createFetchWithTimeout = (timeoutMs: number = 30000) => {
  return async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(input, {
        ...init,
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  };
};

// FIXED: Retry wrapper with exponential backoff
const withRetry = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: Error;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;

      if (attempt === maxRetries) break;

      const waitTime = delay * Math.pow(2, attempt);
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }
  }

  throw lastError!;
};

// Performance monitoring wrapper from your code
function withPerformanceMonitoring<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  operationName: string
) {
  return async (...args: T): Promise<R> => {
    const start = Date.now();

    try {
      const result = await fn(...args);
      const duration = Date.now() - start;

      PerformanceBaseline.record(operationName, duration);

      return result;
    } catch (error) {
      const duration = Date.now() - start;
      throw error;
    }
  };
}

// FIXED: Create client with your optimizations + timeout fixes
export const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  useCdn: process.env.NODE_ENV === 'production', // Your optimization
  token: process.env.NEXT_PUBLIC_SANITY_API_TOKEN,
  apiVersion: '2023-05-03',
  // FIXED: Add timeout and custom fetch
  timeout: 30000, // 30 seconds instead of 5 minutes
  fetch: createFetchWithTimeout(30000),
  stega: false // Your optimization for performance
});

const builder = imageUrlBuilder(sanityClient);

export function urlFor(source: any) {
  return builder.image(source);
}

// Cache configuration from your optimized-queries.ts
const CACHE_TIMES = {
  FAST_QUERIES: 3600, // 1 hour for < 20ms queries
  MEDIUM_QUERIES: 1800, // 30 min for 20-50ms queries
  SLOW_QUERIES: 900 // 15 min for > 50ms queries
} as const;

// FIXED: Enhanced fetch wrapper combining your optimizations with retry logic
export const sanityFetch = async <T>(
  query: string,
  params?: any,
  cacheTime?: number
): Promise<T> => {
  return withRetry(async () => {
    return await sanityClient.fetch<T>(query, params);
  });
};

// Your BASE_PRODUCT_FILTER - keeping this excellent optimization
const BASE_PRODUCT_FILTER = `_type == "product" && 
  !(_id in path("drafts.**")) &&
  defined(swellProductId) && 
  defined(mainImage.asset->url)`;

// FIXED: Enhanced getProductsByLabel with your optimizations + error handling
export const getProductsByLabel = withPerformanceMonitoring(
  unstable_cache(
    async (label: string, page: number = 1, sort: string = 'menuOrder') => {
      const limit = 40;
      const offset = (page - 1) * limit;

      // Helper function from your code
      const getSortField = (sort: string): string => {
        const sortMap: Record<string, string> = {
          menuOrder: '_createdAt desc',
          name: 'name asc',
          price: 'price asc',
          newest: '_createdAt desc',
          oldest: '_createdAt asc'
        };
        return sortMap[sort] || sortMap['menuOrder'];
      };

      // Your optimized query with minimal fields for performance
      const query = `{
        "products": *[${BASE_PRODUCT_FILTER} && 
          defined(label) &&
          (
            "${label}" in label[] ||
            "${label.toLowerCase()}" in label[] ||
            "${label.replace(/\s+/g, '-').toLowerCase()}" in label[]
          )
        ] | order(${getSortField(sort)}) [${offset}...${offset + limit}] {
          _id,
          _createdAt,
          title,
          artist,
          label,
          genre,
          format,
          tags,
          price,
          swellProductId,
          swellSlug,
          slug,
          description,
          shortDescription,
          inStock,
          swellCurrency,
          menuOrder,
          orderRank,
          "imageUrl": mainImage.asset->url + "?w=800&h=800&fit=fill&auto=format",
          "mainImage": {
            "asset": {
              "url": mainImage.asset->url,
              "metadata": mainImage.asset->metadata
            }
          },
          "hasImage": defined(mainImage.asset->url)
        },
        "total": count(*[${BASE_PRODUCT_FILTER} && 
          defined(label) &&
          (
            "${label}" in label[] ||
            "${label.toLowerCase()}" in label[] ||
            "${label.replace(/\s+/g, '-').toLowerCase()}" in label[]
          )
        ])
      }`;

      try {
        const result = await sanityFetch<any>(query);
        return {
          products: result.products || [],
          total: result.total || 0,
          pages: Math.ceil((result.total || 0) / limit),
          currentPage: page
        };
      } catch (error) {
        // FIXED: Return empty result instead of throwing
        return { products: [], total: 0, pages: 0, currentPage: page };
      }
    },
    ['products-by-label'],
    {
      revalidate: CACHE_TIMES.MEDIUM_QUERIES,
      tags: ['products', 'labels']
    }
  ),
  'getProductsByLabel'
);

// FIXED: Enhanced getProductsByGenre with your hyphenated genre fixes + error handling
export const getProductsByGenre = withPerformanceMonitoring(
  unstable_cache(
    async (genre: string, page: number = 1, sort: string = 'menuOrder') => {
      const limit = 40;
      const offset = (page - 1) * limit;

      // Your excellent genre variation logic
      const displayName = genre
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      const simpleName = genre.replace(/-/g, ' ');
      const hyphenatedDisplayName = displayName.replace(/ /g, '-');
      const titleCaseHyphenated = genre
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join('-');

      const getSortField = (sort: string): string => {
        const sortMap: Record<string, string> = {
          menuOrder: '_createdAt desc',
          name: 'name asc',
          price: 'price asc',
          newest: '_createdAt desc',
          oldest: '_createdAt asc'
        };
        return sortMap[sort] || sortMap['menuOrder'];
      };

      const query = `{
        "products": *[${BASE_PRODUCT_FILTER} &&
          defined(genre) &&
          (
            "${displayName}" in genre[].main ||
            "${simpleName}" in genre[].main ||
            "${hyphenatedDisplayName}" in genre[].main ||
            "${titleCaseHyphenated}" in genre[].main ||
            "${genre}" in genre[].main ||
            "${displayName}" in genre[] ||
            "${simpleName}" in genre[] ||
            "${hyphenatedDisplayName}" in genre[] ||
            "${titleCaseHyphenated}" in genre[] ||
            "${genre}" in genre[]
          )
        ] | order(${getSortField(sort)}) [${offset}...${offset + limit}] {
          _id,
          _createdAt,
          title,
          artist,
          label,
          genre,
          format,
          tags,
          price,
          swellProductId,
          swellSlug,
          slug,
          description,
          shortDescription,
          inStock,
          swellCurrency,
          menuOrder,
          orderRank,
          "imageUrl": mainImage.asset->url + "?w=800&h=800&fit=fill&auto=format",
          "mainImage": {
            "asset": {
              "url": mainImage.asset->url,
              "metadata": mainImage.asset->metadata
            }
          },
          "hasImage": defined(mainImage.asset->url)
        },
        "total": count(*[${BASE_PRODUCT_FILTER} &&
          defined(genre) &&
          (
            "${displayName}" in genre[].main ||
            "${simpleName}" in genre[].main ||
            "${hyphenatedDisplayName}" in genre[].main ||
            "${titleCaseHyphenated}" in genre[].main ||
            "${genre}" in genre[].main ||
            "${displayName}" in genre[] ||
            "${simpleName}" in genre[] ||
            "${hyphenatedDisplayName}" in genre[] ||
            "${titleCaseHyphenated}" in genre[] ||
            "${genre}" in genre[]
          )
        ])
      }`;

      try {
        const result = await sanityFetch<any>(query);
        return {
          products: result.products || [],
          total: result.total || 0,
          pages: Math.ceil((result.total || 0) / limit),
          currentPage: page
        };
      } catch (error) {
        // FIXED: Return empty result instead of throwing
        return { products: [], total: 0, pages: 0, currentPage: page };
      }
    },
    ['products-by-genre'],
    {
      revalidate: CACHE_TIMES.FAST_QUERIES, // Your genres are fast (10ms)
      tags: ['products', 'genres']
    }
  ),
  'getProductsByGenre'
);

// Prefetch strategy from your optimized-queries.ts
export function prefetchRelatedData(slug: string, type: 'label' | 'genre' | 'artist') {
  const prefetchPromises = [
    type === 'label' ? getProductsByLabel(slug, 2, 'menuOrder') : null,
    type === 'label' ? getProductsByLabel(slug, 1, 'name') : null,
    type === 'genre' ? getProductsByGenre(slug, 2, 'menuOrder') : null,
    type === 'genre' ? getProductsByGenre(slug, 1, 'name') : null
  ].filter(Boolean);

  // Don't await - let these run in background
  Promise.all(prefetchPromises).catch(() => {
    // Silently fail prefetch attempts
  });
}

// Export performance monitoring for debugging
export { PerformanceBaseline };

// Your excellent BASE_PRODUCT_FILTER for other files to use
export { BASE_PRODUCT_FILTER };
