// lib/swell/client.ts

import swell from 'swell-js';

const domain = `https://${process.env.NEXT_PUBLIC_SWELL_STORE_ID!}.swell.store`;
const key = process.env.NEXT_PUBLIC_SWELL_PUBLIC_KEY!;

const serverFetch = async <T>(endpoint: string, options: RequestInit = {}): Promise<T> => {
  const url = `${domain}/api/${endpoint}`;

  const fetchOptions: RequestInit = {
    ...options,
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      ...options.headers
    }
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      if (response.status === 404 && endpoint.includes('cart')) {
        return null as T;
      }
      if (response.status === 404) {
        throw new Error(`Resource not found: ${endpoint}`);
      }
      throw new Error(`Swell API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Request timeout');
    }
    throw error;
  }
};

let swellInitialized = false;

const initSwell = () => {
  if (typeof window !== 'undefined' && !swellInitialized) {
    swell.init(process.env.NEXT_PUBLIC_SWELL_STORE_ID!, process.env.NEXT_PUBLIC_SWELL_PUBLIC_KEY!);
    swellInitialized = true;
  }
  return swell;
};

if (typeof window !== 'undefined') {
  initSwell();
}

const isServer = typeof window === 'undefined';

export const getCart = async () => {
  try {
    if (isServer) {
      return null;
    }

    const swellClient = initSwell();
    const cart = await swellClient.cart.get();
    return cart;
  } catch (error) {
    console.error('❌ Error getting cart:', error);
    return null;
  }
};

export const addToCart = async (params: {
  productId: string;
  quantity: number;
  options?: Array<{ name: string; value: string }>;
}) => {
  try {
    if (isServer) {
      throw new Error('Cart operations are not available on server');
    }

    const swellClient = initSwell();
    const addItemParams: any = {
      product_id: params.productId,
      quantity: params.quantity
    };

    if (params.options && params.options.length > 0) {
      addItemParams.options = params.options;
    }

    const cart = await swellClient.cart.addItem(addItemParams);
    return cart;
  } catch (error) {
    console.error('❌ Error adding to cart:', error);
    throw error;
  }
};

export const updateCartItem = async (itemId: string, quantity: number) => {
  try {
    if (isServer) {
      throw new Error('Cart operations are not available on server');
    }

    const swellClient = initSwell();
    const cart = await swellClient.cart.updateItem(itemId, { quantity });
    return cart;
  } catch (error) {
    console.error('❌ Error updating cart item:', error);
    throw error;
  }
};

export const removeCartItem = async (itemId: string) => {
  try {
    if (isServer) {
      throw new Error('Cart operations are not available on server');
    }

    const swellClient = initSwell();
    const cart = await swellClient.cart.removeItem(itemId);
    return cart;
  } catch (error) {
    console.error('❌ Error removing cart item:', error);
    throw error;
  }
};

export const getProduct = async (slug: string, options?: any) => {
  try {
    if (isServer) {
      const data = await serverFetch<any>(`products/${slug}`);
      return data;
    } else {
      const swellClient = initSwell();
      const product = await swellClient.products.get(slug);
      return product;
    }
  } catch (error) {
    console.error('❌ Error getting product:', error);
    return null;
  }
};

export const getProducts = async (params?: {
  query?: string;
  sort?: string;
  limit?: number;
  page?: number;
  category?: string;
}) => {
  try {
    if (isServer) {
      const searchParams = new URLSearchParams();
      if (params?.limit) searchParams.set('limit', params.limit.toString());
      if (params?.page) searchParams.set('page', params.page.toString());
      if (params?.sort) searchParams.set('sort', params.sort);
      if (params?.query) searchParams.set('search', params.query);
      if (params?.category) searchParams.set('category', params.category);

      const endpoint = `products${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
      const data = await serverFetch<{ results: any[] }>(endpoint);
      return data.results || [];
    } else {
      const swellClient = initSwell();
      const queryParams: any = {};
      if (params?.limit) queryParams.limit = params.limit;
      if (params?.page) queryParams.page = params.page;
      if (params?.sort) queryParams.sort = params.sort;
      if (params?.query) queryParams.search = params.query;
      if (params?.category) queryParams.category = params.category;

      const response = await swellClient.products.list(queryParams);
      return response.results || [];
    }
  } catch (error) {
    console.error('❌ Error getting products:', error);
    return [];
  }
};

