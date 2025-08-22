// components/header/sticky-logotype.tsx
'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import ActiveLink from './active-link';

interface StickyLogotypeProps {
  siteName: string;
}

export default function StickyLogotype({ siteName }: StickyLogotypeProps) {
  const [isMounted, setIsMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const getRemInPixels = useCallback((rem: number): number => {
    if (typeof window === 'undefined') return rem * 16;
    const fontSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
    return rem * fontSize;
  }, []);

  // Hover logic for video control
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleMouseEnter = () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
        hoverTimeoutRef.current = null;
      }
      document.dispatchEvent(new CustomEvent('sitename:hover:enter'));
    };

    const handleMouseLeave = () => {
      hoverTimeoutRef.current = setTimeout(() => {
        document.dispatchEvent(new CustomEvent('sitename:hover:leave'));
        hoverTimeoutRef.current = null;
      }, 50);
    };

    container.addEventListener('mouseenter', handleMouseEnter);
    container.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      container.removeEventListener('mouseenter', handleMouseEnter);
      container.removeEventListener('mouseleave', handleMouseLeave);
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  // Scroll positioning logic
  useEffect(() => {
    if (!isMounted) return;

    const innerDiv = containerRef.current?.querySelector('div') as HTMLElement;
    if (!innerDiv) return;

    const currentScrollY = window.scrollY;
    const maxOffset = getRemInPixels(2.6);

    // If we're at the top of a new page, start from "scrolled" position and animate to top
    if (currentScrollY === 0) {
      // Start from the "scrolled down" position (no offset)
      innerDiv.style.transform = 'translateY(0px)';
      innerDiv.style.transition = 'none';

      // After a brief moment, animate to the correct top position
      requestAnimationFrame(() => {
        innerDiv.style.transition = 'transform 0.6s ease-out';
        innerDiv.style.transform = `translateY(${maxOffset}px)`;
      });
    } else {
      // Normal case: set position immediately without animation
      const offset = Math.max(0, maxOffset - currentScrollY);
      innerDiv.style.transform = `translateY(${offset}px)`;
      innerDiv.style.transition = 'none';
    }

    const updatePosition = () => {
      const scrollY = window.scrollY;
      const offset = Math.max(0, maxOffset - scrollY);
      innerDiv.style.transform = `translateY(${offset}px)`;
    };

    // Enable smooth transitions for scroll events only
    let ticking = false;
    const throttledHandleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          // Use faster transition for scroll (no easing)
          innerDiv.style.transition = 'transform 0.05s linear';
          updatePosition();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', throttledHandleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', throttledHandleScroll);
    };
  }, [isMounted, getRemInPixels]);

  return (
    <div ref={containerRef} className="logotype col-auto">
      <div
        style={{
          willChange: 'transform'
          // Transform and transition will be applied via useEffect
        }}
      >
        <ActiveLink href="/" className="mono outline" exact>
          {siteName || 'The Mixtape Club'}
        </ActiveLink>
      </div>
    </div>
  );
}
