// lib/queries/sanity/layout/submenu.ts (USING ARCHIVED FIELD)
import { groq } from 'next-sanity';
import { sanityClient } from '../core/client'; // Use your existing client

// Types
export interface SubmenuItem {
  _id: string;
  label: string;
  href: string;
  orderRank: string;
  archived: boolean;
  isPage?: boolean;
  isFormat?: boolean;
  relatedGenres?: string[];
  relatedRegions?: string[];
  slug: {
    current: string;
  };
}

export interface SubmenuConfig {
  genreItems: SubmenuItem[];
  formatItems: SubmenuItem[];
}

// GROQ queries
const submenuItemFragment = groq`
  _id,
  label,
  href,
  orderRank,
  archived,
  isPage,
  isFormat,
  relatedGenres,
  relatedRegions,
  slug
`;

const getGenreItemsQuery = groq`
  *[_type == "submenuItem" && archived != true && isFormat != true] | order(orderRank asc) {
    ${submenuItemFragment}
  }
`;

const getFormatItemsQuery = groq`
  *[_type == "submenuItem" && archived != true && isFormat == true] | order(orderRank asc) {
    ${submenuItemFragment}
  }
`;

// Query functions using your existing sanityClient
export async function getSubmenuConfiguration(): Promise<SubmenuConfig> {
  try {
    const [genreItems, formatItems] = await Promise.all([
      sanityClient.fetch<SubmenuItem[]>(getGenreItemsQuery),
      sanityClient.fetch<SubmenuItem[]>(getFormatItemsQuery)
    ]);

    return {
      genreItems: genreItems || [],
      formatItems: formatItems || []
    };
  } catch (error) {
    console.error('Error fetching submenu configuration:', error);
    return {
      genreItems: [],
      formatItems: []
    };
  }
}

// Helper functions
export function buildGenreQuery(item: SubmenuItem): string {
  const queries: string[] = [];

  if (item.slug?.current) {
    queries.push(item.slug.current);
  }

  if (item.relatedGenres?.length) {
    queries.push(...item.relatedGenres);
  }

  if (item.relatedRegions?.length) {
    queries.push(...item.relatedRegions);
  }

  return queries.join(',');
}

export function buildHref(item: SubmenuItem): string {
  if (item.isPage) {
    return item.href;
  }

  if (!item.isFormat && (item.relatedGenres?.length || item.relatedRegions?.length)) {
    const genreQuery = buildGenreQuery(item);
    return `${item.href}?include=${encodeURIComponent(genreQuery)}`;
  }

  return item.href;
}
