// lib/sanity.ts - UPDATED for multiple contributors
import { createClient } from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';
import {
  IN_STOCK_PRODUCT_FILTER,
  imageFragment,
  mixtapeBaseFields,
  productReferenceFragment,
  tracklistFragment
} from './queries/sanity/shared/fragments';

// IMPORT THE CORRECT FRAGMENTS
import { IMAGE_FRAGMENT } from './queries/sanity/core/constants';

const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  useCdn: true,
  token: process.env.NEXT_PUBLIC_SANITY_API_TOKEN,
  apiVersion: '2023-05-03'
});

const builder = imageUrlBuilder(sanityClient);

export function urlFor(source: any) {
  return builder.image(source);
}

// UPDATED: Queries using the new contributor structure
export const mixtapeShopOrderableQuery = `
  *[_type == "mixtape" && (
    count(contributors[]->.name[match("*The Mixtape Shop*")]) > 0 ||
    contributorNames match "*The Mixtape Shop*" ||
    _contributorNames match "*The Mixtape Shop*"
  ) && !(_id in path("drafts.**"))] {
    ${mixtapeBaseFields},
    tags,
    // Add a sort helper that puts null menuOrder values last
    "sortOrder": coalesce(menuOrder, 99999)
  } | order(sortOrder asc, _createdAt asc)
`;

export const mixtapeQuery = `
  *[_type == "mixtape" && !(_id in path("drafts.**"))] | order(orderRank asc, menuOrder asc, _createdAt asc) [0...$limit] {
    ${mixtapeBaseFields}
  }
`;

export const topMixtapesQuery = `
  *[_type == "mixtape" && defined(orderRank) && !(_id in path("drafts.**"))] 
  | order(orderRank asc) [0...$limit] {
    ${mixtapeBaseFields}
  }
`;

// UPDATED: getMixtape function with new contributor structure
export async function getMixtape(slug: string) {
  try {
    const mixtape = await sanityClient.fetch(
      `
      *[_type == "mixtape" && !(_id in path("drafts.**")) && slug.current == $slug][0] {
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
          image {
            ${imageFragment}
          },
          featured,
          isActive,
          location
        },
        contributorNames,
        _contributorNames,
        releaseDate,
        publishedAt,
        duration,
        tracklist[] {
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
          "productBySku": *[_type == "product" && sku == ^.product._ref][0] {
            ${productReferenceFragment}
          },
          // Fallback lookup by wpProductId
          "productByWpId": *[_type == "product" && wpProductId == ^.wpProductId][0] {
            ${productReferenceFragment}
          }
        },
        tracklistText,
        slug,
        genre,
        featured,
        mixcloudUrl,
        streamingLinks,
        tags,
        credits,
        wpId,
        _createdAt
      }
    `,
      { slug }
    );

    // Post-process to consolidate product data from different lookup methods
    if (mixtape?.tracklist) {
      mixtape.tracklist = mixtape.tracklist.map((track: any) => ({
        ...track,
        // Use whichever product lookup worked
        product: track.product || track.productBySku || track.productByWpId || null
      }));
    }

    if (process.env.NODE_ENV === 'development' && mixtape) {
      const tracksWithProducts = mixtape.tracklist?.filter((track: any) => track.product) || [];
    }

    return mixtape;
  } catch (error) {
    console.error('❌ Error fetching mixtape:', error);
    return null;
  }
}

// Server-side fetch function for mixtapes - ORDERRANK FIRST
export async function getMixtapes(options: { limit?: number; topOnly?: boolean } = {}) {
  try {
    const { limit = 10, topOnly = true } = options;

    let mixtapes;

    if (topOnly) {
      // FIRST: Try mixtapes with orderRank (ordered by orderRank)
      mixtapes = await sanityClient.fetch(topMixtapesQuery, { limit });

      // If no mixtapes with orderRank found, fall back to general query
      if (!mixtapes?.length) {
        mixtapes = await sanityClient.fetch(mixtapeQuery, { limit });
      } else {
      }
    } else {
      // For non-topOnly, use general query that prioritizes orderRank
      mixtapes = await sanityClient.fetch(mixtapeQuery, { limit });
    }

    // Remove duplicates
    const uniqueMixtapes =
      mixtapes?.filter(
        (mixtape: any, index: number, self: any[]) =>
          index === self.findIndex((m: any) => m._id === mixtape._id)
      ) || [];

    return uniqueMixtapes;
  } catch (error) {
    console.error('❌ Error fetching mixtapes from Sanity:', error);
    return [];
  }
}

// Product query using shared fragments
export const productQuery = `
  *[${IN_STOCK_PRODUCT_FILTER}] 
  | order(coalesce(orderRank, menuOrder, _createdAt) asc) [0...$limit] {
    _id,
    _createdAt,
    _updatedAt,
    title,
    artist,
    format,
    week,
    category,
    menuOrder,
    orderRank,
    inStock,
    stock,
    stockLevel,
    needsSwellSync,
    swellProductId,
    sku,
    "slug": coalesce(swellSlug, slug.current, sku, _id),
    swellSlug,
    price,
    description,
    catalog,
    label,
    released,
    country,
    genre,
    "imageUrl": mainImage.asset->url,
    "imageAlt": mainImage.alt,
    "imageLqip": mainImage.asset->metadata.lqip,
    "imageDimensions": mainImage.asset->metadata.dimensions,
    gallery[] {
      "url": asset->url,
      "alt": alt,
      "lqip": asset->metadata.lqip,
      "dimensions": asset->metadata.dimensions
    },
    ${tracklistFragment},
    featured
  }
`;

