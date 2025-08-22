// lib/queries/sanity/index.ts
// Main barrel file for all Sanity queries

// Core exports
export {
  CACHE_TIMES,
  PerformanceBaseline,
  sanityClient,
  sanityFetch,
  urlFor,
  withPerformanceMonitoring
} from './core/client';
export {
  BASE_PRODUCT_FILTER,
  getSortClause,
  MINIMAL_PRODUCT_FIELDS,
  PRODUCT_QUERY_FIELDS
} from './core/constants';
export type {
  ArchiveConfig,
  Feature,
  FieldValue,
  FormattedProduct,
  ProductField,
  ProductResult,
  SanityProduct,
  SortOption
} from '../../data/products/types';

// Product exports
export {
  getProductsByArtist,
  getProductsByFormat,
  getProductsByGenre,
  getProductsByLabel
} from './products/archive';
export {
  getAllArtists,
  getAllFormats,
  getAllGenres,
  getAllLabels,
  testSanityConnection
} from './products/utils';

// Content exports
export { getFeatureLink, getFeatures } from './features';

// Mixtape exports
export { MIXTAPE_QUERIES } from './mixtapes/queries';

// Import sanityClient for the new function
import { sanityClient } from './core/client';

// Individual product content function
export async function getSanityProductContent(productId: string) {
  const query = `*[_type == "product" && !(_id in path("drafts.**")) && _id == $productId][0]{
    _id,
    title,
    description,
    price,
    sku,
    swellSlug,
    swellProductId,
    mainImage {
      asset -> {
        _id,
        url,
        metadata {
          lqip,
          dimensions {
            width,
            height
          }
        }
      },
      alt
    },
    artist,
    label,
    format,
    genre,
    releaseDate,
    inStock,
    stockCount
  }`;

  return await sanityClient.fetch(query, { productId });
}
export * from './layout/submenu';
