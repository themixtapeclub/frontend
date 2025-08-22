// lib/queries/sanity/search.ts

import imageUrlBuilder from '@sanity/image-url';
import { sanityClient } from './core/client';

const builder = imageUrlBuilder(sanityClient);

export function urlFor(source: any) {
  return builder.image(source);
}

interface SearchParams {
  query?: string;
  sort?: string;
  limit?: number;
  page?: number;
  type?: string;
}

interface SearchResult {
  _id: string;
  _type: string;
  title: string;
  artist: string[];
  label: string[];
  [key: string]: any;
}

// Cache common base queries
const BASE_PRODUCT_FILTER = `_type == "product" && !(_id in path("drafts.**")) && defined(swellProductId) && !(title match "*lot*")`;
const BASE_MIXTAPE_FILTER = `_type == "mixtape" && !(_id in path("drafts.**")) && defined(featuredImage.asset) && archived != true`;

// Optimized field selection - only fetch what's needed
const PRODUCT_FIELDS = `
  _id,
  _type,
  title,
  "artist": coalesce(artist, []),
  "label": coalesce(label, []),
  price,
  stock,
  inStock,
  swellSlug,
  sku,
  featured,
  orderRank,
  "imageUrl": mainImage.asset->url + "?w=800&h=800&fit=fill&auto=format",
  "mainImage": {
    "asset": {
      "url": mainImage.asset->url,
      "metadata": mainImage.asset->metadata
    }
  },
  "productSlug": coalesce(swellSlug, slug.current, sku, _id)
`;

const MIXTAPE_FIELDS = `
  _id,
  _type,
  title,
  contributor,
  contributorString,
  "contributorData": contributorData->{
    _id,
    name,
    slug,
    image,
    featured,
    isActive,
    location
  },
  contributors[]->{
    _id,
    name,
    slug,
    image,
    featured,
    isActive,
    location
  },
  contributorNames,
  _contributorNames,
  "slug": slug,
  tracklist,
  "imageUrl": featuredImage.asset->url + "?w=800&h=800&fit=fill&auto=format",
  "featuredImage": {
    "asset": {
      "_id": featuredImage.asset._id,
      "url": featuredImage.asset->url,
      "metadata": featuredImage.asset->metadata
    },
    "alt": featuredImage.alt,
    "crop": featuredImage.crop,
    "hotspot": featuredImage.hotspot
  }
`;

