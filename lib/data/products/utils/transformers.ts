// lib/data/products/utils/transformers.ts

import type { MergedProduct } from '../types';
import { extractString, extractWeek } from './extractors';

export const convertSanityProductOnly = (
  product: any,
  featured: boolean = false
): MergedProduct => {
  const imageUrl = product.imageUrl || product.mainImage?.asset?.url;

  return {
    id: product._id,
    slug: product.swellSlug || product.slug?.current || product.sku || product._id,
    sku: product.sku || product._id,
    name: product.title || 'Untitled',
    price: product.price || product.swellPrice || 0,
    currency: product.swellCurrency || 'USD',
    description: extractString(product.description),
    shortDescription: product.shortDescription || '', // FIXED: Don't use extractString, just pass through
    stock_level: product.stock || 0,
    stock_purchasable: Boolean(product.inStock && (product.stock || 0) > 0),
    stock_tracking: false,
    featured: product.featured || featured,
    sanityContent: product, // This includes the original shortDescription
    title: product.title || 'Untitled',
    artist: extractString(product.artist),
    label: extractString(product.label),
    format: extractString(product.format),
    week: extractWeek(product.week),
    category: extractString(product.category),
    genre: extractString(product.genre),
    country: extractString(product.country),
    released: extractString(product.released),
    catalog: extractString(product.catalog),
    orderRank: product.orderRank,
    menuOrder: product.menuOrder,
    mainImage: product.mainImage,
    additionalImages: product.additionalImages,
    gallery: product.gallery,
    tracklist: product.tracklist || [],
    inMixtapes: product.inMixtapes || [],
    tags: product.tags || [],
    imageUrl: imageUrl,
    productSlug: product.swellSlug || product.slug?.current || product.sku || product._id,
    swellProductId: product.swellProductId
  };
};

export const isProductInStock = (product: MergedProduct): boolean => {
  if (product.stock_level !== undefined && product.stock_level > 0) return true;
  return false;
};
