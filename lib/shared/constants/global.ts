// lib/shared/constants/global.ts

export const HIDDEN_PRODUCT_TAG = 'hidden';
export const PLACEHOLDER_IMAGE = '/placeholder.jpg';
export const DEFAULT_OPTION = 'Default';

export interface SortFilterItem {
  title: string;
  slug: string | null;
  sortKey: string;
  reverse: boolean;
  name?: string;
}

export const defaultSort: SortFilterItem = {
  title: 'Latest',
  slug: 'latest-desc',
  sortKey: 'CREATED_AT',
  reverse: true,
  name: 'Latest'
};

export const sorting: SortFilterItem[] = [
  defaultSort,
  {
    title: 'Price: Low to high',
    slug: 'price-asc',
    sortKey: 'PRICE',
    reverse: false,
    name: 'Price: Low to high'
  },
  {
    title: 'Price: High to low',
    slug: 'price-desc',
    sortKey: 'PRICE',
    reverse: true,
    name: 'Price: High to low'
  },
  {
    title: 'Title: Low to high',
    slug: 'title-asc',
    sortKey: 'TITLE',
    reverse: false,
    name: 'Title: Low to high'
  },
  {
    title: 'Title: High to low',
    slug: 'title-desc',
    sortKey: 'TITLE',
    reverse: true,
    name: 'Title: High to low'
  },
  {
    title: 'Artist: Low to high',
    slug: 'artist-asc',
    sortKey: 'ARTIST',
    reverse: false,
    name: 'Artist: Low to high'
  },
  {
    title: 'Artist: High to low',
    slug: 'artist-desc',
    sortKey: 'ARTIST',
    reverse: true,
    name: 'Artist: High to low'
  }
];
