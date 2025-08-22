// lib/performance-logger.ts
// Add this utility to track what's causing the flash

class PerformanceLogger {
  private startTime: number;
  private events: Array<{ name: string; time: number; duration?: number }> = [];

  constructor() {
    this.startTime = performance.now();
    this.log('🚀 App Start');

    // Log when DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        this.log('📄 DOM Ready');
      });
    } else {
      this.log('📄 DOM Already Ready');
    }

    // Log when everything is loaded
    window.addEventListener('load', () => {
      this.log('🎯 Window Load Complete');
      this.printSummary();
    });

    // Track font loading
    if ('fonts' in document) {
      document.fonts.addEventListener('loadingdone', () => {
        this.log('🔤 Fonts Loaded');
      });
    }

    // Track theme changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          this.log(`🎨 Class Change: ${(mutation.target as Element).className}`);
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });
  }

  log(event: string, details?: any) {
    const now = performance.now();
    const duration = now - this.startTime;

    console.log(`[${duration.toFixed(2)}ms] ${event}`, details || '');

    this.events.push({
      name: event,
      time: now,
      duration
    });
  }

  logComponent(componentName: string, phase: 'start' | 'end') {
    this.log(`🧩 ${componentName} ${phase === 'start' ? 'Started' : 'Finished'}`);
  }

  logHydration(componentName: string) {
    this.log(`💧 ${componentName} Hydrated`);
  }

  logStyleChange(description: string) {
    this.log(`🎨 Style: ${description}`);
  }

  printSummary() {
    console.group('🏁 Performance Summary');
    this.events.forEach((event) => {
      console.log(`${event.duration?.toFixed(2)}ms - ${event.name}`);
    });
    console.groupEnd();
  }
}

// Create global instance
export const perfLogger = typeof window !== 'undefined' ? new PerformanceLogger() : null;

// Helper function for React components
export function logRender(componentName: string, phase: 'start' | 'end' = 'start') {
  perfLogger?.logComponent(componentName, phase);
}

// Helper for hydration tracking
export function logHydration(componentName: string) {
  perfLogger?.logHydration(componentName);
}
