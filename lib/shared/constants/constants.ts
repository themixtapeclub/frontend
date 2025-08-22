// lib/shared/constants/global.ts - Updated sorting options per requirements

export type SortFilterItem = {
  name: string;
  slug: string | null;
  sortKey:
    | 'RELEVANCE'
    | 'BEST_SELLING'
    | 'CREATED_AT'
    | 'PRICE'
    | 'ARTIST'
    | 'TITLE'
    | 'WEEK'
    | 'ORDER';
  reverse: boolean;
};

export const defaultSort: SortFilterItem = {
  name: 'Newest',
  slug: 'latest-desc',
  sortKey: 'CREATED_AT',
  reverse: true
};

export const sorting: SortFilterItem[] = [
  { name: 'Relevance', slug: null, sortKey: 'RELEVANCE', reverse: false }, // Hidden from UI
  defaultSort, // Newest - this is the new default
  { name: 'Price', slug: 'price-asc', sortKey: 'PRICE', reverse: false }, // Will show up arrow
  { name: 'Price', slug: 'price-desc', sortKey: 'PRICE', reverse: true }, // Will show down arrow
  { name: 'Artist A-Z', slug: 'artist-asc', sortKey: 'ARTIST', reverse: false },
  { name: 'Artist Z-A', slug: 'artist-desc', sortKey: 'ARTIST', reverse: true },
  { name: 'Title A-Z', slug: 'title-asc', sortKey: 'TITLE', reverse: false },
  { name: 'Title Z-A', slug: 'title-desc', sortKey: 'TITLE', reverse: true }
  // Removed: Featured First, Newest Week
];

export const TAGS = {
  collections: 'collections',
  products: 'products',
  cart: 'cart'
};

export const HIDDEN_PRODUCT_TAG = 'nextjs-frontend-hidden';
export const DEFAULT_OPTION = 'Default Title';

export const PLACEHOLDER_IMAGE =
  '/placeholder.jpg';

// Search configuration
export const SEARCH_CONFIG = {
  // Minimum characters before triggering search suggestions
  MIN_SEARCH_LENGTH: 2,

  // Debounce delay for search input (ms)
  SEARCH_DEBOUNCE: 300,

  // Maximum number of suggestions to show
  MAX_SUGGESTIONS: 8,

  // Default search limit
  DEFAULT_SEARCH_LIMIT: 20,

  // Fields to search with their weights (for relevance scoring)
  SEARCH_FIELDS: {
    title: 3, // Highest weight
    artist: 2.5,
    sku: 2,
    catalog: 2,
    label: 1.5,
    description: 1,
    tracklist: 1, // Track titles and artists
    week: 0.5 // Lowest weight
  }
};

// Performance monitoring baselines (ms)
export const PERFORMANCE_BASELINES = {
  SEARCH_QUERY: 500, // Target: under 500ms
  PRODUCT_FETCH: 300, // Target: under 300ms
  CATEGORY_FETCH: 200, // Target: under 200ms
  SUGGESTIONS: 150 // Target: under 150ms
};
