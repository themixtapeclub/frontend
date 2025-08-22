// lib/data/products/constants.ts

export const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const BASE_PRODUCT_FILTER = '_type == "product" && !(_id in path("drafts.**"))';

export const BASE_PRODUCT_FILTER_WITH_IMAGE =
  '_type == "product" && !(_id in path("drafts.**")) && defined(mainImage.asset)';

export const PRODUCT_QUERY_FIELDS = `
  _id,
  title,
  price,
  stock,
  inStock,
  swellProductId,
  swellSlug,
  slug,
  description,
  shortDescription,
  swellCurrency,
  swellPrice,
  artist,
  label,
  format,
  genre,
  week,
  category,
  country,
  released,
  catalog,
  tags,
  mainImage{
    asset->{
      _id,
      url,
      metadata{
        lqip,
        dimensions{
          width,
          height
        }
      }
    },
    alt,
    caption
  },
  additionalImages[]{
    _key,
    _type,
    asset->{
      _id,
      _ref,
      url,
      metadata{
        lqip,
        dimensions{
          width,
          height
        }
      }
    },
    alt,
    caption
  },
  "imageUrl": coalesce(mainImage.asset->url, "/placeholder.jpg"),
  menuOrder,
  orderRank,
  _createdAt,
  featured,
  gallery[]{
    asset->{
      _id,
      url,
      metadata{
        lqip,
        dimensions{
          width,
          height
        }
      }
    },
    alt,
    caption
  },
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
  inMixtapes[]{
    _key,
    mixtape->{
      _id,
      title,
      slug,
      featuredImage{
        asset->{
          url,
          metadata{
            lqip,
            dimensions{
              width,
              height
            }
          }
        }
      },
      mixcloudUrl,
      publishedAt,
      contributors[]->{
        _id,
        name,
        slug
      },
      contributorNames,
      _contributorNames,
      artist
    },
    trackTitle,
    trackArtist,
    artist,
    publishedAt
  },
  discogsReleaseId
`;

export const FAST_QUERY_FIELDS = `
  _id,
  title,
  price,
  stock,
  swellProductId,
  swellSlug,
  sku,
  description,
  shortDescription,
  swellCurrency,
  swellPrice,
  artist,
  label,
  format,
  genre,
  week,
  category,
  country,
  released,
  catalog,
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
  tracklistEnhanced,
  tracklistLastUpdated,
  tags,
  mainImage{
    asset->{
      _id,
      url,
      metadata{
        lqip,
        dimensions{
          width,
          height
        }
      }
    },
    alt,
    caption  
  },
  "imageUrl": coalesce(mainImage.asset->url, "/placeholder.jpg"),
  menuOrder,
  orderRank,
  featured,
  inStock,
  discogsReleaseId  
`;

export const DEFAULT_LIMITS = {
  FEATURED: 10,
  NEW_PRODUCTS: 12,
  SEARCH: 20,
  MAX_WEEKS: 8,
  MAX_PAGES: 20
} as const;

export const SWELL_CONCURRENCY_LIMIT = 5;
