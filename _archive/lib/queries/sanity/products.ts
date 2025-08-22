// lib/sanity/products.ts - CLEAN COMPLETE VERSION WITH DRAFT FILTERING

import { createClient } from '@sanity/client';
import { formatDisplayName, generateSearchVariations } from '../../utils/slugUtils';

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  useCdn: true,
  token: process.env.NEXT_PUBLIC_SANITY_API_TOKEN,
  apiVersion: '2023-05-03'
});

// Updated SanityProduct interface with mainImage
interface SanityProduct {
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
  swellCurrency?: string;
  menuOrder?: number;
  orderRank?: string;
  imageUrl?: string;
  hasImage?: boolean;
  // ✅ ADD THIS - the mainImage object from Sanity
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

  // ✅ ADD THIS - pass through the mainImage object
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

interface ProductResult {
  products: FormattedProduct[];
  total: number;
  pages: number;
  currentPage: number;
  error?: string;
  debugArtists?: any[];
}

// 🚫 DRAFT FILTER - Base query filter that excludes drafts
const BASE_PRODUCT_FILTER = `_type == "product" && 
  !(_id in path("drafts.**")) &&
  defined(swellProductId) && 
  defined(mainImage.asset->url)`;

// Simple test function
export async function testSanityConnection(): Promise<number> {
  try {
    console.log('🧪 Testing Sanity connection...');
    // ✅ Also exclude drafts in the test count
    const result = await client.fetch(`count(*[${BASE_PRODUCT_FILTER}])`);
    console.log('🧪 Total published products in Sanity:', result);
    return result;
  } catch (error) {
    console.error('❌ Sanity connection test failed:', error);
    return 0;
  }
}

// Helper function to format products for consistency - FIXED WITH MAINIMAGE
function formatProductForDisplay(product: SanityProduct): FormattedProduct {
  // 🔍 DEBUG: Log the raw Sanity data including mainImage
  // if (process.env.NODE_ENV === 'development') {
  //   console.log('🔍 RAW SANITY DATA for formatProductForDisplay:', {
  //     title: product.title,
  //     rawArtist: product.artist,
  //     rawLabel: product.label,
  //     rawFormat: product.format,
  //     rawGenre: product.genre,
  //     hasMainImage: !!product.mainImage,
  //     mainImageUrl: product.mainImage?.asset?.url,
  //     hasMetadata: !!product.mainImage?.asset?.metadata,
  //     hasLqip: !!product.mainImage?.asset?.metadata?.lqip,
  //     lqipValue: product.mainImage?.asset?.metadata?.lqip,
  //     allKeys: Object.keys(product)
  //   });
  // }

  // Process artist
  let processedArtist = '';
  if (Array.isArray(product.artist) && product.artist.length > 0) {
    processedArtist = product.artist.join(', ');
  } else if (typeof product.artist === 'string' && product.artist.trim()) {
    processedArtist = product.artist.trim();
  }

  // Process label
  let processedLabel = '';
  if (Array.isArray(product.label) && product.label.length > 0) {
    processedLabel = product.label.join(', ');
  } else if (typeof product.label === 'string' && product.label.trim()) {
    processedLabel = product.label.trim();
  }

  // Process format
  let processedFormat = '';
  if (product.format) {
    if (Array.isArray(product.format)) {
      processedFormat = product.format
        .map((f) => (typeof f === 'object' && f?.main ? f.main : String(f)))
        .join(', ');
    } else {
      processedFormat = String(product.format);
    }
  }

  // Process genre
  let processedGenre = '';
  if (product.genre) {
    if (Array.isArray(product.genre)) {
      processedGenre = product.genre
        .map((g) => (typeof g === 'object' && g?.main ? g.main : String(g)))
        .join(', ');
    } else {
      processedGenre = String(product.genre);
    }
  }

  // 🔍 DEBUG: Log the processed data
  // if (process.env.NODE_ENV === 'development') {
  //   console.log('🔍 PROCESSED DATA for formatProductForDisplay:', {
  //     title: product.title,
  //     processedArtist,
  //     processedLabel,
  //     processedFormat,
  //     processedGenre,
  //     passingThroughMainImage: !!product.mainImage
  //   });
  // }

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

    // Direct fields for fallback
    artist: product.artist,
    label: product.label,
    format: product.format,

    // ✅ CRUCIAL: Pass through the mainImage object
    mainImage: product.mainImage,

    tags: product.tags || [],
    _sanityId: product._id,
    menuOrder: product.menuOrder,
    orderRank: product.orderRank,
    _createdAt: product._createdAt
  };
}

