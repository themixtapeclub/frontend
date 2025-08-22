// lib/archive.ts - OPTIMIZED VERSION
import { createClient } from '@sanity/client';

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  useCdn: true,
  token: process.env.NEXT_PUBLIC_SANITY_API_TOKEN,
  apiVersion: '2023-05-03'
});

// Types
interface SanityReference {
  _type: string;
  _ref: string;
}

interface SanitySlug {
  _type: 'slug';
  current: string;
}

interface SanityImage {
  _type: 'image';
  asset: SanityReference;
  alt?: string;
}

interface SanityImageWithUrl {
  _type: 'image';
  asset: {
    _type: string;
    _ref: string;
    url: string;
    metadata?: {
      dimensions?: {
        width?: number;
        height?: number;
      };
      lqip?: string;
    };
  };
  alt?: string;
}

// Updated SanityProduct interface with optimized structure
interface SanityProduct {
  _id: string;
  _createdAt: string;
  title: string;
  artist?: string; // Now single string from query
  label?: string; // Now single string from query
  genre?: string; // Now single string from query
  format?: string; // Now single string from query
  tags?: string[];
  price?: number;
  swellProductId?: string;
  swellSlug?: string;
  slug?: string;
  description?: string;
  shortDescription?: string;
  inStock?: boolean;
  stockLevel?: number;
  menuOrder?: number;
  orderRank?: string;
  imageUrl?: string;
  lqip?: string;
  // Remove complex mainImage object since we're using imageUrl + lqip
}

interface ProductImage {
  file: {
    url: string;
    width: number;
    height: number;
  };
  caption: string;
}

interface ProductContent {
  artist: string;
  label: string;
  genre: string;
  format: string;
  week: string;
}

interface SafeProduct {
  id: string;
  name: string;
  slug: string;
  handle: string;
  price: number;
  images: ProductImage[];
  description: string;
  content: ProductContent;
  stockLevel: number;
  stock_status: 'in_stock' | 'out_of_stock';
  featured: boolean;
  orderRank?: string;
  menuOrder?: number;
  _id: string;
  _createdAt: string;
  swellSlug?: string;
  swellProductId?: string;
  sku?: string;
  tags: string[];
  // Add mainImage structure for ProductCard compatibility
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

interface ProductsResult {
  products: SafeProduct[];
  count: number;
  currentPage: number;
  totalPages: number;
  actualName: string;
}

interface FieldVariationResult {
  variation: string;
  patternIndex: number;
  actualName?: string;
}

interface FieldValue {
  value: string;
  slug: string;
}

type ProductField = 'genre' | 'artist' | 'label' | 'format';
type SortOption = 'date_created asc' | 'date_created desc';

// OPTIMIZED: Generate fewer but more targeted variations
function generateFieldVariations(slug: string): string[] {
  const displayName = slugToDisplayName(slug);

  const variations = [
    displayName, // "Pinchy & Friends"
    displayName.toUpperCase(), // "PINCHY & FRIENDS"
    slug.toLowerCase(), // "pinchy-amp-friends"

    // Ampersand variations
    displayName.replace(/\s*&\s*/g, ' '), // "Pinchy Friends"
    displayName.replace(/\s*&\s*/g, ' and '), // "Pinchy and Friends"

    // Hyphen variations
    slug.replace(/-amp-/g, '-'), // "pinchy-friends"
    slug.replace(/-/g, ' '), // "pinchy amp friends"

    // Clean up variations
    slug.replace(/--/g, '-'), // Handle double hyphens
    slug
  ];

  return Array.from(new Set(variations.filter(Boolean)));
}

// OPTIMIZED: Simplified slug conversion
export function slugToDisplayName(slug: string): string {
  return slug
    .replace(/--/g, '-amp-')
    .split('-')
    .map((word) =>
      word.toLowerCase() === 'amp' ? '&' : word.charAt(0).toUpperCase() + word.slice(1)
    )
    .join(' ')
    .trim();
}

// OPTIMIZED: Simplified safe string conversion
function safeString(value: unknown): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return String(value);
  if (Array.isArray(value)) return value.join(', ');
  if (typeof value === 'object' && value !== null) {
    const obj = value as Record<string, unknown>;
    return String(obj.main || obj.title || obj.name || obj.current || '');
  }
  return String(value);
}

