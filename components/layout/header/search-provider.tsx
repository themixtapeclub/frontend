// components/layout/header/search-provider.tsx
'use client';

import { useRouter } from 'next/navigation';
import { ReactNode, createContext, useContext, useEffect, useState } from 'react';

interface SearchContextType {
  isSearchVisible: boolean;
  toggleSearch: () => void;
  closeSearch: () => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export function useSearch() {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
}

interface SearchProviderProps {
  children: ReactNode;
}

function SearchProvider({ children }: SearchProviderProps) {
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const router = useRouter();

  const toggleSearch = () => {
    setIsSearchVisible(!isSearchVisible);
  };

  const closeSearch = () => {
    setIsSearchVisible(false);
  };

  useEffect(() => {
    // Close search when any link is clicked anywhere on the page
    const handleLinkClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;

      // Check if the clicked element is a link or inside a link
      const link = target.closest('a');
      if (link && isSearchVisible) {
        // Only close if it's an actual navigation link (has href)
        if (link.href && !link.href.startsWith('javascript:') && !link.href.startsWith('#')) {
          closeSearch();
        }
      }
    };

    // Close search when mobile menu button is clicked
    const handleMainMenuClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;

      // Check if clicked element is mobile menu button or its children (hamburger bars)
      const MainMenuButton =
        target.closest('[data-mobile-menu-toggle]') ||
        target.closest('.mobile-menu-button') ||
        target.closest('button[aria-label*="menu"]') ||
        target.closest('button[aria-label*="Menu"]');

      if (MainMenuButton && isSearchVisible) {
        closeSearch();
      }
    };

    // Close search on browser navigation (back/forward buttons)
    const handlePopState = () => {
      if (isSearchVisible) {
        closeSearch();
      }
    };

    // Add event listeners
    document.addEventListener('click', handleLinkClick);
    document.addEventListener('click', handleMainMenuClick);
    window.addEventListener('popstate', handlePopState);

    // Cleanup
    return () => {
      document.removeEventListener('click', handleLinkClick);
      document.removeEventListener('click', handleMainMenuClick);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isSearchVisible]);

  // Close search when route changes (programmatic navigation)
  useEffect(() => {
    const handleRouteChange = () => {
      if (isSearchVisible) {
        closeSearch();
      }
    };

    // Listen for Next.js route changes
    // Note: This will work with Next.js app router navigation
    const originalPush = router.push;
    const originalReplace = router.replace;

    router.push = (...args) => {
      handleRouteChange();
      return originalPush.apply(router, args);
    };

    router.replace = (...args) => {
      handleRouteChange();
      return originalReplace.apply(router, args);
    };

    // Cleanup
    return () => {
      router.push = originalPush;
      router.replace = originalReplace;
    };
  }, [isSearchVisible, router]);

  // Close search on Escape key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isSearchVisible) {
        closeSearch();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isSearchVisible]);

  return (
    <SearchContext.Provider value={{ isSearchVisible, toggleSearch, closeSearch }}>
      {children}
    </SearchContext.Provider>
  );
}

export default SearchProvider;
