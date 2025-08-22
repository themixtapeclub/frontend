// lib/cache/coordinatedCache.ts

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  hits: number;
  size: number; // Estimated memory size
}

interface CacheConfig {
  ttl: number;
  maxSize: number;
  maxMemory: number; // Max memory in MB
}

class CoordinatedCache {
  private caches = new Map<string, Map<string, CacheEntry<any>>>();
  private configs = new Map<string, CacheConfig>();
  private totalMemory = 0;
  private readonly MAX_TOTAL_MEMORY = 50; // 50MB total limit

  constructor() {
    // Setup default cache namespaces with appropriate configs
    this.createNamespace('products', {
      ttl: 10 * 60 * 1000, // 10 minutes (reduced from 24h)
      maxSize: 100,
      maxMemory: 20 // 20MB for products
    });

    this.createNamespace('relatedProducts', {
      ttl: 5 * 60 * 1000, // 5 minutes
      maxSize: 200,
      maxMemory: 15 // 15MB for related products
    });

    this.createNamespace('images', {
      ttl: 30 * 60 * 1000, // 30 minutes
      maxSize: 500,
      maxMemory: 10 // 10MB for image metadata
    });

    this.createNamespace('promises', {
      ttl: 2 * 60 * 1000, // 2 minutes (short-lived)
      maxSize: 50,
      maxMemory: 5 // 5MB for promise cache
    });

    // Periodic cleanup every 2 minutes
    setInterval(() => this.globalCleanup(), 2 * 60 * 1000);
  }

  createNamespace(name: string, config: CacheConfig) {
    this.caches.set(name, new Map());
    this.configs.set(name, config);
  }

  private estimateSize(data: any): number {
    try {
      return JSON.stringify(data).length / 1024 / 1024; // Size in MB
    } catch {
      return 0.1; // Default 0.1MB if can't serialize
    }
  }

  private evictLRU(namespace: string) {
    const cache = this.caches.get(namespace);
    const config = this.configs.get(namespace);
    if (!cache || !config) return;

    // Sort by hits (ascending) and timestamp (ascending) for LRU
    const entries = Array.from(cache.entries()).sort((a, b) => {
      const hitsCompare = a[1].hits - b[1].hits;
      if (hitsCompare !== 0) return hitsCompare;
      return a[1].timestamp - b[1].timestamp;
    });

    // Remove oldest 25% of entries
    const toRemove = Math.ceil(entries.length * 0.25);
    for (let i = 0; i < toRemove && i < entries.length; i++) {
      const [key, entry] = entries[i];
      cache.delete(key);
      this.totalMemory -= entry.size;
    }
  }

  private cleanupNamespace(namespace: string) {
    const cache = this.caches.get(namespace);
    const config = this.configs.get(namespace);
    if (!cache || !config) return;

    const now = Date.now();
    let removedMemory = 0;

    // Remove expired entries
    for (const [key, entry] of cache.entries()) {
      if (now - entry.timestamp > config.ttl) {
        cache.delete(key);
        removedMemory += entry.size;
      }
    }

    this.totalMemory -= removedMemory;

    // Check size limits and evict if needed
    if (cache.size > config.maxSize) {
      this.evictLRU(namespace);
    }

    // Check memory limit for this namespace
    const namespaceMemory = Array.from(cache.values()).reduce((sum, entry) => sum + entry.size, 0);
    if (namespaceMemory > config.maxMemory) {
      this.evictLRU(namespace);
    }
  }

  private globalCleanup() {
    // Clean all namespaces
    for (const namespace of this.caches.keys()) {
      this.cleanupNamespace(namespace);
    }

    // Global memory check - if still over limit, aggressive cleanup
    if (this.totalMemory > this.MAX_TOTAL_MEMORY) {
      // Find largest namespaces and clean them more aggressively
      const namespaceSizes = Array.from(this.caches.entries())
        .map(([name, cache]) => ({
          name,
          memory: Array.from(cache.values()).reduce((sum, entry) => sum + entry.size, 0)
        }))
        .sort((a, b) => b.memory - a.memory);

      // Clean largest namespaces first
      for (const { name } of namespaceSizes.slice(0, 2)) {
        this.evictLRU(name);
      }
    }
  }

