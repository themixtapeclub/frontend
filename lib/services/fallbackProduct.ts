// lib/services/fallbackProduct.ts - ULTRA RELIABLE FALLBACK

import { getProduct } from 'lib/data/products/index';
import { cache } from 'react';

// Simple cache without external dependencies
const simpleCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 300000; // 5 minutes

// Minimal performance logging
function logPerf(label: string, startTime?: number): number {
  if (process.env.NODE_ENV !== 'development') return Date.now();

  if (startTime) {
    const duration = Date.now() - startTime;
    console.log(`[${duration < 200 ? '✅' : '⚠️'}] ${label}: ${duration}ms`);
  }
  return Date.now();
}

// ULTRA SIMPLE: Just get Swell product data (no Sanity complications)
export const getProductDataSimple = cache(async (handle: string) => {
  const cacheKey = `simple-product-${handle}`;
  const now = Date.now();

  // Check simple cache
  const cached = simpleCache.get(cacheKey);
  if (cached && now - cached.timestamp < CACHE_TTL) {
    console.log(`⚡ Cache hit for: ${handle}`);
    return cached.data;
  }

  const startTime = logPerf(`simple-product-${handle}`);

  try {
    // ONLY get Swell product - no Sanity complications
    const product = await getProduct(handle);

    if (!product) {
      console.log('❌ Swell product not found');
      return null;
    }

    logPerf(`simple-product-${handle}`, startTime);

    const result = { product, sanityData: null };

    // Cache the result
    simpleCache.set(cacheKey, { data: result, timestamp: now });

    // Cleanup old entries
    if (simpleCache.size > 50) {
      cleanupSimpleCache();
    }

    return result;
  } catch (error) {
    logPerf(`simple-product-${handle}`, startTime);
    console.error('❌ Simple product error:', error);
    return null;
  }
});

// OPTIONAL: Try to get Sanity data separately (if working)
export const getSanityDataSafe = async (swellProductId: string): Promise<any> => {
  if (!swellProductId || !process.env.NEXT_PUBLIC_SANITY_PROJECT_ID) {
    return null;
  }

  const startTime = logPerf(`sanity-safe-${swellProductId}`);

  try {
    // Direct HTTP request to avoid client library issues
    const query =
      encodeURIComponent(`*[_type == "product" && !(_id in path("drafts.**")) && swellProductId == "${swellProductId}"][0] {
      _id,
      title,
      swellProductId,
      mainImage {
        asset->{ _id, url, metadata { lqip, dimensions { width, height } } },
        alt
      },
      description,
      artist,
      inMixtapes[0..3] {
        mixtape->{ _id, title, slug },
        trackTitle
      }
    }`);

    const url = `https://${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}.api.sanity.io/v2023-05-03/data/query/${process.env.NEXT_PUBLIC_SANITY_DATASET}?query=${query}`;

    const response = await fetch(url, {
      headers: process.env.NEXT_PUBLIC_SANITY_API_TOKEN
        ? {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_SANITY_API_TOKEN}`
          }
        : {},
      next: { revalidate: 900 },
      signal: AbortSignal.timeout(5000) // 5 second timeout
    });

    if (!response.ok) {
      console.log(`⚠️ Sanity API returned ${response.status}`);
      return null;
    }

    const data = await response.json();
    const sanityData = data.result?.[0] || null;

    logPerf(`sanity-safe-${swellProductId}`, startTime);
    return sanityData;
  } catch (error) {
    logPerf(`sanity-safe-${swellProductId}`, startTime);
    console.log(`⚠️ Sanity lookup failed (non-critical):`, error.message);
    return null;
  }
};

// ENHANCED: Get product with optional Sanity enhancement
export const getProductDataEnhanced = cache(async (handle: string) => {
  const startTime = logPerf(`enhanced-product-${handle}`);

  try {
    // Step 1: Always get Swell product first (critical)
    const product = await getProduct(handle);

    if (!product) {
      return null;
    }

    // Step 2: Try to enhance with Sanity data (optional)
    let sanityData = null;
    try {
      sanityData = await getSanityDataSafe(product.id);
    } catch (error) {
      console.log('⚠️ Sanity enhancement failed, continuing with Swell data only');
    }

    logPerf(`enhanced-product-${handle}`, startTime);

    console.log(`✅ Product loaded: ${product.name}`, {
      hasSwellData: true,
      hasSanityData: !!sanityData,
      sanityTitle: sanityData?.title,
      hasSanityImages: !!sanityData?.mainImage
    });

    return { product, sanityData };
  } catch (error) {
    logPerf(`enhanced-product-${handle}`, startTime);
    console.error('❌ Enhanced product error:', error);
    return null;
  }
});

// Simple LQIP generation (no external dependencies)
export function createSimpleLQIP(lqip: any, assetUrl: string): string | undefined {
  // Direct data URL
  if (typeof lqip === 'string' && lqip.startsWith('data:')) {
    return lqip;
  }

  // Base64 string
  if (typeof lqip === 'string' && lqip.length > 10) {
    return `data:image/jpeg;base64,${lqip}`;
  }

  // Blur fallback
  if (assetUrl) {
    return `${assetUrl}?blur=20&w=10&h=10`;
  }

  return undefined;
}

// Cache cleanup
function cleanupSimpleCache() {
  const now = Date.now();
  for (const [key, value] of simpleCache.entries()) {
    if (now - value.timestamp > CACHE_TTL) {
      simpleCache.delete(key);
    }
  }
}

// Health check function
export async function healthCheck(): Promise<boolean> {
  try {
    // Test Swell connection
    const testProduct = await getProduct('test-handle');
    return true;
  } catch (error) {
    console.error('❌ Health check failed:', error);
    return false;
  }
}
