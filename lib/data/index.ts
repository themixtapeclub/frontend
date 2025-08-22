// lib/data/index.ts
// Main export file for the new dual-source system

export * from './mixtapes';
export * from './products';

// Backward compatibility exports
export {
  getProduct as getEnhancedSanityProductContent,
  getProduct as getSanityProductContent
} from './products';
