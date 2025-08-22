// lib/queries/sanity/shared.ts

import { createClient } from '@sanity/client';

// Shared Sanity client
export const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  useCdn: true,
  token: process.env.NEXT_PUBLIC_SANITY_API_TOKEN,
  apiVersion: '2023-05-03'
});

// Shared interfaces
export interface SanityProduct {
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
  orderRank?: string;
  imageUrl?: string;
  hasImage?: boolean;
  featured?: boolean;
}

export interface FormattedProduct {
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
    artist: string[]; // Keep as array for link generation
    label: string[]; // Keep as array for link generation
    genre: string[]; // Keep as array for link generation
    format: string[]; // Keep as array for link generation
  };
  tags: string[];
  _sanityId: string;
  orderRank?: string;
  _createdAt: string;
}

export interface ProductResult {
  products: FormattedProduct[];
  total: number;
  pages: number;
  currentPage: number;
  error?: string;
  actualName?: string; // For archive results
}

// Helper functions to extract array values from complex fields
function extractGenreNames(genre?: Array<{ main?: string; sub?: string } | string>): string[] {
  if (!genre || !Array.isArray(genre)) return [];

  return genre
    .map((g) => {
      if (typeof g === 'object' && g?.main) {
        return g.main;
      }
      return String(g);
    })
    .filter(Boolean);
}

function extractFormatNames(format?: Array<{ main?: string; sub?: string } | string>): string[] {
  if (!format || !Array.isArray(format)) return [];

  return format
    .map((f) => {
      if (typeof f === 'object' && f?.main) {
        return f.main;
      }
      return String(f);
    })
    .filter(Boolean);
}

// Shared helper function
export function formatProductForDisplay(product: SanityProduct): FormattedProduct {
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
      artist: product.artist || [],
      label: product.label || [],
      genre: extractGenreNames(product.genre),
      format: extractFormatNames(product.format)
    },

    tags: product.tags || [],
    _sanityId: product._id,
    orderRank: product.orderRank,
    _createdAt: product._createdAt
  };
}

// Shared sort helper
export function getSortClause(sort: string): string {
  switch (sort) {
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
    case 'orderRank':
    default:
      return 'order(orderRank asc, _createdAt desc)';
  }
}

// Standard product query fields
export const PRODUCT_QUERY_FIELDS = `{
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
  orderRank,
  featured,
  "imageUrl": mainImage.asset->url + "?w=800&h=800&fit=fill&auto=format",
  "hasImage": defined(mainImage.asset->url)
}`;

// Standard product filters
export const STANDARD_PRODUCT_FILTER = `_type == "product" && 
  defined(swellProductId) && 
  defined(mainImage.asset->url)`;
