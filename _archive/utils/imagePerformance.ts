// utils/imagePerformance.ts - Performance tracking utilities

export class ImagePerformanceTracker {
  private static metrics: Array<{
    url: string;
    loadTime: number;
    size?: number;
    timestamp: number;
  }> = [];

  static trackImageLoad(url: string, loadTime: number, size?: number) {
    this.metrics.push({
      url: url.split('/').pop() || 'unknown',
      loadTime,
      size,
      timestamp: Date.now()
    });

    // Log slow images
    // if (loadTime > 500) {
    //   console.warn(`🐌 Slow image load: ${url.split('/').pop()} took ${loadTime.toFixed(2)}ms`);
    // }

    // Send to analytics if in production
    if (process.env.NODE_ENV === 'production') {
      // Replace with your analytics service
      // analytics.track('image_load', { url, loadTime, size });
    }
  }

  static getMetrics() {
    if (this.metrics.length === 0) return null;

    const totalLoadTime = this.metrics.reduce((sum, m) => sum + m.loadTime, 0);
    const averageLoadTime = totalLoadTime / this.metrics.length;
    const slowImages = this.metrics.filter((m) => m.loadTime > 300);

    return {
      totalImages: this.metrics.length,
      averageLoadTime: averageLoadTime.toFixed(2),
      slowImages: slowImages.length,
      slowImageUrls: slowImages.map((m) => m.url)
    };
  }

  static logSummary() {
    const metrics = this.getMetrics();
    if (!metrics) {
      // console.log('📊 No image metrics collected');
      return;
    }

    // console.log('📊 IMAGE PERFORMANCE SUMMARY:', metrics);
  }
}

// Test image performance
export function testImagePerformance() {
  if (typeof window === 'undefined') return;

  // console.log('🧪 Starting image performance test...');

  // Measure First Contentful Paint
  const observer = new PerformanceObserver((list) => {
    list.getEntries().forEach((entry) => {
      if (entry.entryType === 'paint') {
        // console.log(`🎨 ${entry.name}: ${entry.startTime.toFixed(2)}ms`);
      }

      if (entry.entryType === 'largest-contentful-paint') {
        // console.log(`🎯 Largest Contentful Paint: ${entry.startTime.toFixed(2)}ms`);
      }
    });
  });

  try {
    observer.observe({ entryTypes: ['paint', 'largest-contentful-paint'] });
  } catch (e) {
    // console.warn('Performance Observer not supported');
  }
}

// Debug image loading
export function debugImageLoading() {
  if (typeof window === 'undefined') return;

  // console.log('🔍 Image Loading Debug Info:');

  // Check if images are loading
  const images = document.querySelectorAll('img');
  images.forEach((img, index) => {
    // console.log(`Image ${index}:`, {
    //   src: img.src,
    //   loaded: img.complete,
    //   loading: img.loading,
    //   sizes: img.sizes,
    //   width: img.naturalWidth,
    //   height: img.naturalHeight
    // });
  });

  // Check for lazy loading support
  // console.log('Lazy loading supported:', 'loading' in HTMLImageElement.prototype);

  // Check network connection
  if ('connection' in navigator) {
    const connection = (navigator as any).connection;
    // console.log('Network:', {
    //   effectiveType: connection.effectiveType,
    //   downlink: connection.downlink,
    //   rtt: connection.rtt
    // });
  }
}

// Environment check
export function checkEnvironment() {
  const requiredEnvVars = {
    NEXT_PUBLIC_SANITY_PROJECT_ID: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    NEXT_PUBLIC_SANITY_DATASET: process.env.NEXT_PUBLIC_SANITY_DATASET,
    NEXT_PUBLIC_SANITY_API_TOKEN: process.env.NEXT_PUBLIC_SANITY_API_TOKEN
  };

  const missing = Object.entries(requiredEnvVars)
    .filter(([key, value]) => !value)
    .map(([key]) => key);

  if (missing.length > 0) {
    // console.error('❌ Missing environment variables:', missing);
    return false;
  }

  // console.log('✅ All required environment variables are set');
  return true;
}
