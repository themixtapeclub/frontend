// lib/data/products/index/services/cache.ts

import { CACHE_DURATION } from '../constants';
import type { MergedProduct } from '../types';

interface BatchProductsCache {
  featured: MergedProduct[];
  new: MergedProduct[];
  timestamp: number;
}

interface NewProductsCache {
  products: MergedProduct[];
  timestamp: number;
}

let productCache: BatchProductsCache | null = null;
let newProductsCache: NewProductsCache | null = null;

export function isCacheValid(timestamp: number, duration: number = CACHE_DURATION): boolean {
  return Date.now() - timestamp < duration;
}

export function getBatchProductsCache(): BatchProductsCache | null {
  if (productCache && isCacheValid(productCache.timestamp)) {
    return productCache;
  }
  return null;
}

export function setBatchProductsCache(
  featured: MergedProduct[],
  newProducts: MergedProduct[]
): void {
  productCache = {
    featured,
    new: newProducts,
    timestamp: Date.now()
  };
}

export function getNewProductsCache(): MergedProduct[] | null {
  if (newProductsCache && isCacheValid(newProductsCache.timestamp)) {
    return newProductsCache.products;
  }
  return null;
}

export function setNewProductsCache(products: MergedProduct[]): void {
  newProductsCache = {
    products,
    timestamp: Date.now()
  };
}

export function clearNewProductsCache(): void {
  newProductsCache = null;
}

export function clearAllProductsCache(): void {
  productCache = null;
  newProductsCache = null;
}
