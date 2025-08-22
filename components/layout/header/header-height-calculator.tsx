// components/layout/header/header-height-calculator.tsx

'use client';

import { useEffect } from 'react';

export default function HeaderHeightCalculator() {
  useEffect(() => {
    const calculateHeaderHeight = () => {
      const monogram =
        document.querySelector('[data-monogram]') ||
        document.querySelector('.monogram') ||
        document.querySelector('#monogram');

      if (monogram) {
        const height = (monogram as HTMLElement).offsetHeight;
        document.documentElement.style.setProperty('--header-height', `${height}px`);
      }
    };

    calculateHeaderHeight();

    document.fonts.ready.then(calculateHeaderHeight);

    window.addEventListener('resize', calculateHeaderHeight);

    return () => window.removeEventListener('resize', calculateHeaderHeight);
  }, []);

  return null;
}
