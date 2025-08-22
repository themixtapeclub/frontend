// lib/swell/products.ts
import { getProduct, getProducts } from './client';

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
  stock_status?: string; // Added stock_status field
  media?: string; // Added condition field
  sleeve?: string; // Added condition field
  notes?: string; // Added condition field
  images?: Array<{ file: { url: string }; caption?: string }>;
  date_created: string;
  options?: Array<{
    id: string;
    name: string;
    values?: Array<{ id: string; name: string; price?: number }>;
  }>;
  variants?: {
    results?: Array<{
      id: string;
      stock_level: number;
      stock_purchasable: boolean;
      price?: number;
    }>;
  };
}

export async function getSwellProduct(idOrSku: string): Promise<SwellProduct | null> {
  try {
    const product = await getProduct(idOrSku);

    if (!product) {
      return null;
    }

    // Extract condition fields from content.condition array or attributes
    const conditionData = product.content?.condition?.[0] || {};
    const media = conditionData.media || product.attributes?.media_condition;
    const sleeve = conditionData.sleeve || product.attributes?.sleeve_condition;
    const notes = conditionData.notes || product.attributes?.condition_notes;

    return {
      id: product.id,
      slug: product.slug,
      sku: product.sku,
      name: product.name,
      price: product.price || 0,
      currency: product.currency || 'USD',
      description: product.description || '',
      stock_level: product.stock_level || 0,
      stock_purchasable: product.stock_purchasable || false,
      stock_tracking: product.stock_tracking || false,
      stock_status: product.stock_status, // Add stock_status
      media: media, // Extract from content.condition or attributes
      sleeve: sleeve, // Extract from content.condition or attributes
      notes: notes, // Extract from content.condition or attributes
      images: product.images,
      variants: product.variants,
      date_created: product.date_created || new Date().toISOString(),
      options: product.options
    };
  } catch (error) {
    return null;
  }
}

export async function getSwellProducts(options: {
  ids?: string[];
  skus?: string[];
  limit?: number;
  page?: number;
}): Promise<SwellProduct[]> {
  try {
    const { ids, skus, limit = 50, page = 1 } = options;

    // Get products one by one since your client doesn't support batch operations
    const productPromises: Promise<SwellProduct | null>[] = [];

    if (ids && ids.length > 0) {
      productPromises.push(...ids.map((id) => getSwellProduct(id)));
    } else if (skus && skus.length > 0) {
      productPromises.push(...skus.map((sku) => getSwellProduct(sku)));
    } else {
      // Get products using the general getProducts function
      const products = await getProducts({ limit, page });
      return products.map((product: any): SwellProduct => {
        // Extract condition fields from content.condition array or attributes
        const conditionData = product.content?.condition?.[0] || {};
        const media = conditionData.media || product.attributes?.media_condition;
        const sleeve = conditionData.sleeve || product.attributes?.sleeve_condition;
        const notes = conditionData.notes || product.attributes?.condition_notes;

        return {
          id: product.id,
          slug: product.slug,
          sku: product.sku,
          name: product.name,
          price: product.price || 0,
          currency: product.currency || 'USD',
          description: product.description || '',
          stock_level: product.stock_level || 0,
          stock_purchasable: product.stock_purchasable || false,
          stock_tracking: product.stock_tracking || false,
          stock_status: product.stock_status, // Add stock_status
          media: media, // Extract from content.condition or attributes
          sleeve: sleeve, // Extract from content.condition or attributes
          notes: notes, // Extract from content.condition or attributes
          images: product.images,
          variants: product.variants,
          date_created: product.date_created || new Date().toISOString(),
          options: product.options
        };
      });
    }

    const results = await Promise.all(productPromises);
    const validProducts = results.filter((product): product is SwellProduct => product !== null);

    return validProducts;
  } catch (error) {
    return [];
  }
}

export async function checkSwellStock(
  productId: string,
  variantId?: string
): Promise<{
  stock_level: number;
  stock_purchasable: boolean;
  price?: number;
}> {
  try {
    const product = await getSwellProduct(productId);

    if (!product) {
      return {
        stock_level: 0,
        stock_purchasable: false
      };
    }

    if (variantId && product.variants?.results) {
      const variant = product.variants.results.find((v) => v.id === variantId);
      if (variant) {
        return {
          stock_level: variant.stock_level || 0,
          stock_purchasable: variant.stock_purchasable || false,
          price: variant.price || product.price
        };
      }
    }

    return {
      stock_level: product.stock_level || 0,
      stock_purchasable: product.stock_purchasable || false,
      price: product.price
    };
  } catch (error) {
    return {
      stock_level: 0,
      stock_purchasable: false
    };
  }
}
