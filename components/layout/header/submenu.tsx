// components/layout/header/submenu.tsx - Uses Sanity data but renders statically
'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  buildHref,
  getSubmenuConfiguration,
  type SubmenuConfig,
  type SubmenuItem
} from '../../../lib/queries/sanity/layout/submenu';
import ActiveLink from './active-link';

interface SubmenuProps {
  className?: string;
  initialConfig?: SubmenuConfig;
}

// Fallback hardcoded data (only used if Sanity fails)
const fallbackConfig: SubmenuConfig = {
  genreItems: [
    {
      _id: '1',
      label: 'New',
      href: '/shop/new',
      orderRank: 'a000',
      archived: false,
      isPage: true,
      slug: { current: 'new' }
    },
    {
      _id: '2',
      label: 'House',
      href: '/shop/genre/house',
      orderRank: 'a001',
      archived: false,
      slug: { current: 'house' }
    },
    {
      _id: '3',
      label: 'Disco',
      href: '/shop/genre/disco',
      orderRank: 'a002',
      archived: false,
      slug: { current: 'disco' }
    },
    {
      _id: '4',
      label: 'Jazz',
      href: '/shop/genre/jazz',
      orderRank: 'a003',
      archived: false,
      slug: { current: 'jazz' }
    },
    {
      _id: '5',
      label: 'Soul/Funk',
      href: '/shop/funk-soul',
      orderRank: 'a004',
      archived: false,
      isPage: true,
      slug: { current: 'funk-soul' }
    },
    {
      _id: '6',
      label: 'Ambient',
      href: '/shop/genre/ambient',
      orderRank: 'a005',
      archived: false,
      slug: { current: 'ambient' }
    },
    {
      _id: '7',
      label: 'Brazil',
      href: '/shop/genre/brazil',
      orderRank: 'a006',
      archived: false,
      slug: { current: 'brazil' }
    },
    {
      _id: '8',
      label: 'Africa',
      href: '/shop/genre/africa',
      orderRank: 'a007',
      archived: false,
      slug: { current: 'africa' }
    },
    {
      _id: '9',
      label: 'Asia',
      href: '/shop/genre/asia',
      orderRank: 'a008',
      archived: false,
      slug: { current: 'asia' }
    },
    {
      _id: '10',
      label: 'Latin',
      href: '/shop/genre/latin',
      orderRank: 'a009',
      archived: false,
      slug: { current: 'latin' }
    },
    {
      _id: '11',
      label: 'World',
      href: '/shop/genre/world',
      orderRank: 'a010',
      archived: false,
      slug: { current: 'world' }
    },
    {
      _id: '12',
      label: 'Reggae',
      href: '/shop/genre/reggae',
      orderRank: 'a011',
      archived: false,
      slug: { current: 'reggae' }
    },
    {
      _id: '13',
      label: 'Electronic',
      href: '/shop/genre/electronic',
      orderRank: 'a012',
      archived: false,
      slug: { current: 'electronic' }
    },
    {
      _id: '14',
      label: 'Techno',
      href: '/shop/genre/techno',
      orderRank: 'a013',
      archived: false,
      isPage: true,
      slug: { current: 'techno' }
    },
    {
      _id: '15',
      label: 'Edits',
      href: '/shop/genre/edits',
      orderRank: 'a014',
      archived: false,
      slug: { current: 'edits' }
    },
    {
      _id: '16',
      label: 'Gospel',
      href: '/shop/genre/gospel',
      orderRank: 'a015',
      archived: false,
      slug: { current: 'gospel' }
    },
    {
      _id: '17',
      label: 'Experimental',
      href: '/shop/genre/experimental',
      orderRank: 'a016',
      archived: false,
      slug: { current: 'experimental' }
    },
    {
      _id: '18',
      label: 'Rock',
      href: '/shop/genre/rock',
      orderRank: 'a017',
      archived: false,
      slug: { current: 'rock' }
    },
    {
      _id: '19',
      label: 'Library',
      href: '/shop/genre/library',
      orderRank: 'a018',
      archived: false,
      slug: { current: 'library' }
    },
    {
      _id: '20',
      label: 'Downtempo',
      href: '/shop/genre/downtempo',
      orderRank: 'a019',
      archived: false,
      slug: { current: 'downtempo' }
    },
    {
      _id: '21',
      label: 'Hip-Hop',
      href: '/shop/genre/hip-hop',
      orderRank: 'a020',
      archived: false,
      slug: { current: 'hip-hop' }
    },
    {
      _id: '22',
      label: 'Rare',
      href: '/shop/genre/rare',
      orderRank: 'a021',
      archived: false,
      slug: { current: 'rare' }
    }
  ],
  formatItems: [
    {
      _id: '30',
      label: '12"',
      href: '/shop/format/12',
      orderRank: 'b000',
      archived: false,
      isFormat: true,
      slug: { current: '12' }
    },
    {
      _id: '31',
      label: 'LP',
      href: '/shop/format/lp',
      orderRank: 'b001',
      archived: false,
      isFormat: true,
      slug: { current: 'lp' }
    },
    {
      _id: '32',
      label: '7"',
      href: '/shop/format/7',
      orderRank: 'b002',
      archived: false,
      isFormat: true,
      slug: { current: '7' }
    },
    {
      _id: '33',
      label: 'Compilation',
      href: '/shop/format/compilation',
      orderRank: 'b003',
      archived: false,
      isFormat: true,
      slug: { current: 'compilation' }
    },
    {
      _id: '34',
      label: 'Original',
      href: '/shop/format/original',
      orderRank: 'b004',
      archived: false,
      isFormat: true,
      slug: { current: 'original' }
    },
    {
      _id: '35',
      label: 'Bundle',
      href: '/shop/format/bundle',
      orderRank: 'b005',
      archived: false,
      isFormat: true,
      slug: { current: 'bundle' }
    },
    {
      _id: '36',
      label: 'Cassette',
      href: '/shop/format/cassette',
      orderRank: 'b006',
      archived: false,
      isFormat: true,
      slug: { current: 'cassette' }
    },
    {
      _id: '37',
      label: 'CD',
      href: '/shop/format/cd',
      orderRank: 'b007',
      archived: false,
      isFormat: true,
      slug: { current: 'cd' }
    },
    {
      _id: '38',
      label: 'Publication',
      href: '/shop/format/publication',
      orderRank: 'b008',
      archived: false,
      isFormat: true,
      slug: { current: 'publication' }
    },
    {
      _id: '39',
      label: 'Merchandise',
      href: '/shop/format/merchandise',
      orderRank: 'b009',
      archived: false,
      isFormat: true,
      slug: { current: 'merchandise' }
    }
  ]
};