export const topProductsQuery = `
  *[_type == "product" && defined(orderRank) && !(_id in path("drafts.**")) && defined(mainImage.asset->url) && (stock > 0 || stockLevel > 0)] 
  | order(orderRank asc) [0...$limit] {
    _id,
    _createdAt,
    _updatedAt,
    title,
    artist,
    format,
    week,
    category,
    menuOrder,
    orderRank,
    inStock,
    stock,
    stockLevel,
    needsSwellSync,
    swellProductId,
    sku,
    "slug": coalesce(swellSlug, slug.current, sku, _id),
    swellSlug,
    price,
    description,
    catalog,
    label,
    released,
    country,
    genre,
    "imageUrl": mainImage.asset->url,
    "imageAlt": mainImage.alt,
    "imageLqip": mainImage.asset->metadata.lqip,
    "imageDimensions": mainImage.asset->metadata.dimensions,
    gallery[] {
      "url": asset->url,
      "alt": alt,
      "lqip": asset->metadata.lqip,
      "dimensions": asset->metadata.dimensions
    },
    ${tracklistFragment},
    featured
  }
`;

// Server-side fetch function for products
export async function getProducts(options: { limit?: number; topOnly?: boolean } = {}) {
  try {
    const { limit = 12, topOnly = true } = options;

    // Use topProductsQuery by default to get products ordered by orderRank (rank order)
    const query = topOnly ? topProductsQuery : productQuery;
    const products = await sanityClient.fetch(query, { limit });

    return products || [];
  } catch (error) {
    console.error('Error fetching products from Sanity:', error);
    return [];
  }
}

// UPDATED: Product content query with new contributor structure
export const productContentQuery = `
  *[_type == "product" && swellProductId == $productId][0]{
    _id,
    title,
    description,
    artist,
    features,
    catalog,
    label,
    format,
    released,
    country,
    genre,
    specifications,
    sku,
    swellSlug,
    gallery[] {
      ${IMAGE_FRAGMENT || imageFragment}
    },
    seo {
      title,
      description,
      keywords
    },
    swellProductId,
    discogsReleaseId,
    ${tracklistFragment},
    inMixtapes[]{
      _type,
      mixtape->{
        _id,
        title,
        slug { current },
        featuredImage {
          ${IMAGE_FRAGMENT || imageFragment}
        },
        mixcloudUrl,
        publishedAt,
        // UPDATED: New contributor structure
        contributors[]->{
          _id,
          name,
          slug,
          featured,
          isActive,
          location,
          image {
            ${IMAGE_FRAGMENT || imageFragment}
          }
        },
        contributorNames,
        _contributorNames
      },
      trackTitle,
      trackArtist,
      publishedAt
    }
  }
`;

export async function getSanityProductContent(swellProductId: string) {
  try {
    const content = await sanityClient.fetch(productContentQuery, {
      productId: swellProductId
    });

    return content || null;
  } catch (error) {
    console.error('Error fetching Sanity content:', error);
    return null;
  }
}

// UPDATED: Dynamic mixtape search function with new contributor structure
export async function getProductMixtapes(
  sanityProductId: string,
  sku?: string,
  swellProductId?: string
) {
  try {
    // Search for mixtapes that reference this product in various ways
    const mixtapes = await sanityClient.fetch(
      `
      *[_type == "mixtape" && !(_id in path("drafts.**"))] {
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
          isActive,
          location,
          image {
            ${imageFragment}
          }
        },
        contributorNames,
        _contributorNames,
        // Check if this product appears in the tracklist
        "matchingTracks": tracklist[
          productId == $sanityProductId || 
          product._ref == $sanityProductId ||
          product._ref == $sku ||
          wpProductId == $swellProductId
        ] {
          _key,
          trackTitle,
          artist,
          productId,
          wpProductId
        }
      }[count(matchingTracks) > 0] {
        _id,
        title,
        slug,
        featuredImage,
        mixcloudUrl,
        publishedAt,
        contributors,
        contributorNames,
        _contributorNames,
        "trackTitle": matchingTracks[0].trackTitle,
        "trackArtist": matchingTracks[0].artist
      }
    `,
      {
        sanityProductId,
        sku: sku || '',
        swellProductId: swellProductId || ''
      }
    );

    // Transform to match the inMixtapes structure
    const formattedMixtapes =
      mixtapes?.map((mixtape: any) => ({
        _type: 'mixtapeReference',
        mixtape: {
          _id: mixtape._id,
          title: mixtape.title,
          slug: mixtape.slug,
          featuredImage: mixtape.featuredImage,
          mixcloudUrl: mixtape.mixcloudUrl,
          publishedAt: mixtape.publishedAt,
          contributors: mixtape.contributors,
          contributorNames: mixtape.contributorNames,
          _contributorNames: mixtape._contributorNames
        },
        trackTitle: mixtape.trackTitle,
        trackArtist: mixtape.trackArtist,
        publishedAt: mixtape.publishedAt
      })) || [];

    return formattedMixtapes;
  } catch (error) {
    console.error('Error searching for product mixtapes:', error);
    return [];
  }
}

// Enhanced product content function that uses dynamic search as fallback
export async function getEnhancedSanityProductContent(swellProductId: string) {
  try {
    // First try the existing function
    let content = await getSanityProductContent(swellProductId);

    if (!content) {
      return null;
    }

    // If inMixtapes is missing or empty, try dynamic search
    if (!content.inMixtapes || content.inMixtapes.length === 0) {
      const dynamicMixtapes = await getProductMixtapes(
        content._id,
        content.sku,
        content.swellProductId
      );

      content.inMixtapes = dynamicMixtapes;
    }

    return content;
  } catch (error) {
    console.error('Error fetching enhanced Sanity content:', error);
    return null;
  }
}

export { sanityClient };
