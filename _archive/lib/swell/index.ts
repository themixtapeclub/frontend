// lib/swell/index.ts - FIXED GraphQL version (simpler fix)
import { SWELL_GRAPHQL_API_ENDPOINT } from 'lib/shared/constants/global';

const domain = `https://${process.env.SWELL_STORE_ID!}.swell.store`;
const endpoint = `${domain}${SWELL_GRAPHQL_API_ENDPOINT}`;
const key = process.env.SWELL_PUBLIC_KEY!;

import { GraphQLClient } from 'graphql-request';
import { TAGS } from 'lib/shared/constants/global';
import { revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';
import { SwellCartItemOptionInput, getSdk } from './__generated__/graphql';

// FIXED: Simpler fetch - let GraphQL client handle timeouts
const client = new GraphQLClient(endpoint, {
  headers: {
    Authorization: key
  },
  timeout: 20000, // Single 20s timeout, no custom fetch
  errorPolicy: 'all'
});

const SwellClient = getSdk(client);

// FIXED: Simpler retry with better error handling
const withRetry = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 2,
  delay: number = 1000
): Promise<T> => {
  let lastError: Error;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;

      // Don't retry on final attempt or 404s
      if (attempt === maxRetries || error.response?.status === 404) break;

      // Simple linear backoff
      const waitTime = delay * (attempt + 1);
      console.warn(
        `⚠️ Swell API attempt ${attempt + 1} failed, retrying in ${waitTime}ms:`,
        error.message
      );

      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }
  }

  throw lastError!;
};

// Keep your existing functions but with simpler retry
export const getProduct = async (slug: string) => {
  return withRetry(async () => {
    const { data } = await SwellClient.getProduct({ slug });
    return data.productBySlug;
  });
};

export const getProducts = async ({ query, sort }: { query?: string; sort?: string }) => {
  return withRetry(async () => {
    const { data } = await SwellClient.getProducts({ query, sort });
    return data.products.results;
  });
};

export const getCart = async (sessionToken: string) => {
  return withRetry(async () => {
    try {
      client.setHeader('X-Session', sessionToken);
      const data = await getSdk(client).getCart();
      if (data.data.cart) {
        return { ...data.data.cart };
      }
    } catch (e) {
      // Fallback: try without session
      client.setHeader('X-Session', '');
      const data = await getSdk(client).getCart();
      if (data.data.cart) {
        return { ...data.data.cart };
      }
    }
  }, 1); // Only 1 retry for cart operations
};

export const addToCart = async (
  sessionToken: string | undefined,
  {
    productId,
    quantity,
    options
  }: { productId: string; quantity: number; options: SwellCartItemOptionInput[] | undefined }
) => {
  return withRetry(async () => {
    if (sessionToken) {
      client.setHeader('X-Session', sessionToken);
    }
    try {
      const addCartItem = await getSdk(client).addToCart({
        productId,
        quantity,
        options
      });
      return addCartItem;
    } catch (e) {
      client.setHeader('X-Session', '');
      const addCartItem = await getSdk(client).addToCart({
        productId,
        quantity,
        options
      });
      return addCartItem;
    }
  }, 1);
};

export const updateCart = async (
  sessionToken: string,
  {
    itemId,
    quantity
  }: {
    itemId: string;
    quantity: number;
  }
) => {
  return withRetry(async () => {
    client.setHeader('X-Session', sessionToken);
    const updateCart = await getSdk(client).editCartItem({
      itemId,
      quantity
    });
    return updateCart;
  }, 1);
};

export const removeFromCart = async (sessionToken: string, itemId: string) => {
  return withRetry(async () => {
    client.setHeader('X-Session', sessionToken);
    const removeCart = await getSdk(client).removeFromCart({
      itemId
    });
    return removeCart;
  }, 1);
};

export const getCategory = async (slug: string) => {
  return withRetry(async () => {
    const { data } = await SwellClient.getGategory({ slug });
    return data.categoryBySlug;
  });
};

export const getProductsByCategory = async (
  category: string,
  params?: {
    query?: string;
    sort?: string;
  }
) => {
  return withRetry(async () => {
    const { sort, query } = params || {};
    const { data } = await SwellClient.getProductsByCategory({
      category,
      sort,
      query
    });
    return data?.products.results;
  });
};

export const getCategories = async () => {
  return withRetry(async () => {
    const { data } = await SwellClient.getCategories();
    return data.categories.results;
  });
};

export const getMenus = async () => {
  return withRetry(async () => {
    const { data } = await SwellClient.getMenus();
    return data.menuSettings;
  });
};

export const getMenu = async (id: string) => {
  return withRetry(async () => {
    const menus = await getMenus();
    return menus.sections.find((menu) => menu.id === id);
  });
};

// Keep your existing revalidate function
export async function revalidate(req: NextRequest): Promise<NextResponse> {
  const collectionWebhooks = ['category.created', 'category.deleted', 'category.updated'];
  const productWebhooks = ['product.created', 'product.deleted', 'product.updated'];
  const { type } = await req.json();
  const secret = req.nextUrl.searchParams.get('secret');
  const isCollectionUpdate = collectionWebhooks.includes(type);
  const isProductUpdate = productWebhooks.includes(type);

  if (!secret || secret !== process.env.SWELL_REVALIDATION_SECRET) {
    console.error('Invalid revalidation secret.');
    return NextResponse.json({ status: 200 });
  }

  if (!isCollectionUpdate && !isProductUpdate) {
    return NextResponse.json({ status: 200 });
  }

  if (isCollectionUpdate) {
    revalidateTag(TAGS.collections);
  }

  if (isProductUpdate) {
    revalidateTag(TAGS.products);
  }

  return NextResponse.json({ status: 200, revalidated: true, now: Date.now() });
}
