// components/ui/ScrollToTop.tsx
'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';

export function ScrollToTop() {
  const pathname = usePathname();
  const hasUserScrolled = useRef(false);
  const isActive = useRef(true);
  const timeoutsRef = useRef<NodeJS.Timeout[]>([]);

  useEffect(() => {
    hasUserScrolled.current = false;
    isActive.current = true;

    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];

    const scrollToTop = () => {
      if (!isActive.current || hasUserScrolled.current) return;

      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    };

    const handleUserScroll = () => {
      if (window.scrollY > 100) {
        hasUserScrolled.current = true;
        isActive.current = false;
        timeoutsRef.current.forEach(clearTimeout);
        timeoutsRef.current = [];
      }
    };

    const handleLayoutShift = () => {
      if (!hasUserScrolled.current && isActive.current && window.scrollY > 50) {
        requestAnimationFrame(scrollToTop);
      }
    };

    window.addEventListener('scroll', handleUserScroll, { passive: true });

    const resizeObserver = new ResizeObserver(() => {
      if (isActive.current) handleLayoutShift();
    });

    const mutationObserver = new MutationObserver((mutations) => {
      if (!isActive.current) return;

      const hasSignificantChange = mutations.some(
        (mutation) =>
          mutation.type === 'childList' &&
          Array.from(mutation.addedNodes).some(
            (node) =>
              node.nodeType === Node.ELEMENT_NODE &&
              (node as Element).getBoundingClientRect().height > 200
          )
      );

      if (hasSignificantChange) {
        handleLayoutShift();
      }
    });

    resizeObserver.observe(document.body);
    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true
    });

    scrollToTop();

    timeoutsRef.current = [
      setTimeout(scrollToTop, 100),
      setTimeout(scrollToTop, 300),
      setTimeout(() => {
        isActive.current = false;
      }, 2000)
    ];

    return () => {
      isActive.current = false;
      window.removeEventListener('scroll', handleUserScroll);
      resizeObserver.disconnect();
      mutationObserver.disconnect();
      timeoutsRef.current.forEach(clearTimeout);
      timeoutsRef.current = [];
    };
  }, [pathname]);

  useEffect(() => {
    if (window.scrollY > 0) {
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      window.scrollTo(0, 0);
    }
  }, []);

  return null;
}
