// lib/queries/sanity/products/archive.ts
import { ARCHIVE_PRODUCT_FIELDS } from '../shared/fragments';

const BASE_PRODUCT_FILTER = '_type == "product" && !(_id in path("drafts.**"))';
const PRODUCT_QUERY_FIELDS = ARCHIVE_PRODUCT_FIELDS;

// Replace the interfaces section in lib/queries/sanity/products/archive.ts

interface SanityProduct {
  _id: string;
  _createdAt?: string;
  _updatedAt?: string;
  title?: string;
  artist?: any;
  label?: any;
  format?: any;
  genre?: any;
  tags?: string[];
  price?: number;
  stock?: number;
  stockLevel?: number;
  inStock?: boolean;
  swellProductId?: string;
  swellSlug?: string;
  sku?: string;
  orderRank?: string;
  menuOrder?: number;
  featured?: boolean;
  week?: any;
  description?: string;
  shortDescription?: string;
  swellCurrency?: string;
  slug?: string;
  // Enhanced fields from ARCHIVE_PRODUCT_FIELDS
  discogsReleaseId?: number;
  tracklistEnhanced?: boolean;
  tracklistLastUpdated?: string;
  // Main image fields
  mainImage?: {
    asset?: {
      _id: string;
      url: string;
      metadata?: {
        lqip?: string;
        dimensions?: {
          width: number;
          height: number;
        };
      };
    };
    alt?: string;
    crop?: any;
    hotspot?: any;
  };
  imageUrl?: string;
  imageAlt?: string;
  imageLqip?: string;
  imageDimensions?: {
    width: number;
    height: number;
  };
  // Additional images
  additionalImages?: Array<{
    _key: string;
    _type: string;
    asset?: {
      _id: string;
      url: string;
      metadata?: {
        lqip?: string;
        dimensions?: {
          width: number;
          height: number;
        };
      };
    };
    alt?: string;
    crop?: any;
    hotspot?: any;
  }>;
  // Tracklist fields
  tracklist?: Array<{
    _key: string;
    _type: string;
    title?: string;
    duration?: string;
    artist?: string;
    trackNumber?: number;
    audioUrl?: string;
    audioFilename?: string;
    audioFileSize?: number;
    audioMimeType?: string;
    storageProvider?: string;
    wordpressAttachmentId?: string;
  }>;
}

interface FormattedProduct {
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
    file: {
      url: string;
      width: number;
      height: number;
    };
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
  artist?: any;
  label?: any;
  format?: string | string[];
  mainImage?: any;
  tags: string[];
  _sanityId: string;
  menuOrder?: number;
  orderRank?: string;
  _createdAt?: string;
  // Enhanced fields
  discogsReleaseId?: number;
  tracklistEnhanced?: boolean;
  tracklistLastUpdated?: string;
  tracklist?: Array<{
    _key: string;
    _type: string;
    title?: string;
    duration?: string;
    artist?: string;
    trackNumber?: number;
    audioUrl?: string;
    audioFilename?: string;
    audioFileSize?: number;
    audioMimeType?: string;
    storageProvider?: string;
    wordpressAttachmentId?: string;
  }>;
  sanityContent?: {
    _id: string;
    artist?: any;
    label?: any;
    format?: any;
    genre?: any;
    price?: number;
    stock?: number;
    discogsReleaseId?: number;
    tracklistEnhanced?: boolean;
    tracklistLastUpdated?: string;
    tracklist?: Array<{
      _key: string;
      _type: string;
      title?: string;
      duration?: string;
      artist?: string;
      trackNumber?: number;
      audioUrl?: string;
      audioFilename?: string;
      audioFileSize?: number;
      audioMimeType?: string;
      storageProvider?: string;
      wordpressAttachmentId?: string;
    }>;
    mainImage?: {
      asset?: {
        _id: string;
        url: string;
        metadata?: {
          lqip?: string;
          dimensions?: {
            width: number;
            height: number;
          };
        };
      };
      alt?: string;
      crop?: any;
      hotspot?: any;
    };
  };
}

interface ProductResult {
  products: FormattedProduct[];
  total: number;
  pages: number;
  currentPage: number;
  error?: string;
}

function formatDisplayName(slug: string): string {
  return slug.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
}

