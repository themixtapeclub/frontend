// lib/queries/sanity/core/constants.ts
// Shared query fragments, filters, and constants with consistent draft exclusion - UPDATED for multiple contributors

// Standard draft exclusion filter - use this consistently across all queries
export const DRAFT_EXCLUSION = `!(_id in path("drafts.**"))`;

// Base product filter that excludes drafts
export const BASE_PRODUCT_FILTER = `_type == "product" && 
  ${DRAFT_EXCLUSION} &&
  defined(swellProductId) && 
  defined(mainImage.asset->url)`;

// Base mixtape filter that excludes drafts AND butter AND Lincoln Otoni contributors
export const BASE_MIXTAPE_FILTER = `_type == "mixtape" && 
  ${DRAFT_EXCLUSION} && 
  defined(slug.current) &&
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
  !(_contributorNames match "*Lincoln Otoni*")`;

// Base feature filter that excludes drafts
export const BASE_FEATURE_FILTER = `_type == "feature" && 
  ${DRAFT_EXCLUSION} && 
  published == true && 
  defined(image.asset->url)`;

// Standard product query fields
export const PRODUCT_QUERY_FIELDS = `
  _id,
  _createdAt,
  title,
  artist,
  label,
  genre,
  format,
  tags,
  price,
  swellProductId,
  swellSlug,
  slug,
  description,
  shortDescription,
  inStock,
  swellCurrency,
  menuOrder,
  orderRank,
  "imageUrl": mainImage.asset->url + "?w=800&h=800&fit=fill&auto=format",
  "mainImage": {
    "asset": {
      "url": mainImage.asset->url,
      "metadata": mainImage.asset->metadata
    }
  },
  "hasImage": defined(mainImage.asset->url)
`;

// Related product fields for complex queries
export const RELATED_PRODUCT_FIELDS = `
  ${PRODUCT_QUERY_FIELDS},
  "slug": coalesce(swellSlug, slug.current, sku, _id),
  tracklist[] {
    _key,
    title,
    artist,
    productId
  },
  inMixtapes[] {
    _key,
    trackTitle,
    trackArtist,
    mixtapeId
  }
`;

// Minimal product fields for fast queries
export const MINIMAL_PRODUCT_FIELDS = `
  _id,
  title,
  swellSlug,
  sku,
  artist,
  label,
  format,
  category,
  genre,
  orderRank,
  price,
  stock,
  featured,
  tags,
  "imageUrl": mainImage.asset->url + "?w=800&h=800&fit=fill&auto=format",
  "mainImage": {
    "asset": {
      "url": mainImage.asset->url,
      "metadata": mainImage.asset->metadata
    }
  }
`;

// Image fragment for reuse
export const IMAGE_FRAGMENT = `
  asset-> {
    _id,
    url,
    metadata {
      lqip,
      palette,
      dimensions { width, height, aspectRatio }
    }
  },
  alt,
  crop,
  hotspot
`;

// UPDATED: MIXTAPE_CARD_FRAGMENT with new contributor structure
export const MIXTAPE_CARD_FRAGMENT = `
  _id,
  title,
  slug { current },
  featuredImage {
    ${IMAGE_FRAGMENT}
  },
  mixcloudUrl,
  publishedAt,
  modifiedAt,
  contributors[]->{
    _id,
    name,
    slug,
    featured,
    archived,
    location,
    image {
      ${IMAGE_FRAGMENT}
    }
  },
  contributorNames,
  _contributorNames,
  tracklist,
  tags,
  menuOrder,
  orderRank,
  featured
`;

export const MIXTAPE_FULL_FRAGMENT = `
  ${MIXTAPE_CARD_FRAGMENT},
  description,
  duration,
  genre,
  credits,
  tracklist[] {
    _key,
    trackTitle,
    artist,
    productId,
    wpProductId,
    "productRef": product._ref
  }
`;

// Helper function to get sort clause
export function getSortClause(sort: string): string {
  switch (sort) {
    case 'menuOrder':
    case 'menu_order:asc':
      return 'order(menuOrder asc, _createdAt desc)';
    case 'date_created:desc':
      return 'order(_createdAt desc)';
    case 'date_created:asc':
      return 'order(_createdAt asc)';
    case 'price:asc':
      return 'order(price asc)';
    case 'price:desc':
      return 'order(price desc)';
    case 'name:asc':
      return 'order(title asc)';
    case 'orderRank':
    case 'orderRank:asc':
      return 'order(orderRank asc)';
    default:
      return 'order(menuOrder asc, _createdAt desc)';
  }
}

// Base mixtape query builder
export function createBaseMixtapeQuery(
  filter: string = '',
  sort: string = '_createdAt desc'
): string {
  const fullFilter = filter ? `${BASE_MIXTAPE_FILTER} && ${filter}` : BASE_MIXTAPE_FILTER;
  return `*[${fullFilter}] | order(${sort})`;
}

// Validation queries to test draft exclusion
export const DRAFT_VALIDATION_QUERIES = {
  // Count all draft products
  countDraftProducts: () => `count(*[_type == "product" && _id in path("drafts.**")])`,

  // Count all draft mixtapes
  countDraftMixtapes: () => `count(*[_type == "mixtape" && _id in path("drafts.**")])`,

  // Count all draft features
  countDraftFeatures: () => `count(*[_type == "feature" && _id in path("drafts.**")])`,

  // List some draft IDs for inspection
  listDraftIds: () => `*[_id in path("drafts.**")] { _id, _type, title }[0...10]`,

  // Test your product filter
  testProductFilter: () => `count(*[${BASE_PRODUCT_FILTER}])`,

  // Test your mixtape filter
  testMixtapeFilter: () => `count(*[${BASE_MIXTAPE_FILTER}])`,

  // Test your feature filter
  testFeatureFilter: () => `count(*[${BASE_FEATURE_FILTER}])`
};

// UPDATED: Helper function to extract contributor info from new structure
export function getContributorInfo(mixtape: any): {
  name: string | null;
  slug: string | null;
  shouldShow: boolean;
  contributors: any[];
  primaryContributor: any | null;
} {
  // Priority 1: New contributors array (populated references)
  if (mixtape.contributors && mixtape.contributors.length > 0) {
    const activeContributors = mixtape.contributors.filter((c: any) => c && c.name);
    const primaryContributor = activeContributors[0] || null;

    return {
      name: primaryContributor?.name || null,
      slug: primaryContributor?.slug?.current || null,
      shouldShow: true,
      contributors: activeContributors,
      primaryContributor
    };
  }

  // Priority 2: contributorNames string (fallback display name)
  if (mixtape.contributorNames) {
    return {
      name: mixtape.contributorNames,
      slug: null,
      shouldShow: true,
      contributors: [],
      primaryContributor: null
    };
  }

  // Priority 3: _contributorNames (internal field)
  if (mixtape._contributorNames) {
    return {
      name: mixtape._contributorNames,
      slug: null,
      shouldShow: true,
      contributors: [],
      primaryContributor: null
    };
  }

  return {
    name: null,
    slug: null,
    shouldShow: false,
    contributors: [],
    primaryContributor: null
  };
}

// Helper function to format multiple contributors for display
export function formatContributorNames(contributors: any[]): string {
  if (!contributors || contributors.length === 0) return '';

  const names = contributors.map((c) => c.name).filter(Boolean);

  if (names.length === 0) return '';
  if (names.length === 1) return names[0];
  if (names.length === 2) return names.join(' & ');

  const allButLast = names.slice(0, -1);
  const last = names[names.length - 1];
  return allButLast.join(', ') + ' & ' + last;
}
