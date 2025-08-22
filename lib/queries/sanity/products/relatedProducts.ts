// lib/queries/sanity/products/relatedProducts.ts
import { relatedProductsCache } from '../../../cache/coordinatedCache';
import { sanityClient } from '../../../cms';

const BASE_PRODUCT_FILTER = '_type == "product" && !(_id in path("drafts.**"))';

const ARTIST_LABEL_FILTER =
  '_type == "product" && !(_id in path("drafts.**")) && defined(mainImage.asset) && stock > 0 && (inStock == true || inStock == null)';

const TAG_BASED_FILTER = '_type == "product" && !(_id in path("drafts.**"))';

const OPTIMIZED_PRODUCT_FIELDS = `
  _id,
  title,
  slug,
  sku,
  price,
  stock,
  swellProductId,
  swellSlug,
  inStock,
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
    alt
  },
  tags,
  artist,
  label,
  genre,
  orderRank,
  menuOrder,
  _createdAt,
  "imageUrl": coalesce(mainImage.asset->url, "/placeholder.jpg"),
  "imageWidth": coalesce(mainImage.asset->metadata.dimensions.width, 800),
  "imageHeight": coalesce(mainImage.asset->metadata.dimensions.height, 800),
  "lqipData": mainImage.asset->metadata.lqip,
  tracklist[]{
    _key,
    title,
    audioUrl,
    artist
  },
  discogsReleaseId,
  tracklistEnhanced,
  tracklistLastUpdated
`;

interface RelatedProduct {
  _id: string;
  title: string;
  artist?: any;
  label?: any;
  genre?: any;
  tags?: string[];
  stock?: number;
  swellProductId?: string;
  imageUrl?: string;
  mainImage?: any;
  orderRank?: string | number;
  menuOrder?: number;
  _createdAt?: string;
  slug?: any;
  swellSlug?: string;
  sku?: string;
  price?: number;
  tracklist?: any[];
  discogsReleaseId?: string;
  tracklistEnhanced?: boolean;
  tracklistLastUpdated?: string;
  [key: string]: any;
}

interface ProcessedProduct extends RelatedProduct {
  id: string;
  name: string;
  images: Array<{ file: { url: string } }>;
  resolvedSlug: string;
  matchCategory: 'artistLabel' | 'tags';
  validArtists?: string[];
  validLabels?: string[];
  sanityContent: any;
}

interface SwellProduct {
  sanityContent?: { _id?: string };
  _id?: string;
  id?: string;
  swellProductId?: string;
}

interface RelatedProductsResult {
  artistLabelProducts: ProcessedProduct[];
  tagBasedProducts: ProcessedProduct[];
}

function normalizeArray(field: any): string[] {
  if (!field) return [];
  if (typeof field === 'string') return [field];
  if (Array.isArray(field)) {
    return field
      .map((item) => {
        if (typeof item === 'string') return item;
        if (item && typeof item === 'object') {
          if (item.main) return item.main;
          if (item.name) return item.name;
          if (item.title) return item.title;
          if (item.value) return item.value;
        }
        return null;
      })
      .filter((item): item is string => Boolean(item));
  }
  if (field && typeof field === 'object') {
    if (field.main) return [field.main];
    if (field.name) return [field.name];
    if (field.title) return [field.title];
    if (field.value) return [field.value];
  }
  return [];
}

class OptimizedQueryBuilder {
  buildArtistLabelQuery(
    artists: string[],
    labels: string[],
    currentProduct: RelatedProduct,
    limit: number
  ): string {
    const validArtists = artists.filter(
      (artist) =>
        artist &&
        artist.toLowerCase() !== 'unknown' &&
        artist.toLowerCase() !== 'various' &&
        artist.toLowerCase() !== 'various artists'
    );

    const validLabels = labels.filter(
      (label) =>
        label && label.toLowerCase() !== 'not on label' && label.toLowerCase() !== 'unknown'
    );

    if (validArtists.length === 0 && validLabels.length === 0) return '';

    const conditions: string[] = [];
    if (validArtists.length > 0) {
      const artistConditions = validArtists.map(
        (a) => `"${a}" in artist[] || artist.main == "${a}" || artist.name == "${a}"`
      );
      conditions.push(`(${artistConditions.join(' || ')})`);
    }
    if (validLabels.length > 0) {
      const labelConditions = validLabels.map(
        (l) => `"${l}" in label[] || label.main == "${l}" || label.name == "${l}"`
      );
      conditions.push(`(${labelConditions.join(' || ')})`);
    }

    return `*[${ARTIST_LABEL_FILTER} && _id != $currentProductId && swellProductId != $swellProductId && (${conditions.join(
      ' || '
    )})] | order(coalesce(menuOrder, 999999), coalesce(orderRank, 'zzz'), _createdAt desc) [0...${limit}] {
      ${OPTIMIZED_PRODUCT_FIELDS}
    }`;
  }

  buildTagQuery(tags: string[], currentProduct: RelatedProduct, limit: number): string {
    if (tags.length === 0) return '';

    const tagConditions = tags
      .map((tag) => `"${tag}" in tags[] || "${tag}" in genre[].main`)
      .join(' || ');

    return `*[${TAG_BASED_FILTER} && _id != $currentProductId && swellProductId != $swellProductId && (${tagConditions})] | order(
      coalesce(stock, 0) desc,
      coalesce(orderRank, 'zzz'),
      coalesce(menuOrder, 999999),
      _createdAt desc
    ) [0...${limit}] {
      ${OPTIMIZED_PRODUCT_FIELDS}
    }`;
  }
}

const queryBuilder = new OptimizedQueryBuilder();