function generateSearchVariations(slug: string): string[] {
  const base = formatDisplayName(slug);
  return [base, slug, slug.replace(/-/g, ' ')];
}

function getSortClause(sort: string): string {
  switch (sort) {
    case 'price-asc':
      return 'order(price asc)';
    case 'price-desc':
      return 'order(price desc)';
    default:
      return 'order(coalesce(menuOrder, 99999) asc)';
  }
}

function formatProductForDisplay(product: SanityProduct): FormattedProduct {
  const processedArtist = Array.isArray(product.artist)
    ? product.artist.join(', ')
    : product.artist || '';

  const processedLabel = Array.isArray(product.label)
    ? product.label.join(', ')
    : product.label || '';

  const processedFormat = product.format
    ? Array.isArray(product.format)
      ? product.format
          .map((f: any) => (typeof f === 'object' && f?.main ? f.main : String(f)))
          .join(', ')
      : String(product.format)
    : '';

  const processedGenre = product.genre
    ? Array.isArray(product.genre)
      ? product.genre
          .map((g: any) => (typeof g === 'object' && g?.main ? g.main : String(g)))
          .join(', ')
      : String(product.genre)
    : '';

  // Handle format field properly for the return type
  let formatField: string | string[];
  if (Array.isArray(product.format)) {
    formatField = product.format.map((f: any) =>
      typeof f === 'object' && f?.main ? f.main : String(f)
    );
  } else if (product.format) {
    formatField = String(product.format);
  } else {
    formatField = '';
  }

  return {
    id: product.swellProductId || product._id,
    name: product.title || 'Untitled',
    title: product.title || 'Untitled',
    price: product.price || 0,
    currency: product.swellCurrency || 'USD',
    handle: product.swellSlug || product.slug || product.swellProductId || '',
    slug: product.swellSlug || product.slug || product.swellProductId || '',
    description: product.description || product.shortDescription || '',
    images: product.imageUrl
      ? [
          {
            id: '1',
            file: { url: product.imageUrl, width: 400, height: 400 },
            src: product.imageUrl
          }
        ]
      : [],
    stockTracking: false,
    stockPurchasable: product.inStock !== false,
    content: {
      artist: processedArtist,
      label: processedLabel,
      genre: processedGenre,
      format: processedFormat
    },
    artist: product.artist,
    label: product.label,
    format: formatField,
    mainImage: product.mainImage,
    tags: product.tags || [],
    _sanityId: product._id,
    menuOrder: product.menuOrder,
    orderRank: product.orderRank,
    _createdAt: product._createdAt,
    // Pass through the enhanced fields
    discogsReleaseId: product.discogsReleaseId,
    tracklistEnhanced: product.tracklistEnhanced,
    tracklistLastUpdated: product.tracklistLastUpdated,
    tracklist: product.tracklist,
    // Create sanityContent object for ProductCard compatibility
    sanityContent: {
      _id: product._id,
      artist: product.artist,
      label: product.label,
      format: product.format,
      genre: product.genre,
      price: product.price,
      stock: product.stock,
      discogsReleaseId: product.discogsReleaseId,
      tracklistEnhanced: product.tracklistEnhanced,
      tracklistLastUpdated: product.tracklistLastUpdated,
      tracklist: product.tracklist,
      mainImage: product.mainImage
    }
  };
}

