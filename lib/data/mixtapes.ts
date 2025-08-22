// lib/data/mixtapes.ts - Complete version with pagination and proper tag normalization

import { sanityClient } from 'lib/queries/sanity/core/client';
import { MIXTAPE_QUERIES } from 'lib/queries/sanity/mixtapes/queries';

// Type definitions
interface Track {
  _id?: string;
  title?: string;
  artist?: string;
  product?: any;
  productBySku?: any;
  productByWpId?: any;
  [key: string]: any;
}

interface Mixtape {
  _id: string;
  _type?: string;
  title: string;
  slug: {
    current: string;
  };
  featuredImage?: any;
  mixcloudUrl?: string;
  publishedAt?: string;
  tags?: string[];
  tracklist?: Track[];
  trackTitle?: string;
  trackArtist?: string;
  [key: string]: any;
}

interface MixtapeReference {
  _type: 'mixtapeReference';
  mixtape: {
    _id: string;
    title: string;
    slug: {
      current: string;
    };
    featuredImage?: any;
    mixcloudUrl?: string;
    publishedAt?: string;
  };
  trackTitle?: string;
  trackArtist?: string;
  publishedAt?: string;
}

// Interface for pagination results
interface PaginationResult {
  mixtapes: Mixtape[];
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  total: number;
}

// Helper function to normalize tags for comparison
function normalizeTag(tag: string): string {
  return tag.toLowerCase().replace(/\s+/g, '-').trim();
}

// Helper function to convert URL format back to potential display formats
function getTagVariations(urlTag: string): string[] {
  return [
    urlTag, // "new-age"
    urlTag.replace(/-/g, ' '), // "new age"
    urlTag.replace(/-/g, ' ').toLowerCase(), // "new age" (explicit lowercase)
    // Title case version
    urlTag.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()) // "New Age"
  ];
}

export async function getMixtapes(
  type: 'featured' | 'recent' | 'mixtapeShop' = 'recent',
  limit?: number
): Promise<Mixtape[]> {
  try {
    const query =
      type === 'mixtapeShop' ? MIXTAPE_QUERIES.mixtapeShop() : MIXTAPE_QUERIES[type](limit);
    const mixtapes = await sanityClient.fetch(query);
    return mixtapes || [];
  } catch (error) {
    console.error(`Error fetching ${type} mixtapes:`, error);
    return [];
  }
}

export async function getMixtape(slug: string): Promise<Mixtape | null> {
  try {
    const mixtape = await sanityClient.fetch(MIXTAPE_QUERIES.bySlug(slug), { slug } as any);

    // Post-process tracklist to resolve product references
    if (mixtape?.tracklist) {
      mixtape.tracklist = mixtape.tracklist.map((track: Track) => ({
        ...track,
        product: track.product || track.productBySku || track.productByWpId || null
      }));
    }

    return mixtape;
  } catch (error) {
    console.error('Error fetching mixtape:', error);
    return null;
  }
}

export async function getProductMixtapes(
  productId: string,
  sku?: string,
  swellProductId?: string
): Promise<MixtapeReference[]> {
  try {
    const mixtapes = await sanityClient.fetch(
      MIXTAPE_QUERIES.containingProduct(productId, sku, swellProductId),
      { productId, sku: sku || '', swellProductId: swellProductId || '' } as any
    );

    return (
      mixtapes?.map((mixtape: any) => ({
        _type: 'mixtapeReference' as const,
        mixtape: {
          _id: mixtape._id,
          title: mixtape.title,
          slug: mixtape.slug,
          featuredImage: mixtape.featuredImage,
          mixcloudUrl: mixtape.mixcloudUrl,
          publishedAt: mixtape.publishedAt
        },
        trackTitle: mixtape.trackTitle,
        trackArtist: mixtape.trackArtist,
        publishedAt: mixtape.publishedAt
      })) || []
    );
  } catch (error) {
    console.error('Error searching for product mixtapes:', error);
    return [];
  }
}

// FIXED: Better tag matching with multiple variations
export async function getMixtapesByTag(tag: string, sortBy: string = 'recent'): Promise<Mixtape[]> {
  try {
    // Get the proper case version of the tag from Sanity
    const properTag = await getProperTagCase(tag);

    if (!properTag) {
      return [];
    }

    // Search using the properly cased tag - determine limit based on sortBy
    const limit = 48; // Default limit
    const query = MIXTAPE_QUERIES.byTag(properTag, limit);
    const mixtapes = await sanityClient.fetch(query, { tag: properTag } as any);

    return mixtapes || [];
  } catch (error) {
    console.error(`Error fetching mixtapes for tag "${tag}":`, error);
    return [];
  }
}

