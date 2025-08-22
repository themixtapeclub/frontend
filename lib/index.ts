// lib/index.ts - Main library exports
// Only export modules that have proper index files to avoid conflicts
export * from './cms';
export * from './commerce';

// Re-export specific items to avoid naming conflicts
export { 
  getProductsByArchive,
  getNewProductsCached
} from './data/products';

export { 
  validateEnvironmentVariables,
  ensureStartsWith,
  createUrl
} from './utils/core';

export { slugToDisplayName } from './utils/slug';
