// components/layout/flash-detector.tsx
'use client';

import { useEffect, useRef } from 'react';

export default function FlashDetector() {
  const observerRef = useRef<MutationObserver | null>(null);
  const styleSnapshotRef = useRef<string[]>([]);

  useEffect(() => {
    // Initialize performance tracking
    const startTime = performance.now();
    console.log('🔍 [FLASH] Flash detector mounted');

    // Take initial style snapshot
    const takeStyleSnapshot = (label: string) => {
      const snapshot = {
        htmlClasses: document.documentElement.className,
        bodyClasses: document.body.className,
        htmlBg: window.getComputedStyle(document.documentElement).backgroundColor,
        bodyBg: window.getComputedStyle(document.body).backgroundColor,
        bodyColor: window.getComputedStyle(document.body).color
      };

      const snapshotStr = JSON.stringify(snapshot);
      styleSnapshotRef.current.push(snapshotStr);

      console.log(`🔍 [${(performance.now() - startTime).toFixed(2)}ms] ${label}:`, snapshot);

      return snapshot;
    };

    // Initial snapshot
    takeStyleSnapshot('Initial Styles');

    // Watch for style changes
    observerRef.current = new MutationObserver((mutations) => {
      let hasStyleChange = false;

      mutations.forEach((mutation) => {
        if (
          mutation.type === 'attributes' &&
          (mutation.attributeName === 'class' || mutation.attributeName === 'style')
        ) {
          hasStyleChange = true;
        }
      });

      if (hasStyleChange) {
        const duration = performance.now() - startTime;
        takeStyleSnapshot(`Style Change at ${duration.toFixed(2)}ms`);
      }
    });

    // Observe both html and body
    observerRef.current.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'style']
    });

    observerRef.current.observe(document.body, {
      attributes: true,
      attributeFilter: ['class', 'style']
    });

    // Check for changes periodically for the first 5 seconds
    const intervals: NodeJS.Timeout[] = [];
    [100, 200, 500, 1000, 2000, 5000].forEach((delay) => {
      const interval = setTimeout(() => {
        takeStyleSnapshot(`Periodic Check (${delay}ms)`);
      }, delay);
      intervals.push(interval);
    });

    // Track paint events
    const paintObserver = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        const duration = entry.startTime;
        console.log(`🎨 [${duration.toFixed(2)}ms] Paint Event: ${entry.name}`);
      });
    });

    paintObserver.observe({ entryTypes: ['paint'] });

    // Track layout shifts
    const clsObserver = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry: any) => {
        if (entry.value > 0.001) {
          // Only log significant shifts
          console.log(
            `📐 [${entry.startTime.toFixed(2)}ms] Layout Shift: ${entry.value.toFixed(4)}`
          );
        }
      });
    });

    try {
      clsObserver.observe({ entryTypes: ['layout-shift'] });
    } catch (e) {
      console.log('⚠️ Layout shift observer not supported');
    }

    return () => {
      observerRef.current?.disconnect();
      paintObserver.disconnect();
      clsObserver.disconnect();
      intervals.forEach(clearTimeout);

      console.log('🔍 [FLASH] Detector unmounted, final summary:');
      console.log('Style snapshots taken:', styleSnapshotRef.current.length);
    };
  }, []);

  return null; // This component only observes, doesn't render anything
}
