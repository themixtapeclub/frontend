// components/layout/ViewportPreloader.tsx
'use client';

import { useEffect } from 'react';

export default function ViewportPreloader() {
  useEffect(() => {
    async function setupPreloading() {
      try {
        // Disabled: setupViewportPreloading function doesn't exist
        // const { setupViewportPreloading } = await import(
        //   'lib/queries/sanity/products/relatedProducts'
        // );
        // if (setupViewportPreloading) {
        //   setupViewportPreloading();
        // }
      } catch (error) {
        // Silent fail
      }
    }

    const timer = setTimeout(setupPreloading, 1000);
    return () => clearTimeout(timer);
  }, []);

  return null;
}
