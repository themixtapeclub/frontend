// lib/queries/swell/products.ts

import swell from 'swell-js';

if (typeof window !== 'undefined') {
  console.log('🔑 Debug Swell.js env vars:', {
    storeId: process.env.NEXT_PUBLIC_SWELL_STORE_ID ? 'SET' : 'MISSING',
    publicKey: process.env.SWELL_PUBLIC_KEY ? 'SET' : 'MISSING',
    storeIdValue: process.env.NEXT_PUBLIC_SWELL_STORE_ID,
    publicKeyPrefix: process.env.SWELL_PUBLIC_KEY?.substring(0, 7) + '...'
  });

  swell.init(process.env.NEXT_PUBLIC_SWELL_STORE_ID!, process.env.SWELL_PUBLIC_KEY!);
}

const getSwellClient = () => {
  if (typeof window === 'undefined') {
    const swellInstance = require('swell-js');
    swellInstance.init(process.env.NEXT_PUBLIC_SWELL_STORE_ID!, process.env.SWELL_PUBLIC_KEY!);
    return swellInstance;
  }
  return swell;
};

export const getProductsByIds = async (productIds: string[]) => {
  try {
    console.log('📦 Swell: Fetching', productIds.length, 'specific products');

    if (!productIds.length) return [];

    const swellClient = getSwellClient();
    const allProducts = [];

    const batchSize = 10;

    for (let i = 0; i < productIds.length; i += batchSize) {
      const batch = productIds.slice(i, i + batchSize);

      try {
        const result = await swellClient.products.list({
          limit: batchSize,
          where: {
            id: { $in: batch }
          },
          expand: ['variants']
        });

        if (result.results && result.results.length > 0) {
          allProducts.push(...result.results);
        }

        if (i + batchSize < productIds.length && productIds.length > 20) {
          await new Promise((resolve) => setTimeout(resolve, 50));
        }
      } catch (batchError) {
        console.error(`❌ Swell batch error:`, batchError);
      }
    }

    console.log(
      '📦 Swell: Found',
      allProducts.length,
      'of',
      productIds.length,
      'requested products'
    );
    return allProducts;
  } catch (error) {
    console.error('❌ Swell getProductsByIds error:', error);
    return [];
  }
};

export const getProductsByIdsIndividual = async (productIds: string[]) => {
  try {
    console.log(
      '📦 Swell.js getProductsByIdsIndividual called for:',
      productIds.length,
      'products'
    );

    const swellClient = getSwellClient();
    const products = [];

    for (const productId of productIds.slice(0, 20)) {
      try {
        console.log(`📦 Fetching individual product: ${productId}`);

        const product = await swellClient.products.get(productId, {
          expand: ['variants']
        });

        if (product) {
          console.log(
            `📦 Found individual product: ${product.name} (stock: ${product.stock_level})`
          );
          products.push(product);
        } else {
          console.log(`📦 Product not found: ${productId}`);
        }

        await new Promise((resolve) => setTimeout(resolve, 50));
      } catch (productError) {
        console.error(`❌ Error fetching product ${productId}:`, productError);
      }
    }

    console.log('📦 getProductsByIdsIndividual result:', {
      requested: productIds.length,
      found: products.length
    });

    return products;
  } catch (error) {
    console.error('📦 Swell.js getProductsByIdsIndividual error:', error);
    return [];
  }
};

export const getProducts = async ({
  limit = 100,
  page = 1,
  sort,
  search,
  getAllPages = false,
  onlyInStock = false
}: {
  limit?: number;
  page?: number;
  sort?: string;
  search?: string;
  getAllPages?: boolean;
  onlyInStock?: boolean;
} = {}) => {
  try {
    console.log('📦 Swell.js getProducts called with:', {
      limit,
      page,
      sort,
      search,
      getAllPages,
      onlyInStock
    });

    const swellClient = getSwellClient();
    const actualLimit = Math.min(limit, 100);

    const queryOptions: any = {
      limit: actualLimit,
      page,
      sort,
      search,
      expand: ['variants']
    };

    if (onlyInStock) {
      queryOptions.where = {
        stock_level: { $gt: 0 },
        stock_status: 'in_stock'
      };
      console.log('📦 Filtering for in-stock products only');
    }

    if (!getAllPages) {
      const result = await swellClient.products.list(queryOptions);
      console.log('📦 Swell.js API response:', {
        count: result.count,
        resultsLength: result.results?.length || 0,
        page: result.page,
        pages: result.pages,
        filtered: onlyInStock ? 'in-stock only' : 'all products'
      });
      return result.results || [];
    }

    let allProducts = [];
    let currentPage = 1;
    let totalPages = 1;
    let maxPages = 20;

    do {
      console.log(
        `📦 Fetching page ${currentPage}/${totalPages || '?'} (${
          onlyInStock ? 'in-stock only' : 'all products'
        })`
      );

      const pageOptions = { ...queryOptions, page: currentPage };
      const result = await swellClient.products.list(pageOptions);

      if (result.results && result.results.length > 0) {
        allProducts.push(...result.results);
        totalPages = result.pages || 1;
        console.log(
          `📦 Page ${currentPage}: Got ${result.results.length} products, total so far: ${allProducts.length}`
        );
      } else {
        break;
      }

      currentPage++;

      if (currentPage > maxPages) {
        console.warn(`📦 Stopping at page ${maxPages} for safety`);
        break;
      }
    } while (currentPage <= totalPages);

    console.log('📦 Swell.js all pages response:', {
      totalProducts: allProducts.length,
      pagesRequested: currentPage - 1,
      totalPages,
      filtered: onlyInStock ? 'in-stock only' : 'all products'
    });

    return allProducts;
  } catch (error) {
    console.error('📦 Swell.js API error:', error);
    return [];
  }
};

export const getProduct = async (slug: string) => {
  try {
    console.log('📦 Swell.js getProduct called for:', slug);

    const swellClient = getSwellClient();

    const product = await swellClient.products.get(slug, {
      expand: ['variants']
    });

    console.log('📦 Swell.js product response:', {
      id: product?.id,
      name: product?.name,
      stock_level: product?.stock_level,
      stock_status: product?.stock_status
    });

    return product;
  } catch (error) {
    console.error('📦 Swell.js product error:', error);
    return null;
  }
};

export default {
  getProducts,
  getProduct,
  getProductsByIds,
  getProductsByIdsIndividual
};