async function processProducts(
  products: RelatedProduct[],
  validArtists: string[],
  validLabels: string[],
  matchType: 'artistLabel' | 'tags'
): Promise<ProcessedProduct[]> {
  return products
    .filter((product) => {
      if (matchType === 'artistLabel') {
        // For artist/label matches: require main image and in-stock
        const hasMainImage = product.mainImage?.asset?.url;
        const isInStock =
          product.stock !== undefined && product.stock !== null && product.stock > 0;
        return hasMainImage && isInStock;
      } else {
        // For tag-based matches: allow placeholder images but prioritize in-stock
        return true;
      }
    })
    .map((product) => {
      const imageUrl = product.imageUrl || product.mainImage?.asset?.url || '/placeholder.jpg';
      const hasPlaceholder = imageUrl === '/placeholder.jpg';

      return {
        ...product,
        id: product.swellProductId || product._id,
        name: product.title,
        slug: product.slug,
        imageUrl,
        images: imageUrl ? [{ file: { url: imageUrl } }] : [],
        resolvedSlug: product.swellSlug || product.slug?.current || product.sku || product._id,
        matchCategory: matchType,
        validArtists,
        validLabels,
        hasPlaceholder,
        sanityContent: {
          _id: product._id,
          title: product.title,
          artist: product.artist,
          label: product.label,
          tracklist: product.tracklist,
          discogsReleaseId: product.discogsReleaseId,
          tracklistEnhanced: product.tracklistEnhanced,
          mainImage: hasPlaceholder ? null : product.mainImage
        }
      };
    });
}

export async function getRelatedProducts(
  swellProduct: SwellProduct,
  limit: number = 12
): Promise<RelatedProductsResult> {
  try {
    const productId =
      swellProduct.sanityContent?._id ||
      swellProduct._id ||
      swellProduct.id ||
      swellProduct.swellProductId;

    if (!productId) {
      return { artistLabelProducts: [], tagBasedProducts: [] };
    }

    const cacheKey = `${productId}_${limit}`;
    const cached = relatedProductsCache.get<RelatedProductsResult>(cacheKey);
    if (cached) {
      return cached;
    }

    const currentProductQuery = `*[${BASE_PRODUCT_FILTER} && (_id == $productId || swellProductId == $productId)][0] {
      _id,
      title,
      artist,
      label,
      tags,
      genre,
      swellProductId
    }`;

    const currentProduct = await sanityClient.fetch(currentProductQuery, { productId });

    if (!currentProduct) {
      return { artistLabelProducts: [], tagBasedProducts: [] };
    }

    const artists = normalizeArray(currentProduct.artist);
    const labels = normalizeArray(currentProduct.label);
    const tags = [...normalizeArray(currentProduct.tags), ...normalizeArray(currentProduct.genre)];

    const validArtists = artists.filter(
      (artist) =>
        artist &&
        artist.toLowerCase() !== 'unknown' &&
        artist.toLowerCase() !== 'various' &&
        artist.toLowerCase() !== 'various artists'
    );

    const validLabels = labels.filter(
      (label) =>
        label && label.toLowerCase() !== 'not on label' && label.toLowerCase() !== 'unknown'
    );

    const artistLabelQuery = queryBuilder.buildArtistLabelQuery(
      validArtists,
      validLabels,
      currentProduct,
      limit
    );
    const tagQuery = queryBuilder.buildTagQuery(tags, currentProduct, limit);

    const [artistLabelResults, tagResults] = await Promise.all([
      artistLabelQuery
        ? sanityClient.fetch(artistLabelQuery, {
            currentProductId: currentProduct._id,
            swellProductId: currentProduct.swellProductId || 'none'
          })
        : [],
      tagQuery
        ? sanityClient.fetch(tagQuery, {
            currentProductId: currentProduct._id,
            swellProductId: currentProduct.swellProductId || 'none'
          })
        : []
    ]);

    const [processedArtistLabel, processedTags] = await Promise.all([
      processProducts(artistLabelResults, validArtists, validLabels, 'artistLabel'),
      processProducts(tagResults, validArtists, validLabels, 'tags')
    ]);

    const seenIds = new Set<string>();

    const artistLabelProducts = processedArtistLabel
      .filter((p) => {
        if (seenIds.has(p._id)) return false;
        seenIds.add(p._id);
        return true;
      })
      .slice(0, limit);

    const tagBasedProducts = processedTags
      .filter((p) => {
        if (seenIds.has(p._id)) return false;
        return true;
      })
      .slice(0, limit);

    const result: RelatedProductsResult = { artistLabelProducts, tagBasedProducts };

    relatedProductsCache.set(cacheKey, result);

    return result;
  } catch (error) {
    return { artistLabelProducts: [], tagBasedProducts: [] };
  }
}

export function preloadRelatedProducts(swellProductId: string): void {
  if (typeof window !== 'undefined' && swellProductId) {
    getRelatedProducts({ id: swellProductId }, 8).catch(() => {});
  }
}

export function preloadOnHover(
  elementOrProductId: HTMLElement | string,
  swellProductId?: string
): void {
  if (typeof window !== 'undefined') {
    if (typeof elementOrProductId === 'string') {
      preloadRelatedProducts(elementOrProductId);
      return;
    }

    if (elementOrProductId && swellProductId) {
      let preloaded = false;

      const handleHover = (): void => {
        if (!preloaded) {
          preloaded = true;
          preloadRelatedProducts(swellProductId);
        }
      };

      elementOrProductId.addEventListener('mouseenter', handleHover, { passive: true });
      elementOrProductId.addEventListener('touchstart', handleHover, { passive: true });
    }
  }
}

export function clearRelatedProductsCache(): void {
  relatedProductsCache.clear();
}
