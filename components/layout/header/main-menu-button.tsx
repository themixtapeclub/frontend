// Updated MainMenuButton - close search when opening main menu
'use client';

import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/solid';
import { useMainMenu } from './main-menu-provider';
import { useSearch } from './search-provider'; // Import search context

export default function MainMenuButton() {
  const { isOpen, openMenu, closeMenu } = useMainMenu();
  const { closeSearch } = useSearch(); // Get closeSearch function

  const handleClick = () => {
    console.log('Main menu button clicked!', { isOpen });

    if (isOpen) {
      closeMenu();
    } else {
      // Close search when opening main menu
      closeSearch();

      // Force immediate scroll to top with no transitions when opening menu
      const html = document.documentElement;
      const body = document.body;

      // Store original styles
      const originalHtmlScrollBehavior = html.style.scrollBehavior;
      const originalBodyScrollBehavior = body.style.scrollBehavior;

      // Force auto scroll behavior (no smooth scrolling)
      html.style.scrollBehavior = 'auto';
      body.style.scrollBehavior = 'auto';

      // Multiple aggressive scroll methods
      const scrollToTop = () => {
        html.scrollTop = 0;
        body.scrollTop = 0;
        window.scrollTo(0, 0);
        window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
      };

      // Scroll immediately multiple times
      scrollToTop();
      setTimeout(scrollToTop, 0);
      setTimeout(scrollToTop, 10);

      // Open menu after ensuring we're at top
      setTimeout(() => {
        openMenu();
      }, 20);

      // Restore scroll behavior after menu opens
      setTimeout(() => {
        html.style.scrollBehavior = originalHtmlScrollBehavior;
        body.style.scrollBehavior = originalBodyScrollBehavior;
      }, 50);
    }
  };

  return (
    <button
      onClick={handleClick}
      className="outline"
      aria-label={isOpen ? 'Close main menu' : 'Open main menu'}
      style={{
        width: '1rem',
        height: '1rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        mixBlendMode: 'difference',
        position: 'relative',
        zIndex: 999,
        backgroundColor: 'rgba(255, 255, 255, 0.01)' // Tiny background to enable blending
      }}
    >
      {isOpen ? (
        <XMarkIcon className="outline-icon h-6 w-6" />
      ) : (
        <Bars3Icon className="outline-icon h-6 w-6" />
      )}
    </button>
  );
}
