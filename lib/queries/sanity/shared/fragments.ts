// lib/queries/sanity/shared/fragments.ts - Updated for multiple contributors

// Base image fragment with LQIP support
export const imageFragment = `
  asset->{
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
  alt,
  crop,
  hotspot
`;

// Enhanced image fragment with optimization
export const optimizedImageFragment = `
  asset->{
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
  alt,
  crop,
  hotspot
`;

// FIXED: Since your data is stored as objects, not references, we don't use ->
export const objectBasedFieldsFragment = `
  artist,
  label,
  genre,
  format,
  category
`;

// Tracklist fragment with all audio fields + Discogs enhancement fields
export const tracklistFragment = `
  tracklist[]{
    _key,
    _type,
    title,
    duration,
    artist,
    trackNumber,
    audioUrl,
    audioFilename,
    audioFileSize,
    audioMimeType,
    storageProvider,
    wordpressAttachmentId
  },
  discogsReleaseId,
  tracklistEnhanced,
  tracklistLastUpdated
`;

// Core product fields (most common)
export const coreProductFields = `
  _id,
  _createdAt,
  _updatedAt,
  title,
  artist,
  label,
  format,
  genre,
  tags,
  price,
  stock,
  stockLevel,
  inStock,
  swellProductId,
  swellSlug,
  sku,
  orderRank,
  menuOrder,
  featured
`;

// Main image with optimization
export const mainImageWithOptimization = `
  mainImage {
    ${imageFragment}
  },
  "imageUrl": mainImage.asset->url + "?w=800&h=800&fit=fill&auto=format",
  "imageAlt": mainImage.alt,
  "imageLqip": mainImage.asset->metadata.lqip,
  "imageDimensions": mainImage.asset->metadata.dimensions
`;

// Additional images fragment
export const additionalImagesFragment = `
  additionalImages[] {
    _key,
    _type,
    ${imageFragment}
  }
`;

// UPDATED: Complete product fields without reference expansion
export const PRODUCT_QUERY_FIELDS = `
  ${coreProductFields},
  week,
  category,
  country,
  released,
  description,
  catalog,
  discogsReleaseId,
  tracklistEnhanced,
  tracklistLastUpdated,
  ${mainImageWithOptimization},
  ${additionalImagesFragment},
  ${tracklistFragment}
`;

// UPDATED: Minimal product fields
export const MINIMAL_PRODUCT_FIELDS = `
  ${coreProductFields},
  category,
  discogsReleaseId,
  tracklistEnhanced,
  ${mainImageWithOptimization},
  ${additionalImagesFragment},
  ${tracklistFragment}
`;

// UPDATED: Related products specific fields
export const RELATED_PRODUCT_FIELDS = `
  ${coreProductFields},
  discogsReleaseId,
  tracklistEnhanced,
  tracklistLastUpdated,
  "slug": coalesce(swellSlug, slug.current, swellProductId),
  "imageUrl": mainImage.asset->url + "?w=800&h=800&fit=fill&auto=format",
  "hasImage": defined(mainImage.asset->url),
  "lqipData": mainImage.asset->metadata.lqip,
  "imageWidth": mainImage.asset->metadata.dimensions.width,
  "imageHeight": mainImage.asset->metadata.dimensions.height,
  ${additionalImagesFragment},
  ${tracklistFragment}
`;

// UPDATED: Archive page fields
export const ARCHIVE_PRODUCT_FIELDS = `
  ${coreProductFields},
  week,
  description,
  discogsReleaseId,
  tracklistEnhanced,
  ${mainImageWithOptimization},
  ${additionalImagesFragment},
  ${tracklistFragment}
`;

// UPDATED: Product fragment for mixtape tracklist references
export const productReferenceFragment = `
  _id,
  title,
  sku,
  slug,
  swellSlug,  
  swellProductId,
  price,
  stock,
  artist,
  label,
  tags,
  discogsReleaseId,
  tracklistEnhanced,
  ${mainImageWithOptimization},
  ${additionalImagesFragment},
  ${tracklistFragment}
`;

// Base product filter (excludes drafts, requires image and stock)
export const BASE_PRODUCT_FILTER = `_type == "product" && 
  !(_id in path("drafts.**")) &&
  defined(swellProductId) && 
  defined(mainImage.asset->url)`;

// In-stock product filter
export const IN_STOCK_PRODUCT_FILTER = `${BASE_PRODUCT_FILTER} && 
  (stock > 0 || stockLevel > 0)`;

// UPDATED: Mixtape tracklist fragment with new contributor structure
export const mixtapeTracklistFragment = `
  tracklist[]{
    _key,
    trackTitle,
    artist,
    location,
    productId,
    wpProductId,
    "productRef": product._ref,
    // Try to resolve product reference by Sanity ID first
    "product": product-> {
      ${productReferenceFragment}
    },
    // Fallback lookup by SKU if _ref looks like a SKU
    "productBySku": *[_type == "product" && !(_id in path("drafts.**")) && sku == ^.product._ref][0] {
      ${productReferenceFragment}
    },
    // Fallback lookup by wpProductId
    "productByWpId": *[_type == "product" && !(_id in path("drafts.**")) && wpProductId == ^.wpProductId][0] {
      ${productReferenceFragment}
    }
  }
`;

// UPDATED: Use new multiple contributors structure
export const mixtapeBaseFields = `
  _id,
  title,
  description,
  featuredImage {
    ${imageFragment}
  },
  contributors[]->{
    _id,
    name,
    slug,
    featured,
    archived,
    location,
    image {
      ${imageFragment}
    }
  },
  contributorNames,
  _contributorNames,
  releaseDate,
  duration,
  ${mixtapeTracklistFragment},
  tracklistText,
  slug {
    current
  },
  genre,
  featured,
  orderRank,
  menuOrder,
  _createdAt
`;

// UPDATED: InMixtapes fragment with new contributor structure
export const inMixtapesFragment = `
  inMixtapes[]{
    _key,
    _type,
    mixtape->{
      _id,
      title,
      slug { current },
      featuredImage {
        ${imageFragment}
      },
      mixcloudUrl,
      publishedAt,
      contributors[]->{
        _id,
        name,
        slug,
        featured,
        archived,
        location,
        image {
          ${imageFragment}
        }
      },
      contributorNames,
      _contributorNames
    },
    trackTitle,
    trackArtist,
    publishedAt
  }
`;

// NEW: Complete product fields for single product pages
export const DETAILED_PRODUCT_FIELDS = `
  ${PRODUCT_QUERY_FIELDS},
  ${inMixtapesFragment}
`;

// Helper function to extract contributor info from new structure
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
export { imageFragment as IMAGE_FRAGMENT };