// NEW: Pagination function for mixtapes by tag
export async function getMixtapesByTagWithPagination(
  tag: string,
  page: number = 1,
  itemsPerPage: number = 48
): Promise<PaginationResult> {
  try {
    // Handle favorites special case
    if (tag === 'favorites') {
      return await getFavoritesMixtapesWithPagination(page, itemsPerPage);
    }

    // Get the proper case version of the tag from Sanity
    const properTag = await getProperTagCase(tag);

    if (!properTag) {
      return {
        mixtapes: [],
        currentPage: page,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false,
        total: 0
      };
    }

    // Calculate offset for pagination
    const offset = (page - 1) * itemsPerPage;

    // Get total count for the tag
    const totalQuery = MIXTAPE_QUERIES.countByTag(properTag);
    const total = await sanityClient.fetch(totalQuery, { tag: properTag } as any);

    // Calculate pagination info
    const totalPages = Math.ceil(total / itemsPerPage);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    // Get paginated results
    const query = MIXTAPE_QUERIES.byTagPaginated(properTag, offset, itemsPerPage);
    const mixtapes = await sanityClient.fetch(query, { tag: properTag } as any);

    return {
      mixtapes: mixtapes || [],
      currentPage: page,
      totalPages,
      hasNextPage,
      hasPreviousPage,
      total
    };
  } catch (error) {
    console.error(`Error fetching paginated mixtapes for tag "${tag}":`, error);
    return {
      mixtapes: [],
      currentPage: page,
      totalPages: 0,
      hasNextPage: false,
      hasPreviousPage: false,
      total: 0
    };
  }
}

export async function getFavoritesMixtapes(): Promise<Mixtape[]> {
  try {
    const limit = 48; // Default limit
    const query = MIXTAPE_QUERIES.favorites(limit);
    const mixtapes = await sanityClient.fetch(query);

    return mixtapes || [];
  } catch (error) {
    console.error('Error fetching favorite mixtapes:', error);
    return [];
  }
}

// NEW: Pagination function for favorites
export async function getFavoritesMixtapesWithPagination(
  page: number = 1,
  itemsPerPage: number = 48
): Promise<PaginationResult> {
  try {
    // Calculate offset
    const offset = (page - 1) * itemsPerPage;

    // Get total count of favorites
    const totalQuery = MIXTAPE_QUERIES.countFavorites();
    const total = await sanityClient.fetch(totalQuery);

    // Calculate pagination info
    const totalPages = Math.ceil(total / itemsPerPage);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    // Get paginated results
    const query = MIXTAPE_QUERIES.favoritesPaginated(offset, itemsPerPage);
    const mixtapes = await sanityClient.fetch(query);

    return {
      mixtapes: mixtapes || [],
      currentPage: page,
      totalPages,
      hasNextPage,
      hasPreviousPage,
      total
    };
  } catch (error) {
    console.error('Error fetching paginated favorite mixtapes:', error);
    return {
      mixtapes: [],
      currentPage: page,
      totalPages: 0,
      hasNextPage: false,
      hasPreviousPage: false,
      total: 0
    };
  }
}

// FIXED: Return URL-safe tags for static generation
export async function getAllMixtapeTags(): Promise<string[]> {
  try {
    const query = MIXTAPE_QUERIES.getAllTags();
    const tags = await sanityClient.fetch(query);

    // Convert to URL-safe format (normalize for URLs)
    const urlSafeTags = (tags || [])
      .filter(Boolean)
      .map((tag: string) => normalizeTag(tag))
      .filter((tag: string, index: number, array: string[]) => array.indexOf(tag) === index) // Remove duplicates
      .sort();

    return urlSafeTags;
  } catch (error) {
    console.error('Error fetching mixtape tags:', error);
    return [];
  }
}

// FIXED: Better validation with tag normalization
export async function isValidMixtapeTag(tag: string): Promise<boolean> {
  try {
    // Get the original tags from Sanity (not normalized)
    const query = `array::unique(*[_type == "mixtape" && !(_id in path("drafts.**"))].tags[])`;
    const allOriginalTags = await sanityClient.fetch(query);

    // Normalize all original tags and compare
    const normalizedInput = normalizeTag(tag);
    const isValid = allOriginalTags.some(
      (originalTag: string) => originalTag && normalizeTag(originalTag) === normalizedInput
    );

    return isValid;
  } catch (error) {
    console.error('Error validating mixtape tag:', error);
    return false;
  }
}

// FIXED: Better tag case matching
export async function getProperTagCase(tag: string): Promise<string | null> {
  try {
    const query = `array::unique(*[_type == "mixtape" && !(_id in path("drafts.**"))].tags[])`;
    const allTags = await sanityClient.fetch(query);

    // Find the tag with correct case by normalizing comparison
    const normalizedInput = normalizeTag(tag);
    const properTag = allTags.find((t: string) => t && normalizeTag(t) === normalizedInput);

    return properTag || null;
  } catch (error) {
    console.error('Error getting proper tag case:', error);
    return null;
  }
}