export default function Submenu({ className = '', initialConfig }: SubmenuProps) {
  const pathname = usePathname();
  const [config, setConfig] = useState<SubmenuConfig | null>(initialConfig || null);
  const [hasLoaded, setHasLoaded] = useState(!!initialConfig);

  // Load Sanity data ONLY if not provided as prop
  useEffect(() => {
    if (!initialConfig && !hasLoaded) {
      // Load Sanity data in background (no loading state shown)
      getSubmenuConfiguration()
        .then((sanityConfig) => {
          // Use Sanity data if it has content, otherwise keep fallback
          if (sanityConfig.genreItems.length > 0 || sanityConfig.formatItems.length > 0) {
            setConfig(sanityConfig);
          }
          setHasLoaded(true);
        })
        .catch((error) => {
          console.error('Failed to load Sanity submenu config:', error);
          setHasLoaded(true);
        });
    }
  }, [initialConfig, hasLoaded]);

  // Always render immediately - no loading states
  const currentConfig = config || fallbackConfig;

  // Helper function to build href (works with both Sanity and fallback data)
  const getHref = (item: SubmenuItem) => {
    if (item.isPage) {
      return item.href;
    }
    if (typeof buildHref === 'function') {
      return buildHref(item);
    }
    return item.href;
  };

  // Clean URL function to remove ?include= parameters
  const cleanUrl = (url: string): string => {
    return url.split('?')[0];
  };

  return (
    <div
      className={`page-nav submenu mini container-fluid d-none d-md-inline z-3 m-0 p-0 ${className}`}
    >
      {/* Genre Navigation */}
      <div className="genre row position-relative m-0 p-0">
        <div className="d-flex justify-content-center align-items-center genre format m-0 p-0 px-4">
          <ul className="d-sm-flex justify-content-center submenu mono fs-6 m-0 flex-wrap p-0">
            {currentConfig.genreItems.map((item) => (
              <li key={item._id} className="menu-item text-nowrap">
                <ActiveLink
                  href={cleanUrl(getHref(item))}
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

      {/* Format Navigation */}
      <div className="format row position-relative m-0 p-0">
        <div className="d-flex justify-content-center align-items-center format m-0 my-1 p-0 px-4">
          <ul className="d-sm-flex justify-content-center submenu mono fs-6 m-0 flex-wrap p-0">
            {currentConfig.formatItems.map((item) => (
              <li key={item._id} className="menu-item small text-nowrap">
                <ActiveLink
                  href={cleanUrl(getHref(item))}
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
