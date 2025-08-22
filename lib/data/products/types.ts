// lib/data/products/types.ts - Add this to your MergedProduct interface

export interface SanityProduct {
  _id: string;
  _createdAt: string;
  title: string;
  artist?: string[];
  label?: string[];
  genre?: Array<{ main?: string; sub?: string } | string>;
  format?: Array<{ main?: string; sub?: string } | string>;
  tags?: string[];
  price?: number;
  swellProductId?: string;
  swellSlug?: string;
  slug?: string;
  description?: string;
  shortDescription?: string;
  inStock?: boolean;
  stock?: number;
  swellCurrency?: string;
  menuOrder?: number;
  orderRank?: string;
  imageUrl?: string;
  hasImage?: boolean;
  featured?: boolean;
  mainImage?: {
    asset: {
      url: string;
      metadata?: {
        lqip?: string;
        dimensions?: {
          width: number;
          height: number;
        };
      };
    };
  };
}

// Swell product interface
export interface SwellProduct {
  id: string;
  slug: string;
  sku?: string;
  name: string;
  price: number;
  currency: string;
  description?: string;
  stock_level?: number;
  stock_purchasable?: boolean;
  stock_tracking?: boolean;
  images?: Array<{ file: { url: string }; caption?: string }>;
  variants?: { results?: Array<{ id: string; stock_level: number; stock_purchasable: boolean }> };
}

// Legacy SanityContent - keep for backward compatibility
export interface SanityContent extends SanityProduct {
  week: string[];
  category: string;
  country: string;
  released: string;
  catalog: string;
  additionalImages?: any[];
  gallery?: any[];
  tracklist?: Array<{
    _key?: string;
    _type?: string;
    title?: string;
    duration?: string;
    artist?: string;
    trackNumber?: number;
    audioUrl?: string;
    audioFilename?: string;
    audioFileSize?: number;
    audioMimeType?: string;
    storageProvider?: string;
    wordpressAttachmentId?: number;
  }>;
  inMixtapes?: Array<{
    _key?: string;
    mixtape?: {
      _id?: string;
      _ref?: string;
      title?: string;
      slug?: { current: string };
      featuredImage?: any;
      mixcloudUrl?: string;
      publishedAt?: string;
      contributors?: Array<{ _id: string; name: string; slug?: { current: string } }>;
      contributorNames?: string;
      _contributorNames?: string;
      artist?: string;
    };
    trackTitle: string;
    trackArtist?: string;
    artist?: string;
    publishedAt?: string;
  }>;
  discogsReleaseId?: number;
}

// Merged product interface
export interface MergedProduct {
  id: string;
  _id?: string;
  slug: string;
  sku: string;
  name: string;
  price: number;
  currency: string;
  description: string;
  shortDescription?: string;
  stock_level: number;
  stock_purchasable: boolean;
  stock_tracking: boolean;
  featured?: boolean;
  sanityContent?: SanityContent;
  title?: string;
  artist?: string | string[];
  label?: string | string[];
  format?: string | string[];
  week?: string;
  category?: string;
  genre?: string | string[];
  country?: string;
  released?: string;
  catalog?: string;
  orderRank?: string;
  menuOrder?: number;
  mainImage?: any;
  additionalImages?: any[];
  gallery?: any[];
  images?: Array<{ file?: { url?: string }; caption?: string }>;
  tracklist?: Array<{
    _key?: string;
    _type?: string;
    title?: string;
    duration?: string;
    artist?: string;
    trackNumber?: number;
    audioUrl?: string;
    audioFilename?: string;
    audioFileSize?: number;
    audioMimeType?: string;
    storageProvider?: string;
    wordpressAttachmentId?: number;
  }>;
  inMixtapes?: Array<any>;
  tags?: string[];
  imageUrl?: string;
  productSlug?: string;
  swellProductId?: string;
  variants?: any;
}

// Products with breakdown
export interface ProductsWithBreakdown {
  products: MergedProduct[];
  weeksUsed: string[];
  weekBreakdown: { [week: string]: number };
}

// Archive and query types
export type ArchiveType = 'artist' | 'label' | 'genre' | 'format' | 'week' | 'tag';

export interface ProductQueryOptions {
  page?: number;
  limit?: number;
  includeOutOfStock?: boolean;
}

export interface ProductSearchResult {
  products: MergedProduct[];
  total: number;
  pages: number;
  currentPage: number;
  actualName?: string;
  featuredProducts?: MergedProduct[];
  showFeatured?: boolean;
}

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

// From core/types.ts - keep for homepage
export interface Feature {
  _id: string;
  title: string;
  text?: string;
  slug: {
    current: string;
  };
  image?: {
    asset: {
      url: string;
    };
    alt?: string;
  };
  reference?: {
    _type: 'product' | 'mixtape';
    _id: string;
    title: string;
    slug?: {
      current: string;
    };
    sku?: string;
    price?: number;
    swellSlug?: string;
    mixcloudUrl?: string;
  };
  externalUrl?: string;
  published: boolean;
  publishedAt?: string;
  orderRank?: string;
}

// Additional types from core/types.ts
export interface FormattedProduct {
  id: string;
  name: string;
  title: string;
  price: number;
  currency: string;
  handle: string;
  slug: string;
  description: string;
  images: Array<{
    id: string;
    file: { url: string; width: number; height: number };
    src: string;
  }>;
  stockTracking: boolean;
  stockPurchasable: boolean;
  content: {
    artist: string;
    label: string;
    genre: string;
    format: string;
  };
  tags: string[];
  _sanityId: string;
  menuOrder?: number;
  orderRank?: string;
  _createdAt: string;
  artist?: string | string[];
  label?: string | string[];
  format?: string | string[];
  mainImage?: {
    asset: {
      url: string;
      metadata?: {
        lqip?: string;
        dimensions?: {
          width: number;
          height: number;
        };
      };
    };
  };
}

export interface ProductResult {
  products: FormattedProduct[];
  total: number;
  pages: number;
  currentPage: number;
  error?: string;
  debugArtists?: any[];
  actualName?: string;
}

export interface FieldValue {
  value: string;
  slug: string;
  count?: number;
}

export interface ArchiveConfig {
  type: 'artist' | 'label' | 'genre' | 'format';
  getProductsFunction: (slug: string, page: number, sort: string) => Promise<ProductResult>;
  pluralName: string;
  singularName: string;
  collectionTitle: string;
  breadcrumbPath: string;
  basePath: string;
  schemaType: string;
  bgColor?: string;
}

export type SortOption =
  | 'menuOrder'
  | 'date_created:desc'
  | 'date_created:asc'
  | 'price:asc'
  | 'price:desc'
  | 'name:asc';

export type ProductField = 'genre' | 'artist' | 'label' | 'format';