// OPTIMIZED: Convert Sanity product to safe format with proper mainImage structure
function createSafeProduct(sanityProduct: SanityProduct): SafeProduct {
  const slug = sanityProduct.swellSlug || sanityProduct.slug || sanityProduct._id;

  return {
    id: sanityProduct._id,
    name: sanityProduct.title || 'Untitled',
    slug: slug,
    handle: slug,
    price: sanityProduct.price || 0,

    // OPTIMIZED: Create mainImage structure for ProductCard compatibility
    mainImage: sanityProduct.imageUrl
      ? {
          asset: {
            url: sanityProduct.imageUrl,
            metadata: {
              lqip: sanityProduct.lqip,
              dimensions: { width: 800, height: 800 }
            }
          }
        }
      : undefined,

    // Keep images array for compatibility
    images: sanityProduct.imageUrl
      ? [
          {
            file: {
              url: sanityProduct.imageUrl,
              width: 800,
              height: 800
            },
            caption: ''
          }
        ]
      : [],

    description: sanityProduct.description || '',

    // OPTIMIZED: Direct assignment since data is pre-processed in query
    content: {
      artist: sanityProduct.artist || '',
      label: sanityProduct.label || '',
      genre: sanityProduct.genre || '',
      format: sanityProduct.format || '',
      week: ''
    },

    stockLevel: sanityProduct.stockLevel || 0,
    stock_status: sanityProduct.inStock ? 'in_stock' : 'out_of_stock',
    featured: false,

    // Keep Sanity-specific fields
    orderRank: sanityProduct.orderRank,
    menuOrder: sanityProduct.menuOrder,
    _id: sanityProduct._id,
    _createdAt: sanityProduct._createdAt,
    swellSlug: sanityProduct.swellSlug,
    swellProductId: sanityProduct.swellProductId,
    sku: sanityProduct._id, // Use _id as SKU fallback
    tags: sanityProduct.tags || []
  };
}

// OPTIMIZED: Get all unique values for a field
export async function getAllFieldValues(field: ProductField): Promise<FieldValue[]> {
  try {
    // Different query based on field type
    let query: string;
    if (field === 'artist' || field === 'label') {
      query = `array::unique(*[_type == "product" && defined(${field}[0]) && defined(mainImage.asset->url)].${field}[])`;
    } else {
      query = `array::unique(*[_type == "product" && defined(${field}[0].main) && defined(mainImage.asset->url)].${field}[].main)`;
    }

    const values = await client.fetch<string[]>(query);

    return values.filter(Boolean).map((value: string) => ({
      value: value,
      slug: value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
    }));
  } catch (error) {
    console.error(`Error fetching ${field} values:`, error);
    return [];
  }
}

// OPTIMIZED: Simplified field variation finder with better case handling
async function findCorrectFieldVariation(
  field: ProductField,
  slug: string
): Promise<FieldVariationResult | null> {
  const variations = generateFieldVariations(slug);

  // Different patterns for different field types
  const isStringField = field === 'label' || field === 'artist';

  for (const variation of variations) {
    try {
      // OPTIMIZED: Try both exact match and case-insensitive match
      let testQueries: string[];

      if (isStringField) {
        testQueries = [
          // Exact match
          `*[_type == "product" && "${variation}" in ${field}[] && defined(mainImage.asset->url)][0]{"actualName": ${field}[0]}`,
          // Case-insensitive match
          `*[_type == "product" && lower("${variation.toLowerCase()}") in ${field}[].lower() && defined(mainImage.asset->url)][0]{"actualName": ${field}[0]}`,
          // Partial match
          `*[_type == "product" && ${field}[] match "*${variation}*" && defined(mainImage.asset->url)][0]{"actualName": ${field}[0]}`
        ];
      } else {
        testQueries = [
          // Exact match for object fields
          `*[_type == "product" && "${variation}" in ${field}[].main && defined(mainImage.asset->url)][0]{"actualName": ${field}[0].main}`,
          // Case-insensitive match for object fields
          `*[_type == "product" && lower("${variation.toLowerCase()}") in ${field}[].main.lower() && defined(mainImage.asset->url)][0]{"actualName": ${field}[0].main}`
        ];
      }

      // Try each query pattern
      for (const testQuery of testQueries) {
        try {
          const result = await client.fetch<{ actualName: string } | null>(testQuery);
          if (result?.actualName) {
            return {
              variation,
              patternIndex: 0,
              actualName: result.actualName
            };
          }
        } catch (queryError) {
          // Continue to next query
          continue;
        }
      }
    } catch (error) {
      continue;
    }
  }

  return null;
}

