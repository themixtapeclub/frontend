// lib/data/submenu.ts
import { sanityClient } from 'lib/queries/sanity/core/client';

export interface SubmenuItem {
  _id: string;
  label: string;
  href: string;
  slug: {
    current: string;
  };
  relatedGenres?: string[];
  relatedFormats?: string[];
  isFormat: boolean;
  isActive: boolean;
  orderRank?: string;
}

export interface SubmenuData {
  items: SubmenuItem[];
}

// Fallback hardcoded menu items (your current default menu)
export const FALLBACK_MENU_ITEMS: SubmenuItem[] = [
  {
    _id: 'fallback-1',
    label: 'New',
    href: '/shop/new',
    slug: { current: 'new' },
    isFormat: false,
    isActive: true
  },
  {
    _id: 'fallback-2',
    label: 'Jazz',
    href: '/shop/jazz',
    slug: { current: 'jazz' },
    relatedGenres: ['Jazz', 'Jazz-Funk', 'Soul-Jazz'],
    isFormat: false,
    isActive: true
  },
  {
    _id: 'fallback-3',
    label: 'Electronic',
    href: '/shop/electronic',
    slug: { current: 'electronic' },
    relatedGenres: ['Electronic', 'House', 'Techno'],
    isFormat: false,
    isActive: true
  },
  {
    _id: 'fallback-4',
    label: 'Vinyl',
    href: '/shop/vinyl',
    slug: { current: 'vinyl' },
    relatedFormats: ['LP', '12"', '7"'],
    isFormat: true,
    isActive: true
  },
  {
    _id: 'fallback-5',
    label: 'CD',
    href: '/shop/cd',
    slug: { current: 'cd' },
    relatedFormats: ['CD', '2xCD'],
    isFormat: true,
    isActive: true
  }
];

export async function getSubmenuData(): Promise<SubmenuData | null> {
  const query = `
    *[_type == "submenuItem" && archived != true] {
      _id,
      label,
      href,
      slug,
      relatedGenres,
      relatedFormats,
      isFormat,
      isActive,
      orderRank
    }
  `;

  try {
    const data = await sanityClient.fetch(query);

    // If no data from Sanity, return fallback
    if (!data || data.length === 0) {
      return { items: FALLBACK_MENU_ITEMS };
    }

    // FIXED: Sort by orderRank in JavaScript to handle edge cases
    const sortedData = data.sort((a: SubmenuItem, b: SubmenuItem) => {
      // Handle null/undefined orderRank values
      const aRank = a.orderRank
        ? parseFloat(a.orderRank.split('|')[1]?.split(':')[0] || '0')
        : 999999;
      const bRank = b.orderRank
        ? parseFloat(b.orderRank.split('|')[1]?.split(':')[0] || '0')
        : 999999;

      return aRank - bRank;
    });

    // Log the ordering to debug
    if (process.env.NODE_ENV === 'development') {
      console.log('📋 Submenu items ordered by orderRank:');
      sortedData.forEach((item: SubmenuItem, index: number) => {
        const rankNum = item.orderRank
          ? parseFloat(item.orderRank.split('|')[1]?.split(':')[0] || '0')
          : 'no rank';
        console.log(`${index + 1}. ${item.label} (orderRank: ${rankNum})`);
      });
    }

    return { items: sortedData };
  } catch (error) {
    console.error('Error fetching submenu data:', error);
    // Return fallback menu on error
    return { items: FALLBACK_MENU_ITEMS };
  }
}

// Cached version for better performance
let cachedSubmenuData: SubmenuData | null = null;
let lastFetchTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export async function getCachedSubmenuData(): Promise<SubmenuData | null> {
  const now = Date.now();

  // Return cached data if still valid
  if (cachedSubmenuData && now - lastFetchTime < CACHE_DURATION) {
    return cachedSubmenuData;
  }

  // Fetch fresh data
  const data = await getSubmenuData();

  if (data) {
    cachedSubmenuData = data;
    lastFetchTime = now;
  }

  return data;
}
