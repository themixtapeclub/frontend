// lib/sanity.ts - Add missing imports and EXPORT the client
import { createClient } from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';
import {
  imageFragment,
  inMixtapesFragment,
  mixtapeBaseFields,
  tracklistFragment
} from '../../queries/sanity/shared/fragments';

// IMPORT THE CORRECT FRAGMENTS
import { IMAGE_FRAGMENT } from '../../queries/sanity/shared/fragments';

const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  useCdn: true,
  token: process.env.NEXT_PUBLIC_SANITY_API_TOKEN,
  apiVersion: '2023-05-03'
});

const builder = imageUrlBuilder(sanityClient);

// EXPORT THE CLIENT - This was missing!
export { sanityClient as client, sanityClient };
export default sanityClient;

export function urlFor(source: any) {
  return builder.image(source);
}

// Queries using the DRY fragments
export const mixtapeShopOrderableQuery = `
  *[_type == "mixtape" && contributor match "*The Mixtape Shop*" && !(_id in path("drafts.**"))] {
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

// FIXED: Use mixtapeBaseFields fragment instead of manually writing fields
export async function getMixtape(slug: string) {
  try {
    const mixtape = await sanityClient.fetch(
      `
      *[_type == "mixtape" && !(_id in path("drafts.**")) && slug.current == $slug][0] {
        ${mixtapeBaseFields},
        publishedAt,
        mixcloudUrl,
        streamingLinks,
        tags,
        credits,
        wpId
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
    return null;
  }
}

// Individual product content function for SanityProductContext
export async function getSanityProductContent(productId: string) {
  try {
    const query = `*[_type == "product" && !(_id in path("drafts.**")) && _id == $productId][0]{
      _id,
      title,
      description,
      price,
      sku,
      swellSlug,
      swellProductId,
      mainImage {
        ${IMAGE_FRAGMENT || imageFragment}
      },
      gallery[] {
        ${IMAGE_FRAGMENT || imageFragment}
      },
      artist,
      label,
      format,
      genre,
      releaseDate,
      inStock,
      stockCount,
      features,
      catalog,
      released,
      country,
      specifications,
      discogsReleaseId,
      seo {
        title,
        description,
        keywords
      },
      ${tracklistFragment},
      ${inMixtapesFragment}
    }`;

    return await sanityClient.fetch(query, { productId });
  } catch (error) {
    console.error('❌ Error fetching product content:', error);
    return null;
  }
}

// FIXED: Use inMixtapesFragment instead of manually writing fields
export const productContentQuery = `
  *[_type == "product" && !(_id in path("drafts.**")) && swellProductId == $productId][0]{
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
    ${inMixtapesFragment}
  }
`;

// FIXED: Use mixtapeBaseFields instead of manually writing fields
export async function getProductMixtapes(
  sanityProductId: string,
  sku?: string,
  swellProductId?: string
) {
  try {
    const mixtapes = await sanityClient.fetch(
      `
      *[_type == "mixtape" && !(_id in path("drafts.**"))] {
        ${mixtapeBaseFields},
        mixcloudUrl,
        publishedAt,
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
