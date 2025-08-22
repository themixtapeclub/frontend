// components/layout/header/mixtapeSubmenu.tsx - Submenu for mixtapes page
'use client';

import { usePathname } from 'next/navigation';
import ActiveLink from './active-link';

interface MixtapeSubmenuProps {
  className?: string;
}

// Hardcoded mixtape navigation items - using /mixtapes/[tag] routes
const mixtapeNavItems = [
  {
    id: '1',
    label: 'All',
    href: '/mixtapes',
    slug: 'all'
  },
  {
    id: '2',
    label: 'Groovy',
    href: '/mixtapes/groovy',
    slug: 'groovy'
  },
  {
    id: '3',
    label: 'Chill',
    href: '/mixtapes/chill',
    slug: 'chill'
  },
  {
    id: '4',
    label: 'Global',
    href: '/mixtapes/global',
    slug: 'global'
  },
  {
    id: '5',
    label: 'Healing',
    href: '/mixtapes/healing',
    slug: 'healing'
  },
  {
    id: '6',
    label: 'Dance',
    href: '/mixtapes/dance',
    slug: 'dance'
  },
  {
    id: '7',
    label: 'Nostalgia',
    href: '/mixtapes/nostalgia',
    slug: 'nostalgia'
  },
  {
    id: '8',
    label: 'Favorites',
    href: '/mixtapes/favorites',
    slug: 'favorites'
  }
];

// Second row of genre/style tags (smaller, like regular submenu)
// Updated with your new order: Disco, Jazz, House, Ambient, Soul, Downtempo...
const mixtapeGenreItems = [
  {
    id: 'g1',
    label: 'Disco',
    href: '/mixtapes/disco',
    slug: 'disco'
  },
  {
    id: 'g2',
    label: 'Jazz',
    href: '/mixtapes/jazz',
    slug: 'jazz'
  },
  {
    id: 'g3',
    label: 'House',
    href: '/mixtapes/house',
    slug: 'house'
  },
  {
    id: 'g4',
    label: 'Ambient',
    href: '/mixtapes/ambient',
    slug: 'ambient'
  },
  {
    id: 'g5',
    label: 'Soul',
    href: '/mixtapes/soul',
    slug: 'soul'
  },
  {
    id: 'g6',
    label: 'Downtempo',
    href: '/mixtapes/downtempo',
    slug: 'downtempo'
  },
  {
    id: 'g7',
    label: 'Funk',
    href: '/mixtapes/funk',
    slug: 'funk'
  },
  {
    id: 'g8',
    label: 'Boogie',
    href: '/mixtapes/boogie',
    slug: 'boogie'
  },
  {
    id: 'g9',
    label: 'World',
    href: '/mixtapes/world',
    slug: 'world'
  },
  {
    id: 'g10',
    label: 'Rare Groove',
    href: '/mixtapes/rare-groove',
    slug: 'rare-groove'
  },
  {
    id: 'g11',
    label: 'Folk',
    href: '/mixtapes/folk',
    slug: 'folk'
  }
];

export default function MixtapeSubmenu({ className = '' }: MixtapeSubmenuProps) {
  const pathname = usePathname();

  // Clean URL function to remove query parameters
  const cleanUrl = (url: string): string => {
    return url.split('?')[0];
  };

  return (
    <div
      className={`page-nav submenu mini container-fluid d-none d-md-inline z-3 m-0 p-0 ${className}`}
    >
      {/* Main Mixtape Navigation - First Row */}
      <div className="mixtape-nav row position-relative m-0 p-0">
        <div className="d-flex justify-content-center align-items-center mixtape format m-0 p-0 px-4">
          <ul className="d-sm-flex justify-content-center submenu mono fs-6 m-0 flex-wrap p-0">
            {mixtapeNavItems.map((item) => (
              <li key={item.id} className="menu-item text-nowrap">
                <ActiveLink
                  href={cleanUrl(item.href)}
                  className="mx-1 px-2"
                  activeClassName="bold"
                  exact={item.slug === 'all'} // Only exact match for "All" link
                >
                  {item.label}
                </ActiveLink>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Genre Navigation - Second Row (smaller) */}
      <div className="genre row position-relative m-0 p-0">
        <div className="d-flex justify-content-center align-items-center genre format m-0 my-1 p-0 px-4">
          <ul className="d-sm-flex justify-content-center submenu mono fs-6 m-0 flex-wrap p-0">
            {mixtapeGenreItems.map((item) => (
              <li key={item.id} className="menu-item small text-nowrap">
                <ActiveLink
                  href={cleanUrl(item.href)}
                  className="mx-1 px-2"
                  activeClassName="bold"
                  exact={true}
                >
                  {item.label}
                </ActiveLink>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