export const searchProductsFast = async (params: SearchParams = {}) => {
  const startTime = Date.now();
  const { query, sort = 'latest-desc', limit = 48, page = 1, type = 'all' } = params;

  // Early return for empty queries
  if (!query?.trim()) {
    return getDefaultProducts(page, limit, startTime);
  }

  const cleanQuery = query.trim().replace(/['"]/g, '');
  const offset = (page - 1) * limit;

  try {
    console.log(`⚡ [DEBUG] Search params: type="${type}", sort="${sort}", query="${cleanQuery}"`);

    // Build search conditions efficiently
    const searchConditions = buildSearchConditions(cleanQuery);
    const typeFilter = getTypeFilter(type);

    // Determine if we want stock grouping
    // - ALL filter with default sort: YES
    // - Products filter with default sort: YES (same as ALL)
    // - Any other case: NO
    const useStockGrouping = (type === 'all' || type === 'products') && sort === 'latest-desc';
    console.log(`⚡ [DEBUG] UseStockGrouping: ${useStockGrouping}`);

    let sortOrder;

    if (useStockGrouping) {
      console.log(`⚡ [DEBUG] Using stock grouping with relevance priority`);
      // Only use relevance priority for ALL filter with default sort
      const relevancePriority = `
        select(
          _type == "product" && defined(stock) && stock > 0 && title match "*${cleanQuery}*" => "1_instock_title",
          _type == "product" && defined(stock) && stock > 0 && artist[] match "*${cleanQuery}*" => "1_instock_artist", 
          _type == "product" && defined(stock) && stock > 0 && label[] match "*${cleanQuery}*" => "1_instock_label",
          _type == "product" && defined(stock) && stock > 0 && (
            tracklist[].title match "*${cleanQuery}*" ||
            inMixtapes[].trackTitle match "*${cleanQuery}*" ||
            inMixtapes[].trackArtist match "*${cleanQuery}*"
          ) => "2_instock_tracklist",
          _type == "product" && defined(stock) && stock > 0 && description match "*${cleanQuery}*" => "3_instock_description",
          _type == "product" && defined(stock) && stock > 0 => "4_instock_other",
          _type == "mixtape" && (
            title match "*${cleanQuery}*" || 
            contributors[]->name match "*${cleanQuery}*" ||
            contributorNames match "*${cleanQuery}*" ||
            _contributorNames match "*${cleanQuery}*" ||
            contributor match "*${cleanQuery}*" ||
            contributorString match "*${cleanQuery}*" ||
            contributorData->name match "*${cleanQuery}*"
          ) => "5_mixtape_primary",
          _type == "mixtape" && (
            tracklist[].trackTitle match "*${cleanQuery}*" || 
            tracklist[].artist match "*${cleanQuery}*"
          ) => "6_mixtape_tracklist",
          _type == "product" && (!defined(stock) || stock <= 0) && title match "*${cleanQuery}*" => "7_outstock_title",
          _type == "product" && (!defined(stock) || stock <= 0) && artist[] match "*${cleanQuery}*" => "7_outstock_artist",
          _type == "product" && (!defined(stock) || stock <= 0) && label[] match "*${cleanQuery}*" => "7_outstock_label",
          _type == "product" && (!defined(stock) || stock <= 0) && (
            tracklist[].title match "*${cleanQuery}*" ||
            inMixtapes[].trackTitle match "*${cleanQuery}*" ||
            inMixtapes[].trackArtist match "*${cleanQuery}*"
          ) => "8_outstock_tracklist",
          _type == "product" && (!defined(stock) || stock <= 0) && description match "*${cleanQuery}*" => "9_outstock_description",
          _type == "product" && (!defined(stock) || stock <= 0) => "10_outstock_other",
          _type == "mixtape" => "11_mixtape_other",
          "12_other"
        ) asc,
      `;

      sortOrder = `${relevancePriority} select(defined(stock) && stock > 0 => "0_" + orderRank, "1_" + orderRank) asc`;
    } else {
      console.log(`⚡ [DEBUG] Using simple sorting WITHOUT stock grouping`);
      // For all other cases, use simple sorting without any stock grouping or relevance priority
      switch (sort) {
        case 'price-asc':
          sortOrder = `price asc, title asc`;
          break;
        case 'price-desc':
          sortOrder = `price desc, title asc`;
          break;
        case 'artist-asc':
          sortOrder = `artist[0] asc, title asc`;
          break;
        case 'artist-desc':
          sortOrder = `artist[0] desc, title asc`;
          break;
        case 'title-asc':
          sortOrder = `title asc`;
          break;
        case 'title-desc':
          sortOrder = `title desc`;
          break;
        default:
          sortOrder = `orderRank asc`;
      }
    }

    console.log(`⚡ [DEBUG] Final sort order: ${sortOrder}`);

    // Execute parallel queries for better performance
    const [results, counts] = await Promise.all([
      // Main search query
      sanityClient.fetch(`
        *[${searchConditions}${typeFilter}]
        | order(${sortOrder}) [${offset}...${offset + limit}] {
          ${getFieldsForType(type)}
        }
      `),

      // Count queries in parallel - always get all counts
      Promise.all([
        sanityClient.fetch(`count(*[${searchConditions}${typeFilter}])`), // Current filter total
        sanityClient.fetch(`count(*[${searchConditions} && _type == "product"])`), // All products
        sanityClient.fetch(`count(*[${searchConditions} && _type == "mixtape"])`) // All mixtapes
      ])
    ]);

    const [currentFilterTotal, productsCount, mixtapesCount] = counts;

    // Use the appropriate total for pagination based on current filter
    let paginationTotal = currentFilterTotal;
    let returnProductsTotal = productsCount;
    let returnMixtapesTotal = mixtapesCount;

    // For specific type filters, adjust the totals
    if (type === 'products') {
      paginationTotal = productsCount;
      returnMixtapesTotal = mixtapesCount; // Keep original for UI decisions
    } else if (type === 'mixtapes') {
      paginationTotal = mixtapesCount;
      returnProductsTotal = productsCount; // Keep original for UI decisions
    }

    const totalPages = Math.ceil(paginationTotal / limit);

    console.log(
      `⚡ Search: ${
        results?.length || 0
      } items, Type: ${type}, Total: ${paginationTotal}, Pages: ${totalPages}`
    );

    return {
      products: results || [],
      total: paginationTotal, // This drives pagination
      productsTotal: returnProductsTotal,
      mixtapesTotal: returnMixtapesTotal,
      allTotal: productsCount + mixtapesCount,
      page,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
      searchTime: Date.now() - startTime
    };
  } catch (error) {
    console.error('❌ Search error:', error);
    return getEmptyResult(startTime);
  }
};

// Helper functions for cleaner code
function buildSearchConditions(cleanQuery: string): string {
  // Build the full base filter matching the original exactly
  const baseFilter = `(
    (_type == "product" && !(_id in path("drafts.**")) && defined(swellProductId) && 
      !(title match "*lot*") &&
      (
        (defined(stock) && stock > 0) ||
        ((!defined(stock) || stock <= 0) && defined(mainImage.asset))
      )
    ) ||
    (_type == "mixtape" && !(_id in path("drafts.**")) && defined(featuredImage.asset) &&
      archived != true &&
      !(contributor match "*butter*") &&
      !(contributorString match "*butter*") &&
      !(contributorData->name match "*butter*") &&
      !(contributors[]->name match "*butter*") &&
      !(contributorNames match "*butter*") &&
      !(_contributorNames match "*butter*") &&
      !(contributor match "*Lincoln Otoni*") &&
      !(contributorString match "*Lincoln Otoni*") &&
      !(contributorData->name match "*Lincoln Otoni*") &&
      !(contributors[]->name match "*Lincoln Otoni*") &&
      !(contributorNames match "*Lincoln Otoni*") &&
      !(_contributorNames match "*Lincoln Otoni*")
    )
  )`;

  // Build search filter matching the original exactly
  const isMultiWord = cleanQuery.includes(' ');
  let searchFilter;

  if (isMultiWord) {
    searchFilter = `(
      (_type == "product" && (
        title match "*${cleanQuery}*" || 
        artist[] match "*${cleanQuery}*" || 
        description match "*${cleanQuery}*" || 
        tracklist[].title match "*${cleanQuery}*" ||
        inMixtapes[].trackTitle match "*${cleanQuery}*" ||
        inMixtapes[].trackArtist match "*${cleanQuery}*"
      )) ||
      (_type == "mixtape" && (
        title match "*${cleanQuery}*" || 
        contributor match "*${cleanQuery}*" || 
        contributorString match "*${cleanQuery}*" ||
        contributorData->name match "*${cleanQuery}*" ||
        contributors[]->name match "*${cleanQuery}*" ||
        contributorNames match "*${cleanQuery}*" ||
        _contributorNames match "*${cleanQuery}*" ||
        tracklist[].trackTitle match "*${cleanQuery}*" || 
        tracklist[].artist match "*${cleanQuery}*"
      ))
    )`;
  } else {
    searchFilter = `(
      (_type == "product" && (
        title match "*${cleanQuery}*" || 
        artist[] match "*${cleanQuery}*" || 
        label[] match "*${cleanQuery}*" || 
        sku match "*${cleanQuery}*" || 
        description match "*${cleanQuery}*" || 
        tracklist[].title match "*${cleanQuery}*" ||
        inMixtapes[].trackTitle match "*${cleanQuery}*" ||
        inMixtapes[].trackArtist match "*${cleanQuery}*"
      )) ||
      (_type == "mixtape" && (
        title match "*${cleanQuery}*" || 
        contributor match "*${cleanQuery}*" || 
        contributorString match "*${cleanQuery}*" ||
        contributorData->name match "*${cleanQuery}*" ||
        contributors[]->name match "*${cleanQuery}*" ||
        contributorNames match "*${cleanQuery}*" ||
        _contributorNames match "*${cleanQuery}*" ||
        tracklist[].trackTitle match "*${cleanQuery}*" || 
        tracklist[].artist match "*${cleanQuery}*"
      ))
    )`;
  }

  return `${baseFilter} && ${searchFilter}`;
}

function getTypeFilter(type: string): string {
  switch (type) {
    case 'products':
      return ' && _type == "product"';
    case 'mixtapes':
      return ' && _type == "mixtape"';
    default:
      return '';
  }
}

function getFieldsForType(type: string): string {
  switch (type) {
    case 'products':
      return PRODUCT_FIELDS;
    case 'mixtapes':
      return MIXTAPE_FIELDS;
    default:
      // For 'all' type, return combined fields with proper image handling
      return `
        _id,
        _type,
        title,
        "artist": coalesce(artist, []),
        "label": coalesce(label, []),
        price,
        stock,
        inStock,
        swellSlug,
        sku,
        featured,
        orderRank,
        contributor,
        contributorString,
        "contributorData": contributorData->{
          _id,
          name,
          slug,
          image,
          featured,
          isActive,
          location
        },
        contributors[]->{
          _id,
          name,
          slug,
          image,
          featured,
          isActive,
          location
        },
        contributorNames,
        _contributorNames,
        tracklist,
        "slug": slug,
        "imageUrl": select(
          _type == "product" => mainImage.asset->url + "?w=800&h=800&fit=fill&auto=format", 
          _type == "mixtape" => featuredImage.asset->url + "?w=800&h=800&fit=fill&auto=format",
          null
        ),
        "mainImage": select(
          _type == "product" => {
            "asset": {
              "url": mainImage.asset->url,
              "metadata": mainImage.asset->metadata
            }
          },
          null
        ),
        "featuredImage": select(
          _type == "mixtape" => {
            "asset": {
              "_id": featuredImage.asset._id,
              "url": featuredImage.asset->url,
              "metadata": featuredImage.asset->metadata
            },
            "alt": featuredImage.alt,
            "crop": featuredImage.crop,
            "hotspot": featuredImage.hotspot
          },
          null
        ),
        "productSlug": coalesce(swellSlug, slug.current, sku, _id)
      `;
  }
}

async function getDefaultProducts(page: number, limit: number, startTime: number) {
  const offset = (page - 1) * limit;

  try {
    const [products, totalCount] = await Promise.all([
      sanityClient.fetch(`
        *[${BASE_PRODUCT_FILTER} && (
          (defined(stock) && stock > 0) ||
          (!defined(stock) || stock <= 0) && defined(mainImage.asset)
        )] 
        | order(select(defined(stock) && stock > 0 => 1, 0) desc, menuOrder asc) [${offset}...${
          offset + limit
        }] {
          ${PRODUCT_FIELDS}
        }
      `),
      sanityClient.fetch(`
        count(*[${BASE_PRODUCT_FILTER} && (
          (defined(stock) && stock > 0) ||
          (!defined(stock) || stock <= 0) && defined(mainImage.asset)
        )])
      `)
    ]);

    return {
      products: products || [],
      total: totalCount || 0,
      productsTotal: totalCount || 0,
      mixtapesTotal: 0,
      allTotal: totalCount || 0,
      page,
      totalPages: Math.ceil((totalCount || 0) / limit),
      hasNextPage: page * limit < (totalCount || 0),
      hasPreviousPage: page > 1,
      searchTime: Date.now() - startTime
    };
  } catch (error) {
    console.error('❌ Default products error:', error);
    return getEmptyResult(startTime);
  }
}

function getEmptyResult(startTime: number) {
  return {
    products: [],
    total: 0,
    productsTotal: 0,
    mixtapesTotal: 0,
    allTotal: 0,
    page: 1,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
    searchTime: Date.now() - startTime
  };
}

// Legacy function compatibility
export const searchProductsWithReset = async (params: any = {}) => {
  return await searchProductsFast({ ...params, type: 'all' });
};

export async function searchProductsFast_old(queryParam: string | any, options: any = {}) {
  const query = typeof queryParam === 'object' ? queryParam?.query : queryParam;
  if (!query) return [];

  const result = await searchProductsFast({
    query,
    type: 'products',
    limit: options.limit || 20
  });
  return result.products;
}

export async function searchMixtapesFast(queryParam: string | any, options: any = {}) {
  const query = typeof queryParam === 'object' ? queryParam?.query : queryParam;
  if (!query) return [];

  const result = await searchProductsFast({
    query,
    type: 'mixtapes',
    limit: options.limit || 20
  });
  return result.products;
}

export async function searchAll(queryParam: string | any, options: any = {}) {
  const query = typeof queryParam === 'object' ? queryParam?.query : queryParam;
  if (!query) return { products: [], mixtapes: [] };

  const result = await searchProductsFast({
    query,
    type: 'all',
    limit: options.limit || 20
  });

  const products = result.products.filter((item: SearchResult) => item._type === 'product');
  const mixtapes = result.products.filter((item: SearchResult) => item._type === 'mixtape');

  return { products, mixtapes };
}
