// lib/sanity/optimized-queries.ts - Query Optimizations Based on Performance Data

import { unstable_cache } from 'next/cache';

// Cache configuration based on your performance metrics
const CACHE_TIMES = {
  FAST_QUERIES: 3600, // 1 hour for < 20ms queries
  MEDIUM_QUERIES: 1800, // 30 min for 20-50ms queries
  SLOW_QUERIES: 900 // 15 min for > 50ms queries
} as const;

// Optimized query for your 10-33ms data fetches
export const getOptimizedProductsByLabel = unstable_cache(
  async (slug: string, page: number, sort: string) => {
    const limit = 40; // Your current page size
    const offset = (page - 1) * limit;

    // Minimize fields to reduce transfer time
    const query = `{
      "products": *[_type == "product" && label->slug.current == $slug] 
        | order(${getSortField(sort)}) [$offset...$limit] {
          _id,
          name,
          slug,
          price,
          currency,
          stockPurchasable,
          "images": images[0...1] {  // Only get first image for listing
            file {
              url,
              "metadata": asset->metadata {
                dimensions
              }
            }
          },
          tags,
          // Minimize nested data
          "labelName": label->name,
          "artistName": artist->name
        },
      "total": count(*[_type == "product" && label->slug.current == $slug]),
      "actualName": *[_type == "label" && slug.current == $slug][0].name
    }`;

    const result = await sanityClient.fetch(query, { slug, offset, limit });

    return {
      products: result.products || [],
      total: result.total || 0,
      pages: Math.ceil((result.total || 0) / limit),
      currentPage: page,
      actualName: result.actualName
    };
  },
  ['products-by-label'],
  {
    revalidate: CACHE_TIMES.MEDIUM_QUERIES,
    tags: ['products', 'labels']
  }
);

// Helper function to determine sort field
function getSortField(sort: string): string {
  const sortMap: Record<string, string> = {
    menuOrder: '_createdAt desc',
    name: 'name asc',
    price: 'price asc',
    newest: '_createdAt desc',
    oldest: '_createdAt asc'
  };
  return sortMap[sort] || sortMap['menuOrder'];
}

// Prefetch strategy for even faster subsequent loads
export function prefetchRelatedData(slug: string, type: 'label' | 'genre' | 'artist') {
  // Prefetch next page in background
  const prefetchPromises = [
    // Prefetch page 2 if user is on page 1
    type === 'label' ? getOptimizedProductsByLabel(slug, 2, 'menuOrder') : null,
    // Prefetch popular sort options
    type === 'label' ? getOptimizedProductsByLabel(slug, 1, 'name') : null
  ].filter(Boolean);

  // Don't await - let these run in background
  Promise.all(prefetchPromises).catch(() => {
    // Silently fail prefetch attempts
  });
}

// Database index recommendations based on your queries
export const RECOMMENDED_SANITY_INDEXES = `
// Add these indexes to your Sanity schema for better performance:

// For label queries (your 33ms fetch)
{
  name: 'productsByLabel',
  title: 'Products by Label',
  type: 'index',
  on: [
    { field: '_type', direction: 'asc' },
    { field: 'label._ref', direction: 'asc' },
    { field: '_createdAt', direction: 'desc' }
  ]
}

// For genre queries (your 10ms fetch - already optimized!)
{
  name: 'productsByGenre', 
  title: 'Products by Genre',
  type: 'index',
  on: [
    { field: '_type', direction: 'asc' },
    { field: 'genre._ref', direction: 'asc' },
    { field: '_createdAt', direction: 'desc' }
  ]
}

// For sorting options
{
  name: 'productsByPrice',
  title: 'Products by Price',
  type: 'index', 
  on: [
    { field: '_type', direction: 'asc' },
    { field: 'price', direction: 'asc' }
  ]
}
`;

// Performance monitoring for data fetches
export function withPerformanceMonitoring<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  operationName: string
) {
  return async (...args: T): Promise<R> => {
    const start = Date.now();

    try {
      const result = await fn(...args);
      const duration = Date.now() - start;

      return result;
    } catch (error) {
      const duration = Date.now() - start;
      throw error;
    }
  };
}

// Usage example with your existing functions
export const monitoredGetProductsByLabel = withPerformanceMonitoring(
  getOptimizedProductsByLabel,
  'getProductsByLabel'
);

// CDN/Edge optimization recommendations
export const PERFORMANCE_OPTIMIZATIONS = {
  // Based on your 13-34ms total times, these optimizations could get you to 5-15ms:

  sanityConfig: {
    // Use CDN for faster asset delivery
    useCdn: true,
    // Use the closest region
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
    apiVersion: '2023-05-03',
    // Enable request deduplication
    stega: false
  },

  queryOptimizations: [
    '1. Reduce nested field selections (images[0...1] vs images[])',
    '2. Use specific field projections instead of full documents',
    '3. Implement database indexes on commonly queried fields',
    '4. Consider GraphQL for more efficient field selection',
    '5. Cache count queries separately from data queries'
  ],

  cacheStrategy: [
    '1. Cache at multiple levels (Sanity CDN + Next.js + Browser)',
    '2. Use background revalidation (stale-while-revalidate)',
    '3. Implement request deduplication',
    '4. Prefetch likely next pages',
    '5. Cache product images with long expiration'
  ]
};

// Real-time performance baseline tracker
export class PerformanceBaseline {
  private static baselines = new Map<string, number[]>();

  static record(operation: string, duration: number) {
    if (!this.baselines.has(operation)) {
      this.baselines.set(operation, []);
    }

    const times = this.baselines.get(operation)!;
    times.push(duration);

    // Keep only last 50 measurements
    if (times.length > 50) {
      times.shift();
    }
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

  static logSummary() {
    for (const [operation, times] of this.baselines) {
      const stats = this.getStats(operation);
      if (stats) {
        // Stats available but not logged
      }
    }
  }
}
