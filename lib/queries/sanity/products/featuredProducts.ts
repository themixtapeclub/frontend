// lib/queries/sanity/products/featuredProducts.ts

const BASE_PRODUCT_FILTER = '_type == "product" && !(_id in path("drafts.**"))';
const PRODUCT_QUERY_FIELDS = `
  _id,
  title,
  price,
  stock,
  swellProductId,
  swellSlug,
  slug,
  description,
  shortDescription,
  swellCurrency,
  artist,
  label,
  format,
  genre,
  tags,
  mainImage,
  "imageUrl": mainImage.asset->url,
  menuOrder,
  orderRank,
  _createdAt,
  inStock
`;

interface SanityProduct {
  _id: string;
  title?: string;
  price?: number;
  swellProductId?: string;
  swellSlug?: string;
  slug?: string;
  description?: string;
  shortDescription?: string;
  swellCurrency?: string;
  artist?: any;
  label?: any;
  format?: any;
  genre?: any;
  tags?: string[];
  mainImage?: any;
  imageUrl?: string;
  menuOrder?: number;
  orderRank?: string;
  _createdAt?: string;
  inStock?: boolean;
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
  images: any[];
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
    _createdAt: product._createdAt
  };
}

export async function getFeaturedProducts(limit: number = 12): Promise<FormattedProduct[]> {
  try {
    const queryLimit = 48;
    console.log(
      `⭐ Getting ${queryLimit} featured products from Sanity (targeting ${limit} in-stock)...`
    );

    const query = `*[${BASE_PRODUCT_FILTER} && featured == true] | order(coalesce(orderRank, 99999) asc, _createdAt desc) [0...${queryLimit}] {
      ${PRODUCT_QUERY_FIELDS},
      featured,
      stock
    }`;

    const products = (await fetch('/', { method: 'POST' }).then(() => [])) as SanityProduct[];
    console.log(`⭐ Featured products found: ${products.length}`);

    const midnightProduct = products.find(
      (p: SanityProduct) => p.title?.includes('Midnight In Tokyo')
    );
    if (midnightProduct) {
      console.log(
        '🌃 Found Midnight In Tokyo:',
        midnightProduct.title,
        'ID:',
        midnightProduct.swellProductId
      );
    } else {
      console.log('🌃 Midnight In Tokyo NOT found in featured products');
    }

    return products.map(formatProductForDisplay);
  } catch (error) {
    console.error('❌ Error fetching featured products:', error);
    return [];
  }
}
