// hooks/useNavigationDetection.ts
'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';

interface UseNavigationDetectionProps {
  onNavigate?: () => void;
  onBeforeNavigate?: () => void;
}

export function useNavigationDetection({
  onNavigate,
  onBeforeNavigate
}: UseNavigationDetectionProps = {}) {
  const pathname = usePathname();
  const previousPathname = useRef(pathname);

  useEffect(() => {
    // Detect pathname changes
    if (previousPathname.current !== pathname) {
      console.log('Navigation detected:', previousPathname.current, '->', pathname);
      onNavigate?.();
      previousPathname.current = pathname;
    }
  }, [pathname, onNavigate]);

  useEffect(() => {
    // Handle browser navigation events
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      onBeforeNavigate?.();
    };

    const handlePopState = () => {
      onBeforeNavigate?.();
    };

    // Listen for browser navigation
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handlePopState);

    // Override Link clicks for client-side navigation
    const handleLinkClick = (event: Event) => {
      const target = event.target as HTMLElement;
      const link = target.closest('a');

      if (link && link.href && !link.target && !event.defaultPrevented) {
        // This is a client-side navigation
        const url = new URL(link.href);
        if (url.origin === window.location.origin && url.pathname !== pathname) {
          onBeforeNavigate?.();
        }
      }
    };

    // Listen for all link clicks
    document.addEventListener('click', handleLinkClick, true);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
      document.removeEventListener('click', handleLinkClick, true);
    };
  }, [pathname, onBeforeNavigate]);

  return {
    currentPath: pathname,
    previousPath: previousPathname.current
  };
}
