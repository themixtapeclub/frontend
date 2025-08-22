// lib/data/products/services/sanity-service.ts

import { sanityClient } from '../../../cms/sanity/client';
import {
  BASE_PRODUCT_FILTER,
  BASE_PRODUCT_FILTER_WITH_IMAGE,
  DEFAULT_LIMITS,
  FAST_QUERY_FIELDS,
  PRODUCT_QUERY_FIELDS
} from '../constants';
import type {
  ArchiveType,
  MergedProduct,
  ProductSearchResult,
  ProductsWithBreakdown
} from '../types';
import { slugToLabelName } from '../utils/extractors';
import { createArchiveFilterCondition, getGenreFilterCondition } from '../utils/filters';
import { convertSanityProductOnly, isProductInStock } from '../utils/transformers';
import { getCurrentWeekWWYY, getTargetWeeks } from '../utils/week-helpers';
import { enrichWithSwellData } from './swell-service';

export async function getFeaturedProductsEnriched(
  limit: number = DEFAULT_LIMITS.FEATURED
): Promise<MergedProduct[]> {
  try {
    const query = `*[${BASE_PRODUCT_FILTER_WITH_IMAGE} 
      && featured == true 
      && stock > 0 
&& (inStock == true || inStock == null)] | order(coalesce(orderRank, "zzz") asc) [0...${limit}] {
      ${FAST_QUERY_FIELDS}
    }`;
    console.log('🔍 Query:', query.substring(0, 300));

    const products = await sanityClient.fetch(query);
    if (!products || !Array.isArray(products)) return [];
    return products.map((product: any) => convertSanityProductOnly(product, true));
  } catch (error) {
    return [];
  }
}

export async function getNewProducts(
  limit: number = DEFAULT_LIMITS.NEW_PRODUCTS,
  excludedIds: string[] = []
): Promise<MergedProduct[]> {
  try {
    const currentWeek = getCurrentWeekWWYY();
    const excludeFilter =
      excludedIds.length > 0
        ? ` && !(_id in [${excludedIds.map((id) => `"${id}"`).join(', ')}])`
        : '';

    const query = `*[${BASE_PRODUCT_FILTER_WITH_IMAGE} 
      && "${currentWeek}" in week[]${excludeFilter}] | order(coalesce(orderRank, "zzz") asc) [0...${
        limit * 2
      }] {
      ${FAST_QUERY_FIELDS}
    }`;

    const products = await sanityClient.fetch(query);
    if (!products || !Array.isArray(products)) return [];
    return products.map((product: any) => convertSanityProductOnly(product, false)).slice(0, limit);
  } catch (error) {
    return [];
  }
}

export async function getProductsByArchive(
  archiveType: ArchiveType,
  slug: string,
  page: number = 1,
  limit: number = 20,
  includeOutOfStock: boolean = false
): Promise<ProductSearchResult> {
  try {
    const safePage = Math.max(1, Number(page) || 1);
    const safeLimit = Math.max(1, Math.min(100, Number(limit) || 20));
    const offset = (safePage - 1) * safeLimit;

    let actualName = '';
    let filterCondition = '';

    if (archiveType === 'genre') {
      filterCondition = await getGenreFilterCondition(slug);
      actualName = slugToLabelName(slug);

      try {
        const submenuLabelQuery = `*[_type == "submenuItem" && slug.current == "${slug}"][0].label`;
        const submenuLabel = await sanityClient.fetch(submenuLabelQuery);
        if (submenuLabel) {
          actualName = submenuLabel;
        }
      } catch (error) {
        // Keep fallback actualName
      }
    } else {
      filterCondition = createArchiveFilterCondition(archiveType, slug) as string;
      actualName = slugToLabelName(slug);
    }

    const stockCondition = includeOutOfStock
      ? ''
      : ' && stock > 0 && (inStock == true || inStock == null)';
    const baseFilter = `${BASE_PRODUCT_FILTER_WITH_IMAGE} && (${filterCondition}) && week[0] != "0001"${stockCondition}`;

    const countQuery = `count(*[${baseFilter}])`;
    const total = await sanityClient.fetch(countQuery);

    const orderClause = includeOutOfStock
      ? `select(stock > 0 && inStock == true => 0, 1) asc, defined(week[0]) desc, select(length(week[0]) == 4 => week[0][2] + week[0][3] + week[0][0] + week[0][1], "0000") desc, coalesce(orderRank, "zzz") asc`
      : `defined(week[0]) desc, select(length(week[0]) == 4 => week[0][2] + week[0][3] + week[0][0] + week[0][1], "0000") desc, coalesce(orderRank, "zzz") asc`;

    const query = `*[${baseFilter}] | order(${orderClause}) [${offset}...${offset + safeLimit}] {
      ${FAST_QUERY_FIELDS}
    }`;

    const products = await sanityClient.fetch(query);
    if (!products || !Array.isArray(products)) {
      return { products: [], total: 0, pages: 0, currentPage: safePage, actualName };
    }

    const convertedProducts = products.map((product: any) =>
      convertSanityProductOnly(product, false)
    );
    const pages = Math.ceil(total / safeLimit);

    return { products: convertedProducts, total, pages, currentPage: safePage, actualName };
  } catch (error) {
    return { products: [], total: 0, pages: 0, currentPage: 1, actualName: slug };
  }
}