// Get sort clause helper
function getSortClause(sort: string): string {
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
    default:
      return 'order(menuOrder asc, _createdAt desc)';
  }
}

// Get products by artist from Sanity - CLEAN PRODUCTION VERSION WITH DRAFT FILTERING
export async function getProductsByArtist(
  artistSlug: string,
  page: number = 1,
  sort: string = 'menuOrder',
  limit: number = 40
): Promise<ProductResult> {
  try {
    const displayName = formatDisplayName(artistSlug);
    const simpleName = artistSlug.replace(/-/g, ' ');

    const offset = (page - 1) * limit;
    const sortClause = getSortClause(sort);

    // ✅ UPDATED: Use BASE_PRODUCT_FILTER which excludes drafts
    const query = `{
      "products": *[${BASE_PRODUCT_FILTER} &&
        defined(artist) &&
        (
          "${displayName}" in artist[] ||
          "${simpleName}" in artist[] ||
          "${artistSlug}" in artist[]
        )
      ] | ${sortClause} [${offset}...${offset + limit}] {
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
      },
      "total": count(*[${BASE_PRODUCT_FILTER} &&
        defined(artist) &&
        (
          "${displayName}" in artist[] ||
          "${simpleName}" in artist[] ||
          "${artistSlug}" in artist[]
        )
      ])
    }`;

    const result = await client.fetch(query);

    // If simple query works, use it
    if (result.products && result.products.length > 0) {
      const products = result.products.map(formatProductForDisplay);
      return {
        products,
        total: result.total || 0,
        pages: Math.ceil((result.total || 0) / limit),
        currentPage: page
      };
    }

    // If simple query failed, try complex variations for special characters
    const searchVariations = generateSearchVariations(artistSlug);

    // Build complex query with variations (limited to 10 for performance)
    const queryParams: Record<string, string> = {};
    const variationChecks: string[] = [];

    searchVariations.slice(0, 10).forEach((variation, index) => {
      const paramName = `variation${index}`;
      queryParams[paramName] = variation;
      variationChecks.push(`${paramName} in artist[]`);
    });

    // ✅ UPDATED: Use BASE_PRODUCT_FILTER in complex query too
    const complexQuery = `{
      "products": *[${BASE_PRODUCT_FILTER} &&
        defined(artist) &&
        (${variationChecks.join(' || ')})
      ] | ${sortClause} [${offset}...${offset + limit}] {
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
}, "hasImage": defined(mainImage.asset->url)
      },
      "total": count(*[${BASE_PRODUCT_FILTER} &&
        defined(artist) &&
        (${variationChecks.join(' || ')})
      ])
    }`;

    const complexResult = await client.fetch(complexQuery, queryParams);
    const products = (complexResult.products || []).map(formatProductForDisplay);

    return {
      products,
      total: complexResult.total || 0,
      pages: Math.ceil((complexResult.total || 0) / limit),
      currentPage: page
    };
  } catch (error) {
    console.error('❌ Error fetching products by artist from Sanity:', error);
    return {
      products: [],
      total: 0,
      pages: 0,
      currentPage: page,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Get products by label from Sanity - WITH DRAFT FILTERING
export async function getProductsByLabel(
  labelSlug: string,
  page: number = 1,
  sort: string = 'menuOrder',
  limit: number = 40
): Promise<ProductResult> {
  try {
    const displayName = formatDisplayName(labelSlug);
    const simpleName = labelSlug.replace(/-/g, ' ');

    const offset = (page - 1) * limit;
    const sortClause = getSortClause(sort);

    // ✅ UPDATED: Use BASE_PRODUCT_FILTER which excludes drafts
    const query = `{
      "products": *[${BASE_PRODUCT_FILTER} &&
        defined(label) &&
        (
          "${displayName}" in label[] ||
          "${simpleName}" in label[] ||
          "${labelSlug}" in label[]
        )
      ] | ${sortClause} [${offset}...${offset + limit}] {
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
      },
      "total": count(*[${BASE_PRODUCT_FILTER} &&
        defined(label) &&
        (
          "${displayName}" in label[] ||
          "${simpleName}" in label[] ||
          "${labelSlug}" in label[]
        )
      ])
    }`;

    const result = await client.fetch(query);

    // console.log('🏷️ Label search result:', {
    //   labelSlug,
    //   displayName,
    //   simpleName,
    //   productsFound: result.products?.length,
    //   total: result.total || 0
    // });

    const products = (result.products || []).map(formatProductForDisplay);

    return {
      products,
      total: result.total || 0,
      pages: Math.ceil((result.total || 0) / limit),
      currentPage: page
    };
  } catch (error) {
    console.error('❌ Error in getProductsByLabel:', error);

    return {
      products: [],
      total: 0,
      pages: 0,
      currentPage: page,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Get products by genre from Sanity - FIXED FOR HYPHENATED GENRES
export async function getProductsByGenre(
  genreSlug: string,
  page: number = 1,
  sort: string = 'menuOrder',
  limit: number = 40
): Promise<ProductResult> {
  try {
    // console.log('🎵 Starting getProductsByGenre:', { genreSlug, page, sort, limit });

    const displayName = formatDisplayName(genreSlug);
    const simpleName = genreSlug.replace(/-/g, ' ');

    // ADD THESE: Create additional search variations for hyphens
    const hyphenatedDisplayName = displayName.replace(/ /g, '-'); // "Hip Hop" -> "Hip-Hop"
    const hyphenatedSimpleName = genreSlug; // Keep original "hip-hop"
    const titleCaseHyphenated = genreSlug
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join('-'); // "hip-hop" -> "Hip-Hop"

    // console.log('🎵 Genre search variations:', {
    //   original: genreSlug,
    //   displayName,
    //   simpleName,
    //   hyphenatedDisplayName,
    //   hyphenatedSimpleName,
    //   titleCaseHyphenated
    // });

    const offset = (page - 1) * limit;
    const sortClause = getSortClause(sort);

    // UPDATED QUERY: Add the hyphenated variations to the search
    const query = `{
      "products": *[${BASE_PRODUCT_FILTER} &&
        defined(genre) &&
        (
          "${displayName}" in genre[].main ||
          "${simpleName}" in genre[].main ||
          "${hyphenatedDisplayName}" in genre[].main ||
          "${titleCaseHyphenated}" in genre[].main ||
          "${genreSlug}" in genre[].main ||
          "${displayName}" in genre[] ||
          "${simpleName}" in genre[] ||
          "${hyphenatedDisplayName}" in genre[] ||
          "${titleCaseHyphenated}" in genre[] ||
          "${genreSlug}" in genre[]
        )
      ] | ${sortClause} [${offset}...${offset + limit}] {
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
      },
      "total": count(*[${BASE_PRODUCT_FILTER} &&
        defined(genre) &&
        (
          "${displayName}" in genre[].main ||
          "${simpleName}" in genre[].main ||
          "${hyphenatedDisplayName}" in genre[].main ||
          "${titleCaseHyphenated}" in genre[].main ||
          "${genreSlug}" in genre[].main ||
          "${displayName}" in genre[] ||
          "${simpleName}" in genre[] ||
          "${hyphenatedDisplayName}" in genre[] ||
          "${titleCaseHyphenated}" in genre[] ||
          "${genreSlug}" in genre[]
        )
      ])
    }`;

    const result = await client.fetch(query);

    // console.log('🎵 Genre search result:', {
    //   genreSlug,
    //   displayName,
    //   simpleName,
    //   hyphenatedDisplayName,
    //   titleCaseHyphenated,
    //   productsFound: result.products?.length,
    //   total: result.total || 0
    // });

    const products = (result.products || []).map(formatProductForDisplay);

    return {
      products,
      total: result.total || 0,
      pages: Math.ceil((result.total || 0) / limit),
      currentPage: page
    };
  } catch (error) {
    console.error('❌ Error in getProductsByGenre:', error);

    return {
      products: [],
      total: 0,
      pages: 0,
      currentPage: page,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Get products by format from Sanity - WITH DRAFT FILTERING
export async function getProductsByFormat(
  formatSlug: string,
  page: number = 1,
  sort: string = 'menuOrder',
  limit: number = 40
): Promise<ProductResult> {
  try {
    // console.log('💿 Starting getProductsByFormat:', { formatSlug, page, sort, limit });

    const displayName = formatDisplayName(formatSlug);
    const simpleName = formatSlug.replace(/-/g, ' ');

    // Move debug code AFTER variable declarations
    // console.log('🔍 Searching for format:', {
    //   originalSlug: formatSlug,
    //   displayName,
    //   simpleName,
    //   lookingFor: [`"${displayName}"`, `"${simpleName}"`]
    // });

    // ✅ UPDATED: Add draft filter to debug query too
    const debugQuery = `*[${BASE_PRODUCT_FILTER} && defined(format)][0...10] {
      title,
      "formats": format[].main
    }`;
    const debugResult = await client.fetch(debugQuery);
    // console.log('🔍 Available formats in first 10 published products:', debugResult);

    const offset = (page - 1) * limit;
    const sortClause = getSortClause(sort);

    // Handle pattern matching for vinyl sizes and LP variations
    let vinylSize = '';
    let lpVariations: string[] = [];

    // For vinyl sizes (7", 10", 12"), search for variations like 2x12", 3x12", etc.
    if (displayName.match(/^\d+\"$/)) {
      vinylSize = displayName; // e.g., "12""
      // console.log('🔍 Vinyl size detected:', vinylSize);
    }

    // For LP, search for variations like 2xLP, 3xLP, etc.
    if (displayName === 'LP') {
      for (let i = 2; i <= 10; i++) {
        lpVariations.push(`${i}xLP`);
      }
      // console.log('🔍 LP variations to search:', lpVariations);
    }

    // ✅ UPDATED: Use BASE_PRODUCT_FILTER which excludes drafts
    const query = `{
      "products": *[${BASE_PRODUCT_FILTER} &&
        defined(format) &&
        (
          $displayName in format[].main ||
          $simpleName in format[].main ||
          $displayName in format[] ||
          $simpleName in format[] ||
          ($vinylSize != "" && format[].main match "*" + $vinylSize) ||
          ($vinylSize != "" && format[] match "*" + $vinylSize) ||
          ($isLP && ("2xLP" in format[].main || "3xLP" in format[].main || "4xLP" in format[].main || "5xLP" in format[].main || "6xLP" in format[].main || "7xLP" in format[].main || "8xLP" in format[].main || "9xLP" in format[].main || "10xLP" in format[].main)) ||
          ($isLP && ("2xLP" in format[] || "3xLP" in format[] || "4xLP" in format[] || "5xLP" in format[] || "6xLP" in format[] || "7xLP" in format[] || "8xLP" in format[] || "9xLP" in format[] || "10xLP" in format[]))
        )
      ] | ${sortClause} [${offset}...${offset + limit}] {
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
      },
      "total": count(*[${BASE_PRODUCT_FILTER} &&
        defined(format) &&
        (
          $displayName in format[].main ||
          $simpleName in format[].main ||
          $displayName in format[] ||
          $simpleName in format[] ||
          ($vinylSize != "" && format[].main match "*" + $vinylSize) ||
          ($vinylSize != "" && format[] match "*" + $vinylSize) ||
          ($isLP && ("2xLP" in format[].main || "3xLP" in format[].main || "4xLP" in format[].main || "5xLP" in format[].main || "6xLP" in format[].main || "7xLP" in format[].main || "8xLP" in format[].main || "9xLP" in format[].main || "10xLP" in format[].main)) ||
          ($isLP && ("2xLP" in format[] || "3xLP" in format[] || "4xLP" in format[] || "5xLP" in format[] || "6xLP" in format[] || "7xLP" in format[] || "8xLP" in format[] || "9xLP" in format[] || "10xLP" in format[]))
        )
      ])
    }`;

    const isLP = displayName === 'LP';
    const result = await client.fetch(query, { displayName, simpleName, vinylSize, isLP });

    // console.log('💿 Format search result:', {
    //   formatSlug,
    //   displayName,
    //   simpleName,
    //   productsFound: result.products?.length,
    //   total: result.total || 0
    // });

    const products = (result.products || []).map(formatProductForDisplay);

    return {
      products,
      total: result.total || 0,
      pages: Math.ceil((result.total || 0) / limit),
      currentPage: page
    };
  } catch (error) {
    console.error('❌ Error in getProductsByFormat:', error);

    return {
      products: [],
      total: 0,
      pages: 0,
      currentPage: page,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// // Get all formats with product counts - WITH DRAFT FILTERING
// export async function getAllFormats() {
//   try {
//     // ✅ UPDATED: Use BASE_PRODUCT_FILTER which excludes drafts
//     const query = `*[${BASE_PRODUCT_FILTER} && defined(format)] {
//       format
//     }`;

//     const products = await client.fetch(query);

//     const formatCounts: Record<string, number> = {};

//     products.forEach((product: { format?: Array<{ main?: string; sub?: string } | string> }) => {
//       if (product.format && Array.isArray(product.format)) {
//         product.format.forEach((formatItem) => {
//           let formatName = '';

//           if (typeof formatItem === 'object' && formatItem?.main) {
//             formatName = formatItem.main;
//           } else if (typeof formatItem === 'string') {
//             formatName = formatItem;
//           }

//           if (formatName) {
//             formatCounts[formatName] = (formatCounts[formatName] || 0) + 1;
//           }
//         });
//       }
//     });

//     const formats = Object.entries(formatCounts)
//       .map(([name, count]) => ({
//         name,
//         slug: name
//           .toLowerCase()
//           .replace(/\s+/g, '-')
//           .replace(/[^a-z0-9-]/g, ''),
//         count
//       }))
//       .sort((a, b) => a.name.localeCompare(b.name));

//     return formats;
//   } catch (error) {
//     console.error('❌ Error fetching formats from Sanity:', error);
//     return [];
//   }
// }

// // Get all artists with product counts - WITH DRAFT FILTERING
// export async function getAllArtists() {
//   try {
//     // ✅ UPDATED: Use BASE_PRODUCT_FILTER which excludes drafts
//     const query = `*[${BASE_PRODUCT_FILTER} && defined(artist)] {
//       artist
//     }`;

//     const products = await client.fetch(query);

//     const artistCounts: Record<string, number> = {};

//     products.forEach((product: { artist?: string[] }) => {
//       if (product.artist && Array.isArray(product.artist)) {
//         product.artist.forEach((artist: string) => {
//           if (artist) {
//             artistCounts[artist] = (artistCounts[artist] || 0) + 1;
//           }
//         });
//       }
//     });

//     const artists = Object.entries(artistCounts)
//       .map(([name, count]) => ({
//         name,
//         slug: name
//           .toLowerCase()
//           .replace(/\s+/g, '-')
//           .replace(/[^a-z0-9-]/g, ''),
//         count
//       }))
//       .sort((a, b) => a.name.localeCompare(b.name));

//     return artists;
//   } catch (error) {
//     console.error('❌ Error fetching artists from Sanity:', error);
//     return [];
//   }
// }

// // Get all labels with product counts - WITH DRAFT FILTERING
// export async function getAllLabels() {
//   try {
//     // ✅ UPDATED: Use BASE_PRODUCT_FILTER which excludes drafts
//     const query = `*[${BASE_PRODUCT_FILTER} && defined(label)] {
//       label
//     }`;

//     const products = await client.fetch(query);

//     const labelCounts: Record<string, number> = {};

//     products.forEach((product: { label?: string[] }) => {
//       if (product.label && Array.isArray(product.label)) {
//         product.label.forEach((label: string) => {
//           if (label) {
//             labelCounts[label] = (labelCounts[label] || 0) + 1;
//           }
//         });
//       }
//     });

//     const labels = Object.entries(labelCounts)
//       .map(([name, count]) => ({
//         name,
//         slug: name
//           .toLowerCase()
//           .replace(/\s+/g, '-')
//           .replace(/[^a-z0-9-]/g, ''),
//         count
//       }))
//       .sort((a, b) => a.name.localeCompare(b.name));

//     return labels;
//   } catch (error) {
//     console.error('❌ Error fetching labels from Sanity:', error);
//     return [];
//   }
// }

// // Get all genres with product counts - WITH DRAFT FILTERING
// export async function getAllGenres() {
//   try {
//     // ✅ UPDATED: Use BASE_PRODUCT_FILTER which excludes drafts
//     const query = `*[${BASE_PRODUCT_FILTER} && defined(genre)] {
//       genre
//     }`;

//     const products = await client.fetch(query);

//     const genreCounts: Record<string, number> = {};

//     products.forEach((product: { genre?: Array<{ main?: string; sub?: string } | string> }) => {
//       if (product.genre && Array.isArray(product.genre)) {
//         product.genre.forEach((genreItem) => {
//           let genreName = '';

//           if (typeof genreItem === 'object' && genreItem?.main) {
//             genreName = genreItem.main;
//           } else if (typeof genreItem === 'string') {
//             genreName = genreItem;
//           }

//           if (genreName) {
//             genreCounts[genreName] = (genreCounts[genreName] || 0) + 1;
//           }
//         });
//       }
//     });

//     const genres = Object.entries(genreCounts)
//       .map(([name, count]) => ({
//         name,
//         slug: name
//           .toLowerCase()
//           .replace(/\s+/g, '-')
//           .replace(/[^a-z0-9-]/g, ''),
//         count
//       }))
//       .sort((a, b) => a.name.localeCompare(b.name));

//     return genres;
//   } catch (error) {
//     console.error('❌ Error fetching genres from Sanity:', error);
//     return [];
//   }
// }
