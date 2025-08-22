// lib/queries/sanity/features.ts

import { sanityClient } from 'lib/queries/sanity/core/client';

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
    // Product specific
    sku?: string;
    price?: number;
    // Mixtape specific
    mixcloudUrl?: string;
  };
  externalUrl?: string;
  published: boolean;
  publishedAt?: string;
  orderRank?: string;
}

export async function getFeatures(limit: number = 5): Promise<Feature[]> {
  try {
    const query = `*[_type == "feature" && 
      published == true && 
      !(_id in path("drafts.**")) && 
      defined(image.asset->url)
    ] | order(coalesce(orderRank, "z") asc, _createdAt desc) [0...${limit}] {
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
        const url = `/product/${productSlug}`;
        return url;
      }
    }

    if (_type === 'mixtape' && slug?.current) {
      const url = `/mixtape/${slug.current}`;
      return url;
    }
  }

  // If no reference but has feature slug, assume it's meant to link somewhere
  // Default to root or could be configured differently
  return '/';
}

export default {
  getFeatures,
  getFeatureLink
};