async function getNewProductsWithBreakdown(
  limit: number = DEFAULT_LIMITS.NEW_PRODUCTS,
  excludedIds: string[] = [],
  maxWeeks: number = DEFAULT_LIMITS.MAX_WEEKS,
  returnBreakdown: boolean = false
): Promise<MergedProduct[] | ProductsWithBreakdown> {
  try {
    const allWeeksQuery = `*[${BASE_PRODUCT_FILTER} && defined(week) && count(week) > 0] { week }`;
    const allWeeksResult = await sanityClient.fetch(allWeeksQuery);

    const uniqueWeeks = [...new Set(allWeeksResult.flatMap((p: any) => p.week || []))].filter(
      (week): week is string => typeof week === 'string' && /^\d{4}$/.test(week)
    );

    const targetWeeks = getTargetWeeks(maxWeeks, uniqueWeeks);

    if (targetWeeks.length === 0) {
      if (returnBreakdown) return { products: [], weeksUsed: [], weekBreakdown: {} };
      return [];
    }

    const mostRecentWeek = targetWeeks[0];
    const allProducts: MergedProduct[] = [];
    const usedProductIds = new Set<string>();
    excludedIds.forEach((id) => usedProductIds.add(id));

    for (const week of targetWeeks) {
      const isFirstWeek = week === mostRecentWeek;
      const stockCondition = isFirstWeek
        ? ''
        : ' && stock > 0 && (inStock == true || inStock == null)';

      const query = `*[${BASE_PRODUCT_FILTER_WITH_IMAGE} 
        && defined(week) 
        && count(week) > 0
        && length(week[0]) == 4
        && !(week[0] match "*RSD*")
        && !(week[0] match "*LPH*")
        && "${week}" in week[]${stockCondition}] | order(coalesce(orderRank, "zzz") asc) [0...200] {
        ${PRODUCT_QUERY_FIELDS}
      }`;

      const weekProducts = await sanityClient.fetch(query);
      if (weekProducts && Array.isArray(weekProducts)) {
        const enrichedProducts = await Promise.all(
          weekProducts.map((p: any) => enrichWithSwellData(p))
        );

        const filteredProducts = enrichedProducts.filter((product) => {
          if (usedProductIds.has(product.id)) return false;
          if (isFirstWeek) {
            usedProductIds.add(product.id);
            return true;
          } else {
            const inStock = isProductInStock(product);
            if (inStock) {
              usedProductIds.add(product.id);
              return true;
            }
            return false;
          }
        });

        filteredProducts.forEach((product) => {
          (product as any).displayWeek = week;
        });

        allProducts.push(...filteredProducts);
        if (limit < 100 && allProducts.length >= limit) break;
      }
    }

    const finalProducts = limit < 100 ? allProducts.slice(0, limit) : allProducts;

    if (returnBreakdown) {
      const weekBreakdown: { [week: string]: number } = {};
      const weeksUsed: string[] = [];

      finalProducts.forEach((product) => {
        const displayWeek = (product as any).displayWeek || product.week || 'unknown';
        if (!weekBreakdown[displayWeek]) {
          weekBreakdown[displayWeek] = 0;
          if (!weeksUsed.includes(displayWeek)) {
            weeksUsed.push(displayWeek);
          }
        }
        weekBreakdown[displayWeek]++;
      });

      return { products: finalProducts, weeksUsed: targetWeeks, weekBreakdown };
    }

    return finalProducts;
  } catch (error) {
    if (returnBreakdown) return { products: [], weeksUsed: [], weekBreakdown: {} };
    return [];
  }
}

