// lib/services/optimizedProduct.ts
import { getProduct } from 'lib/data/products/index';
import { cookies } from 'next/headers';
import { cache } from 'react';

interface MergedProduct {
  id: string;
  title?: string;
  name: string;
  description?: string;
  artist?: string;
  label?: string;
  format?: string;
  genre?: string;
  country?: string;
  released?: string;
  catalog?: string;
  media?: string;
  sleeve?: string;
  notes?: string;
  mainImage?: any;
  gallery?: any[];
  tracklist?: any[];
  inMixtapes?: any[];
  attributes?: {
    per_customer?: boolean;
  };
  sanityContent?: SanityContent;
  stock_level?: number;
  stock_purchasable?: boolean;
  stock_tracking?: boolean;
  price?: number;
  currency?: string;
  swellProductId?: string;
}

interface SanityContent {
  _id: string;
  title?: string;
  swellProductId?: string;
  mainImage?: any;
  additionalImages?: any[];
  gallery?: any[];
  description?: string;
  discogsReleaseId?: number;
  tracklist?: any[];
  inMixtapes?: any[];
  artist?: any;
  label?: any;
  format?: any;
  genre?: any;
  country?: string;
  released?: string;
  catalog?: string;
  media?: string;
  sleeve?: string;
  notes?: string;
}

const productDataCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const promiseCache = new Map<string, Promise<any>>();

async function checkPerCustomerStatus(productId: string): Promise<any> {
  try {
    if (typeof window !== 'undefined') {
      return { canPurchase: true };
    }

    const cookieStore = cookies();
    const userSession = (await cookieStore).get('swell-session')?.value;

    if (!userSession) {
      return {
        canPurchase: true,
        hasAlreadyPurchased: false,
        requiresLogin: true
      };
    }

    return {
      canPurchase: true,
      hasAlreadyPurchased: false,
      requiresLogin: false
    };
  } catch (error) {
    return { canPurchase: true };
  }
}

function normalizeField(field: any, type: 'array' | 'object' = 'array'): any {
  if (!field) return type === 'array' ? [] : null;

  if (typeof field === 'string') {
    return type === 'array' ? [field] : { main: field };
  }

  if (Array.isArray(field)) {
    return type === 'array'
      ? field.map((item) =>
          typeof item === 'string' ? item : item?.name || item?.title || String(item)
        )
      : field.map((item) => (typeof item === 'string' ? { main: item } : item));
  }

  if (typeof field === 'object') {
    if (type === 'array') {
      return [field.name || field.title || String(field)];
    }
    return field.main ? [field] : [{ main: field.name || field.title || String(field) }];
  }

  return type === 'array' ? [String(field)] : { main: String(field) };
}

export function invalidateProductDataCache(handle: string) {
  const cacheKey = `product-data-${handle}`;
  productDataCache.delete(cacheKey);
  promiseCache.delete(cacheKey);
}