// OPTIMIZED: Main products query with better performance
export async function getProductsByContentField(
  field: ProductField,
  slug: string,
  page = 1,
  sort: SortOption = 'date_created asc'
): Promise<ProductsResult> {
  const displayName = slugToDisplayName(slug);

  try {
    // Find the correct field variation
    const correctVariationResult = await findCorrectFieldVariation(field, slug);

    if (!correctVariationResult) {
      return {
        products: [],
        count: 0,
        currentPage: page,
        totalPages: 0,
        actualName: displayName
      };
    }

    const { variation: correctVariation, actualName } = correctVariationResult;
    const itemsPerPage = 20;
    const offset = (page - 1) * itemsPerPage;

    // OPTIMIZED: Simple filter condition
    const isStringField = field === 'label' || field === 'artist';
    const filterCondition = isStringField
      ? `"${correctVariation}" in ${field}[]`
      : `"${correctVariation}" in ${field}[].main`;

    // OPTIMIZED: Simplified sort order
    let sortOrder = 'order(_createdAt asc, _id asc)';
    if (sort === 'date_created desc') {
      sortOrder = 'order(_createdAt desc, _id desc)';
    }

    // OPTIMIZED: Streamlined products query with pre-processed fields
    const productsQuery = `*[_type == "product" && 
      ${filterCondition} && 
      defined(mainImage.asset->url)
    ] | ${sortOrder} [${offset}...${offset + itemsPerPage}] {
      _id,
      title,
      "artist": ${
        isStringField && field === 'artist'
          ? 'artist[0]'
          : field === 'artist'
            ? 'artist[0].main'
            : 'artist[0]'
      },
      "label": ${
        isStringField && field === 'label'
          ? 'label[0]'
          : field === 'label'
            ? 'label[0].main'
            : 'label[0]'
      },
      "genre": genre[0].main,
      "format": format[0].main,
      price,
      description,
      tags[0...5],
      swellProductId,
      "slug": coalesce(swellSlug, slug.current, _id),
      swellSlug,
      "imageUrl": mainImage.asset->url + "?w=800&h=800&fit=fill&auto=format&q=80&fm=webp",
      "lqip": mainImage.asset->metadata.lqip,
      inStock,
      stockLevel,
      orderRank,
      menuOrder,
      _createdAt
    }`;

    // OPTIMIZED: Simple count query
    const countQuery = `count(*[_type == "product" && ${filterCondition} && defined(mainImage.asset->url)])`;

    // Execute queries in parallel
    const [sanityProducts, totalCount] = await Promise.all([
      client.fetch<SanityProduct[]>(productsQuery),
      client.fetch<number>(countQuery)
    ]);

    // Convert to safe format
    const products = sanityProducts.map(createSafeProduct);
    const totalPages = Math.ceil(totalCount / itemsPerPage);

    return {
      products,
      count: totalCount,
      currentPage: page,
      totalPages: totalPages,
      actualName: decodeHtmlEntities(actualName || displayName)
    };
  } catch (error) {
    console.error(`Error fetching products by ${field}:`, error);
    return {
      products: [],
      count: 0,
      currentPage: 1,
      totalPages: 0,
      actualName: displayName
    };
  }
}

// OPTIMIZED: Simple HTML entity decoder
function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

// OPTIMIZED: Get product count by field value
export async function getProductCountByField(field: ProductField, value: string): Promise<number> {
  try {
    const isStringField = field === 'label' || field === 'artist';
    const condition = isStringField ? `"${value}" in ${field}[]` : `"${value}" in ${field}[].main`;

    const query = `count(*[_type == "product" && ${condition} && defined(mainImage.asset->url)])`;
    return await client.fetch<number>(query);
  } catch (error) {
    console.error(`Error getting count for ${field}:${value}:`, error);
    return 0;
  }
}