export async function getNewProductsWithBreakdownData(
  limit: number = DEFAULT_LIMITS.NEW_PRODUCTS,
  excludedIds: string[] = [],
  maxWeeks: number = DEFAULT_LIMITS.MAX_WEEKS
): Promise<ProductsWithBreakdown> {
  return getNewProductsWithBreakdown(
    limit,
    excludedIds,
    maxWeeks,
    true
  ) as Promise<ProductsWithBreakdown>;
}

export async function getFeaturedProducts(
  limit: number = DEFAULT_LIMITS.FEATURED
): Promise<MergedProduct[]> {
  try {
    // Use FAST_QUERY_FIELDS and only fetch what we need
    const query = `*[${BASE_PRODUCT_FILTER_WITH_IMAGE} 
      && featured == true 
      && stock > 0 
&& (inStock == true || inStock == null)] | order(coalesce(orderRank, "zzz") asc) [0...${limit}] {

      ${FAST_QUERY_FIELDS}
    }`;

    const products = await sanityClient.fetch(query);
    if (!products || !Array.isArray(products)) return [];

    // Use the fast converter without enrichment (like getNewProductsOptimized)
    return products.map((product: any) => convertSanityProductOnly(product, true));
  } catch (error) {
    console.error('getFeaturedProducts error:', error);
    return [];
  }
}

export async function searchProducts(
  searchTerm: string,
  page: number = 1,
  limit: number = DEFAULT_LIMITS.SEARCH
): Promise<ProductSearchResult> {
  try {
    const safeLimit = Math.max(1, Math.min(100, Number(limit) || 20));
    const offset = (page - 1) * safeLimit;

    const searchConditions = [
      `title match "*${searchTerm}*"`,
      `"${searchTerm}" in artist[]`,
      `"${searchTerm}" in label[]`,
      `"${searchTerm}" in genre[].main`,
      `"${searchTerm}" in tags[]`
    ].join(' || ');

    const fullFilter = `${BASE_PRODUCT_FILTER_WITH_IMAGE} && (${searchConditions}) && defined(swellProductId)`;

    const countQuery = `count(*[${fullFilter}])`;
    const total = await sanityClient.fetch(countQuery);

    const query = `*[${fullFilter}] | order(_score desc, week[0] asc, coalesce(orderRank, "zzz") asc) [${offset}...${
      offset + safeLimit
    }] {
      ${PRODUCT_QUERY_FIELDS}
    }`;

    const products = await sanityClient.fetch(query);
    if (!products || !Array.isArray(products)) {
      return { products: [], total: 0, pages: 0, currentPage: page };
    }

    const enrichedProducts = await Promise.all(products.map((p: any) => enrichWithSwellData(p)));
    const inStockProducts = enrichedProducts.filter(isProductInStock);
    const pages = Math.ceil(total / safeLimit);

    return { products: inStockProducts, total, pages, currentPage: page };
  } catch (error) {
    return { products: [], total: 0, pages: 0, currentPage: 1 };
  }
}

export async function getProduct(handle: string): Promise<MergedProduct | null> {
  try {
    const query = `*[${BASE_PRODUCT_FILTER} && (slug.current == $handle || swellSlug == $handle || sku == $handle)][0] {
      ${PRODUCT_QUERY_FIELDS}
    }`;

    const product = await sanityClient.fetch(query, { handle });
    if (!product) return null;

    return await enrichWithSwellData(product);
  } catch (error) {
    return null;
  }
}
