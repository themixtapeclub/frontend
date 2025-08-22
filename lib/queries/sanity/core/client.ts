// lib/queries/sanity/core/client.ts

import { createClient } from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';
import { unstable_cache } from 'next/cache';

export class PerformanceBaseline {
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

const withRetryAndTimeout = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 2,
  timeoutMs: number = 3000
): Promise<T> => {
  let lastError: Error;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const result = await Promise.race([
        operation(),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Operation timeout')), timeoutMs)
        )
      ]);

      return result;
    } catch (error) {
      lastError = error as Error;

      if (attempt === maxRetries) {
        throw lastError;
      }

      const delay = Math.min(1000 * Math.pow(2, attempt), 5000) + Math.random() * 1000;
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
};

export function withPerformanceMonitoring<T extends any[], R>(
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
      throw error;
    }
  };
}

export const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  useCdn: process.env.NODE_ENV === 'production',
  token: process.env.NEXT_PUBLIC_SANITY_API_TOKEN,
  apiVersion: '2023-05-03',
  timeout: 30000,
  stega: false
});

const builder = imageUrlBuilder(sanityClient);

export function urlFor(source: any) {
  return builder.image(source);
}

export const sanityFetch = async <T>(
  query: string,
  params?: any,
  options?: {
    cacheTime?: number;
    timeout?: number;
    retries?: number;
    tags?: string[];
    debug?: string;
  }
): Promise<T> => {
  const { cacheTime = 3600, timeout = 3000, retries = 2, tags = ['sanity'], debug } = options || {};

  const start = Date.now();
  console.log(`🔍 [${debug || 'sanity'}] Starting fetch...`);

  const cacheKey = `sanity-${Buffer.from(query + JSON.stringify(params || {}))
    .toString('base64')
    .slice(0, 50)}`;

  try {
    const cachedFetch = unstable_cache(
      async () => {
        console.log(`📡 [${debug || 'sanity'}] Making API call...`);
        const apiStart = Date.now();

        const result = await withRetryAndTimeout(
          async () => {
            return await sanityClient.fetch<T>(query, params);
          },
          retries,
          timeout
        );

        console.log(`✅ [${debug || 'sanity'}] API call completed in ${Date.now() - apiStart}ms`);
        return result;
      },
      [cacheKey],
      {
        revalidate: cacheTime,
        tags: tags
      }
    );

    const result = await cachedFetch();
    console.log(`🎉 [${debug || 'sanity'}] Total fetch completed in ${Date.now() - start}ms`);

    if (Array.isArray(result)) {
      console.log(`📊 [${debug || 'sanity'}] Returned ${result.length} items`);
    } else if (result) {
      console.log(`📊 [${debug || 'sanity'}] Returned single item`);
    } else {
      console.log(`⚠️ [${debug || 'sanity'}] Returned null/undefined`);
    }

    return result;
  } catch (error) {
    console.error(`❌ [${debug || 'sanity'}] Failed after ${Date.now() - start}ms:`, error);
    throw error;
  }
};

export const sanityFetchPage = async <T>(slug: string, query: string): Promise<T | null> => {
  try {
    return await sanityFetch<T>(
      query,
      { slug },
      {
        cacheTime: 1800,
        timeout: 2000,
        retries: 1,
        tags: ['sanity', 'pages', `page-${slug}`],
        debug: `page-${slug}`
      }
    );
  } catch (error) {
    console.error(`❌ [page-${slug}] Failed to fetch page:`, error);
    return null;
  }
};

export const sanityFetchMetadata = async <T>(slug: string, query: string): Promise<T | null> => {
  try {
    return await sanityFetch<T>(
      query,
      { slug },
      {
        cacheTime: 7200,
        timeout: 1500,
        retries: 0,
        tags: ['sanity', 'metadata', `meta-${slug}`],
        debug: `meta-${slug}`
      }
    );
  } catch (error) {
    console.error(`❌ [meta-${slug}] Failed to fetch metadata:`, error);
    return null;
  }
};

export const CACHE_TIMES = {
  FAST_QUERIES: 3600,
  MEDIUM_QUERIES: 1800,
  SLOW_QUERIES: 900
} as const;