async function getProductDataBySwellInternal(handle: string, bypassCache: boolean = false) {
  const cacheKey = `product-data-${handle}`;

  if (!bypassCache) {
    const cached = productDataCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data;
    }

    const promiseCached = promiseCache.get(cacheKey);
    if (promiseCached) {
      return promiseCached;
    }
  }

  const promise = (async () => {
    try {
      const mergedProduct = (await getProduct(handle)) as MergedProduct | null;

      if (!mergedProduct) {
        return null;
      }

      // Simplified product processing
      const product = {
        ...mergedProduct,
        name: mergedProduct.title || mergedProduct.name,
        description: mergedProduct.description
      };

      // Only check per-customer status if needed
      let perCustomerStatus = null;
      if (mergedProduct.attributes?.per_customer === true) {
        perCustomerStatus = await checkPerCustomerStatus(mergedProduct.id);
      }

      // Simplified availability check
      const isAvailable =
        product.stock_purchasable ??
        (product.stock_tracking ? (product.stock_level || 0) > 0 : false);

      // Streamlined sanity data processing
      const sanityData = mergedProduct.sanityContent
        ? {
            _id: mergedProduct.sanityContent._id,
            title: mergedProduct.sanityContent.title || mergedProduct.title,
            swellProductId: mergedProduct.sanityContent.swellProductId,
            mainImage: mergedProduct.sanityContent.mainImage || mergedProduct.mainImage,
            additionalImages: mergedProduct.sanityContent.additionalImages || [],
            gallery: mergedProduct.sanityContent.gallery || mergedProduct.gallery,
            description: mergedProduct.sanityContent.description || mergedProduct.description,

            // Use simplified field normalization
            artist: normalizeField(mergedProduct.sanityContent.artist || mergedProduct.artist),
            label: normalizeField(mergedProduct.sanityContent.label || mergedProduct.label),
            format: normalizeField(
              mergedProduct.sanityContent.format || mergedProduct.format,
              'object'
            ),
            genre: normalizeField(
              mergedProduct.sanityContent.genre || mergedProduct.genre,
              'object'
            ),

            // Direct assignments (no processing needed)
            country: mergedProduct.sanityContent.country || mergedProduct.country,
            released: mergedProduct.sanityContent.released || mergedProduct.released,
            catalog: mergedProduct.sanityContent.catalog || mergedProduct.catalog,
            media: mergedProduct.sanityContent.media || mergedProduct.media,
            sleeve: mergedProduct.sanityContent.sleeve || mergedProduct.sleeve,
            notes: mergedProduct.sanityContent.notes || mergedProduct.notes,

            discogsReleaseId: mergedProduct.sanityContent.discogsReleaseId,
            tracklist: mergedProduct.sanityContent.tracklist || mergedProduct.tracklist || [],
            inMixtapes: mergedProduct.sanityContent.inMixtapes || mergedProduct.inMixtapes || []
          }
        : {
            title: mergedProduct.title || mergedProduct.name,
            description: mergedProduct.description,
            artist: normalizeField(mergedProduct.artist),
            label: normalizeField(mergedProduct.label),
            format: normalizeField(mergedProduct.format, 'object'),
            genre: normalizeField(mergedProduct.genre, 'object'),
            country: mergedProduct.country,
            released: mergedProduct.released,
            catalog: mergedProduct.catalog,
            media: mergedProduct.media,
            sleeve: mergedProduct.sleeve,
            notes: mergedProduct.notes,
            tracklist: mergedProduct.tracklist || [],
            inMixtapes: mergedProduct.inMixtapes || []
          };

      const result = {
        product: {
          ...product,
          perCustomerStatus,
          stockPurchasable: isAvailable,
          stockLevel: product.stock_level || 0,
          media: sanityData.media,
          sleeve: sanityData.sleeve,
          notes: sanityData.notes
        },
        sanityData
      };

      if (!bypassCache) {
        productDataCache.set(cacheKey, {
          data: result,
          timestamp: Date.now()
        });
      }
      promiseCache.delete(cacheKey);

      return result;
    } catch (error) {
      promiseCache.delete(cacheKey);
      return null;
    }
  })();

  if (!bypassCache) {
    promiseCache.set(cacheKey, promise);
  }
  return await promise;
}

export const getProductDataBySwell = cache(getProductDataBySwellInternal);

export function getProductDataBySwellFresh(handle: string) {
  return getProductDataBySwellInternal(handle, true);
}

export function createLQIPDataURL(lqip: any, assetUrl: string): string | undefined {
  if (typeof lqip === 'string' && lqip.startsWith('data:image/')) {
    return lqip;
  }

  if (typeof lqip === 'string' && lqip.length > 20) {
    return `data:image/jpeg;base64,${lqip}`;
  }

  if (assetUrl) {
    if (assetUrl.includes('sanity') || assetUrl.includes('cdn.sanity.io')) {
      return `${assetUrl}?blur=50&w=20&h=20&q=20&fit=fill`;
    } else if (assetUrl.includes('swell')) {
      return `${assetUrl}?blur=20&w=20&h=20&q=10`;
    }
    return `${assetUrl}?blur=20&w=20&h=20`;
  }

  return undefined;
}

export function preloadProductAssets(handle: string) {
  if (typeof window !== 'undefined') {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = `/api/products/${handle}`;
    document.head.appendChild(link);
  }
}

export async function warmCache(handles: string[]) {
  if (process.env.NODE_ENV === 'production') {
    handles.slice(0, 5).forEach((handle) => {
      setTimeout(() => {
        getProductDataBySwell(handle).catch(() => {});
      }, Math.random() * 1000);
    });
  }
}

export { checkPerCustomerStatus };
