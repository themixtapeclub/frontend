// components/layout/header/menu.tsx

'use client';

import { useEffect, useState } from 'react';
import ActiveLink from './active-link';
import { useSearch } from './search-provider';

export default function MainMenu() {
  const { isSearchVisible, closeSearch } = useSearch();
  const [isHidden, setIsHidden] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    if (isSearchVisible) {
      setIsTransitioning(true);
      const timer = setTimeout(() => setIsHidden(true), 150);
      return () => clearTimeout(timer);
    } else {
      setIsHidden(false);
      if (isHidden) {
        setIsTransitioning(true);
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setIsTransitioning(false);
          });
        });
      }
    }

    return undefined;
  }, [isSearchVisible, isHidden]);

  const handleLinkClick = () => {
    closeSearch();
  };

  if (isHidden) {
    return null;
  }

  return (
    <div
      className="main-menu d-none d-sm-block d-flex justify-content-center align-items-center mono col-auto"
      style={{
        transition: 'opacity 0.15s ease-out, filter 0.15s ease-out',
        opacity: isTransitioning ? 0 : 1,
        filter: isTransitioning ? 'blur(8px)' : 'blur(0px)',
        willChange: 'opacity, filter'
      }}
    >
      <ul className="d-flex justify-content-start align-items-center w-100 m-auto p-0">
        <li className="menu-item d-inline-flex align-items-center me-3">
          <ActiveLink href="/shop/new" className="outline" onClick={handleLinkClick}>
            Shop
          </ActiveLink>
        </li>
        <li className="menu-item d-inline-flex align-items-center me-3">
          <ActiveLink href="/mixtapes" className="outline" onClick={handleLinkClick}>
            Mixes
          </ActiveLink>
        </li>
        <li className="menu-item d-inline-flex align-items-center me-3">
          <ActiveLink href="/info" className="outline" onClick={handleLinkClick}>
            Info
          </ActiveLink>
        </li>
      </ul>
    </div>
  );
}