  set<T>(namespace: string, key: string, data: T): boolean {
    const cache = this.caches.get(namespace);
    const config = this.configs.get(namespace);
    if (!cache || !config) return false;

    const size = this.estimateSize(data);

    // Reject if single item too large
    if (size > config.maxMemory * 0.5) {
      return false;
    }

    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      hits: 0,
      size
    };

    // Remove existing entry if updating
    const existing = cache.get(key);
    if (existing) {
      this.totalMemory -= existing.size;
    }

    cache.set(key, entry);
    this.totalMemory += size;

    // Trigger cleanup if needed
    if (cache.size > config.maxSize || this.totalMemory > this.MAX_TOTAL_MEMORY) {
      this.cleanupNamespace(namespace);
    }

    return true;
  }

  get<T>(namespace: string, key: string): T | null {
    const cache = this.caches.get(namespace);
    const config = this.configs.get(namespace);
    if (!cache || !config) return null;

    const entry = cache.get(key);
    if (!entry) return null;

    // Check if expired
    if (Date.now() - entry.timestamp > config.ttl) {
      cache.delete(key);
      this.totalMemory -= entry.size;
      return null;
    }

    // Update hit count for LRU
    entry.hits++;

    return entry.data;
  }

  delete(namespace: string, key: string): boolean {
    const cache = this.caches.get(namespace);
    if (!cache) return false;

    const entry = cache.get(key);
    if (entry) {
      this.totalMemory -= entry.size;
      return cache.delete(key);
    }
    return false;
  }

  clear(namespace?: string) {
    if (namespace) {
      const cache = this.caches.get(namespace);
      if (cache) {
        // Subtract memory for this namespace
        const namespaceMemory = Array.from(cache.values()).reduce(
          (sum, entry) => sum + entry.size,
          0
        );
        this.totalMemory -= namespaceMemory;
        cache.clear();
      }
    } else {
      // Clear all
      this.caches.forEach((cache) => cache.clear());
      this.totalMemory = 0;
    }
  }

  getStats() {
    const stats = {
      totalMemory: this.totalMemory,
      namespaces: {} as Record<
        string,
        {
          size: number;
          memory: number;
          hitRate: number;
        }
      >
    };

    for (const [name, cache] of this.caches.entries()) {
      const entries = Array.from(cache.values());
      const totalHits = entries.reduce((sum, entry) => sum + entry.hits, 0);
      const memory = entries.reduce((sum, entry) => sum + entry.size, 0);

      stats.namespaces[name] = {
        size: cache.size,
        memory: Math.round(memory * 100) / 100,
        hitRate: cache.size > 0 ? Math.round((totalHits / cache.size) * 100) / 100 : 0
      };
    }

    return stats;
  }
}

// Global coordinated cache instance
export const coordinatedCache = new CoordinatedCache();

// Convenience functions for each namespace
export const productCache = {
  set: <T>(key: string, data: T) => coordinatedCache.set('products', key, data),
  get: <T>(key: string) => coordinatedCache.get<T>('products', key),
  delete: (key: string) => coordinatedCache.delete('products', key),
  clear: () => coordinatedCache.clear('products')
};

export const relatedProductsCache = {
  set: <T>(key: string, data: T) => coordinatedCache.set('relatedProducts', key, data),
  get: <T>(key: string) => coordinatedCache.get<T>('relatedProducts', key),
  delete: (key: string) => coordinatedCache.delete('relatedProducts', key),
  clear: () => coordinatedCache.clear('relatedProducts')
};

export const imageCache = {
  set: <T>(key: string, data: T) => coordinatedCache.set('images', key, data),
  get: <T>(key: string) => coordinatedCache.get<T>('images', key),
  delete: (key: string) => coordinatedCache.delete('images', key),
  clear: () => coordinatedCache.clear('images')
};

export const promiseCache = {
  set: <T>(key: string, data: T) => coordinatedCache.set('promises', key, data),
  get: <T>(key: string) => coordinatedCache.get<T>('promises', key),
  delete: (key: string) => coordinatedCache.delete('promises', key),
  clear: () => coordinatedCache.clear('promises')
};

// Development helper
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).cacheStats = () => {
    console.table(coordinatedCache.getStats());
    return coordinatedCache.getStats();
  };
}