async function getProductsByField(
  fieldName: 'artist' | 'label' | 'genre' | 'format',
  slug: string,
  page: number = 1,
  sort: string = 'menuOrder',
  limit: number = 40
): Promise<ProductResult> {
  try {
    const offset = (page - 1) * limit;
    const sortClause = getSortClause(sort);

    const filterConditions = buildFilterConditions(fieldName, slug);

    // Mock query for now
    const result = { products: [], total: 0 };

    if (fieldName === 'artist' && (!result.products || result.products.length === 0)) {
      return tryComplexArtistSearch(slug, page, sort, limit, offset, sortClause);
    }

    const products = (result.products || []).map(formatProductForDisplay);

    return {
      products,
      total: result.total || 0,
      pages: Math.ceil((result.total || 0) / limit),
      currentPage: page
    };
  } catch (error) {
    console.error(`❌ Error fetching products by ${fieldName}:`, error);
    return {
      products: [],
      total: 0,
      pages: 0,
      currentPage: page,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

function buildFilterConditions(fieldName: string, slug: string): string[] {
  const displayName = formatDisplayName(slug);
  const simpleName = slug.replace(/-/g, ' ');

  switch (fieldName) {
    case 'artist':
    case 'label':
      return [
        `"${displayName}" in ${fieldName}[]`,
        `"${simpleName}" in ${fieldName}[]`,
        `"${slug}" in ${fieldName}[]`
      ];

    case 'genre':
      const hyphenatedDisplayName = displayName.replace(/ /g, '-');
      const titleCaseHyphenated = slug
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join('-');

      return [
        `"${displayName}" in ${fieldName}[].main`,
        `"${simpleName}" in ${fieldName}[].main`,
        `"${hyphenatedDisplayName}" in ${fieldName}[].main`,
        `"${titleCaseHyphenated}" in ${fieldName}[].main`,
        `"${slug}" in ${fieldName}[].main`,
        `"${displayName}" in ${fieldName}[]`,
        `"${simpleName}" in ${fieldName}[]`,
        `"${hyphenatedDisplayName}" in ${fieldName}[]`,
        `"${titleCaseHyphenated}" in ${fieldName}[]`,
        `"${slug}" in ${fieldName}[]`
      ];

    case 'format':
      const conditions = [
        `$displayName in ${fieldName}[].main`,
        `$simpleName in ${fieldName}[].main`,
        `$displayName in ${fieldName}[]`,
        `$simpleName in ${fieldName}[]`
      ];

      conditions.push(
        `($vinylSize != "" && ${fieldName}[].main match "*" + $vinylSize)`,
        `($vinylSize != "" && ${fieldName}[] match "*" + $vinylSize)`
      );

      const lpConditionsMain = [];
      const lpConditionsArray = [];
      for (let i = 2; i <= 10; i++) {
        lpConditionsMain.push(`"${i}xLP" in ${fieldName}[].main`);
        lpConditionsArray.push(`"${i}xLP" in ${fieldName}[]`);
      }
      conditions.push(
        `($isLP && (${lpConditionsMain.join(' || ')}))`,
        `($isLP && (${lpConditionsArray.join(' || ')}))`
      );

      return conditions;

    default:
      return [];
  }
}

function getQueryParams(fieldName: string, slug: string): Record<string, any> {
  if (fieldName === 'format') {
    const displayName = formatDisplayName(slug);
    const simpleName = slug.replace(/-/g, ' ');
    const vinylSize = displayName.match(/^\d+\"$/) ? displayName : '';
    const isLP = displayName === 'LP';

    return { displayName, simpleName, vinylSize, isLP };
  }

  return {};
}

async function tryComplexArtistSearch(
  slug: string,
  page: number,
  sort: string,
  limit: number,
  offset: number,
  sortClause: string
): Promise<ProductResult> {
  const searchVariations = generateSearchVariations(slug);
  const queryParams: Record<string, string> = {};
  const variationChecks: string[] = [];

  searchVariations.slice(0, 10).forEach((variation, index) => {
    const paramName = `variation${index}`;
    queryParams[paramName] = variation;
    variationChecks.push(`${paramName} in artist[]`);
  });

  // Mock result for now
  const complexResult = { products: [], total: 0 };
  const products = (complexResult.products || []).map(formatProductForDisplay);

  return {
    products,
    total: complexResult.total || 0,
    pages: Math.ceil((complexResult.total || 0) / limit),
    currentPage: page
  };
}

export async function getProductsByArtist(
  slug: string,
  page?: number,
  sort?: string,
  limit?: number
): Promise<ProductResult> {
  return getProductsByField('artist', slug, page, sort, limit);
}

export async function getProductsByLabel(
  slug: string,
  page?: number,
  sort?: string,
  limit?: number
): Promise<ProductResult> {
  return getProductsByField('label', slug, page, sort, limit);
}

export async function getProductsByGenre(
  slug: string,
  page?: number,
  sort?: string,
  limit?: number
): Promise<ProductResult> {
  return getProductsByField('genre', slug, page, sort, limit);
}

export async function getProductsByFormat(
  slug: string,
  page?: number,
  sort?: string,
  limit?: number
): Promise<ProductResult> {
  return getProductsByField('format', slug, page, sort, limit);
}