export const getCategories = async () => {
  try {
    if (isServer) {
      const data = await serverFetch<{ results: any[] }>('categories');
      return data.results || [];
    } else {
      const swellClient = initSwell();
      const response = await swellClient.categories.list();
      return response.results || [];
    }
  } catch (error) {
    console.error('❌ Error getting categories:', error);
    return [];
  }
};

export const getCategory = async (slug: string) => {
  try {
    if (isServer) {
      const data = await serverFetch<any>(`categories/${slug}`);
      return data;
    } else {
      const swellClient = initSwell();
      const category = await swellClient.categories.get(slug);
      return category;
    }
  } catch (error) {
    console.error('❌ Error getting category:', error);
    return null;
  }
};

export const getProductsByCategory = async (
  category: string,
  params?: {
    query?: string;
    sort?: string;
    limit?: number;
  }
) => {
  return getProducts({ ...params, category });
};

export const testSwellConnection = async (): Promise<boolean> => {
  try {
    await getProducts({ limit: 1 });
    return true;
  } catch (error) {
    console.error('❌ Swell connection test failed:', error);
    return false;
  }
};

export const updateCart = updateCartItem;
export const removeFromCart = removeCartItem;

export const getMenus = async () => {
  try {
    return { sections: [] };
  } catch (error) {
    return { sections: [] };
  }
};

export const getMenu = async (id: string) => {
  try {
    const menus = await getMenus();
    return menus.sections.find((menu: any) => menu.id === id);
  } catch (error) {
    return null;
  }
};

export async function revalidate(req?: any) {
  try {
    if (typeof window === 'undefined') {
      const { revalidateTag } = await import('next/cache');
      ['products', 'cart', 'categories'].forEach((tag) => {
        try {
          revalidateTag(tag);
        } catch (e) {
          // Ignore revalidation errors
        }
      });
    }
    return { status: 200 };
  } catch (error) {
    return { status: 500 };
  }
}

export interface SwellProduct {
  id: string;
  slug: string;
  sku?: string;
  name: string;
  price: number;
  currency: string;
  description?: string;
  stock_level?: number;
  stock_tracking?: boolean;
  stock_purchasable?: boolean;
  images?: Array<{ file: { url: string }; caption?: string }>;
  date_created: string;
  options?: Array<{
    id: string;
    name: string;
    values?: Array<{ id: string; name: string; price?: number }>;
  }>;
}

export interface SwellCartItem {
  id: string;
  product_id: string;
  quantity: number;
  price: number;
  price_total: number;
  product?: SwellProduct;
  options?: Array<{ name: string; value: string }>;
}

export interface SwellCart {
  id?: string;
  items?: SwellCartItem[];
  item_quantity?: number;
  grand_total?: number;
  sub_total?: number;
  tax_total?: number;
  shipment_total?: number;
  currency?: string;
  checkout_id?: string;
  checkout_url?: string;
}

export interface SwellCartItemOptionInput {
  name: string;
  value: string;
}

export async function getCartQuantityForProduct(
  productId: string,
  options: Array<{ name: string; value: string }>
): Promise<number> {
  try {
    if (isServer) {
      return 0;
    }

    const swellClient = initSwell();
    const cart = await swellClient.cart.get();

    if (!cart?.items) {
      return 0;
    }

    const matchingItem = cart.items.find((item: any) => {
      if (item.product_id !== productId) return false;

      if (options.length === 0) {
        return true;
      }

      if (item.options) {
        const optionsMatch = options.every((option) => {
          const itemOptionValue = item.options?.[option.name];
          return itemOptionValue === option.value;
        });
        return optionsMatch;
      }

      return false;
    });

    return matchingItem?.quantity || 0;
  } catch (error) {
    console.error('❌ Error getting cart quantity:', error);
    return 0;
  }
}

export { swell };
export default swell;
