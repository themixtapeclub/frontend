// lib/queries/sanity/features.ts
// Homepage feature swiper functionality with consistent draft exclusion

import { sanityClient } from './core/client';
import { BASE_FEATURE_FILTER } from './core/constants';
import type { Feature } from '../../data/products/types';

export async function getFeatures(limit: number = 5): Promise<Feature[]> {
  try {
    const query = `*[${BASE_FEATURE_FILTER}] | order(coalesce(orderRank, "z") asc, _createdAt desc) [0...${limit}] {
      _id,
      title,
      text,
      slug,
      image {
        asset->{ url },
        alt
      },
      reference-> {
        _type,
        _id,
        title,
        slug,
        // Product fields - add multiple slug options
        sku,
        swellSlug,
        price,
        // Mixtape fields  
        mixcloudUrl
      },
      externalUrl,
      published,
      publishedAt,
      orderRank
    }`;

    const features = await sanityClient.fetch(query);
    return features || [];
  } catch (error) {
    console.error('❌ Error fetching features:', error);
    return [];
  }
}

// Helper function to get the link URL for a feature
export function getFeatureLink(feature: Feature): string {
  // External URL takes priority
  if (feature.externalUrl) {
    return feature.externalUrl;
  }

  // Reference link using referenced item's slug
  if (feature.reference) {
    const { _type, slug, swellSlug, sku } = feature.reference;

    if (_type === 'product') {
      // Try multiple slug options for products
      const productSlug = slug?.current || swellSlug || sku;
      if (productSlug) {
        return `/product/${productSlug}`;
      }
    }

    if (_type === 'mixtape' && slug?.current) {
      return `/mixtape/${slug.current}`;
    }
  }

  // Default fallback
  return '/';
}

// Export the Feature type for convenience
export type { Feature };
