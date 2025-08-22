// lib/queries/sanity/mixtapes/relatedMixtapes.ts

const RELATED_MIXTAPE_FIELDS = `
  _id,
  _createdAt,
  _updatedAt,
  title,
  slug,
  contributor,
  tags,
  publishedAt,
  modifiedAt,
  featured,
  category,
  mixcloudUrl,
  orderRank,
  menuOrder,
  featuredImage {
    asset -> {
      _id,
      url,
      metadata {
        lqip,
        dimensions {
          width,
          height
        }
      }
    },
    alt,
    wpImageId
  },
  "imageUrl": featuredImage.asset->url,
  "lqipData": featuredImage.asset->metadata.lqip,
  "imageWidth": featuredImage.asset->metadata.dimensions.width,
  "imageHeight": featuredImage.asset->metadata.dimensions.height
`;

const BASE_MIXTAPE_FILTER = '_type == "mixtape" && !(_id in path("drafts.**"))';

class MixtapeCache {
  private cache: Map<string, any>;
  private maxSize: number;
  private ttl: number;

  constructor() {
    this.cache = new Map();
    this.maxSize = 50;
    this.ttl = 1800000; // 30 minutes
  }

  generateKey(mixtapeId: string): string {
    return `mixtape_${mixtapeId}`;
  }

  get(mixtapeId: string): any {
    const key = this.generateKey(mixtapeId);
    const item = this.cache.get(key);

    if (item && Date.now() < item.expiry) {
      return item.data;
    }

    if (item) {
      this.cache.delete(key);
    }
    return null;
  }

  set(mixtapeId: string, data: any): void {
    const key = this.generateKey(mixtapeId);

    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }

    this.cache.set(key, {
      data,
      expiry: Date.now() + this.ttl,
      timestamp: Date.now()
    });
  }

  clear(): void {
    this.cache.clear();
  }
}

const mixtapeCache = new MixtapeCache();

class RelatedMixtapesService {
  async getRelatedMixtapes(currentMixtape: any): Promise<{
    contributorMixtapes: any[];
    tagBasedMixtapes: any[];
  }> {
    const mixtapeId = currentMixtape._id || currentMixtape.id;

    if (!mixtapeId) {
      console.warn('No mixtape ID provided');
      return { contributorMixtapes: [], tagBasedMixtapes: [] };
    }

    const cached = mixtapeCache.get(mixtapeId);
    if (cached) {
      return cached;
    }

    const startTime = performance.now();

    try {
      const result = await this.fetchRelatedMixtapes(currentMixtape);
      const fetchTime = performance.now() - startTime;

      mixtapeCache.set(mixtapeId, result);

      return result;
    } catch (error) {
      console.error('🔄 Mixtape fetch error:', error);

      try {
        const fallbackMixtapes = await this.getFallbackMixtapes(mixtapeId, 6);
        const fallbackResult = {
          contributorMixtapes: [],
          tagBasedMixtapes: fallbackMixtapes
        };

        mixtapeCache.set(mixtapeId, fallbackResult);
        return fallbackResult;
      } catch (fallbackError) {
        return { contributorMixtapes: [], tagBasedMixtapes: [] };
      }
    }
  }

  async fetchRelatedMixtapes(currentMixtape: any): Promise<{
    contributorMixtapes: any[];
    tagBasedMixtapes: any[];
  }> {
    try {
      const enhancedProjection = `{
        ${RELATED_MIXTAPE_FIELDS},
        "matchType": "contributor"
      }`;

      const contributorMatches: any[] = [];
      const tagMatches: any[] = [];

      console.log('🎵 Contributor matches found:', contributorMatches.length);
      console.log('🎵 Tag matches found:', tagMatches.length);

      const contributorIds = new Set(contributorMatches.map((m: any) => m._id));
      const tagOnlyMixtapes = tagMatches
        .filter((mixtape: any) => !contributorIds.has(mixtape._id))
        .map((mixtape: any) => {
          const commonTagCount = mixtape.tagCount || 0;
          const matchPercentage = Math.round(
            (commonTagCount / (currentMixtape.tags?.length || 1)) * 100
          );

          return {
            ...mixtape,
            commonTags: mixtape.commonTags || [],
            commonTagCount,
            totalCurrentTags: currentMixtape.tags?.length || 0,
            matchPercentage,
            similarityScore: (mixtape.exactTagCount || 0) * 200 + matchPercentage,
            resolvedSlug: mixtape.slug?.current || mixtape.slug,
            matchCategory: 'tags'
          };
        })
        .sort((a: any, b: any) => {
          const priorityTags = [
            'dance',
            'groovy',
            'listening',
            'healing',
            'global',
            'chill',
            'nostalgia'
          ];

          const aPriorityTags = (a.commonTags || []).filter((tag: string) =>
            priorityTags.includes(tag.toLowerCase())
          );
          const bPriorityTags = (b.commonTags || []).filter((tag: string) =>
            priorityTags.includes(tag.toLowerCase())
          );

          const aHasPriority = aPriorityTags.length > 0;
          const bHasPriority = bPriorityTags.length > 0;

          if (aHasPriority && !bHasPriority) return -1;
          if (!aHasPriority && bHasPriority) return 1;

          if (b.exactTagCount !== a.exactTagCount) {
            return (b.exactTagCount || 0) - (a.exactTagCount || 0);
          }
          if (b.commonTagCount !== a.commonTagCount) {
            return b.commonTagCount - a.commonTagCount;
          }
          if (b.similarityScore !== a.similarityScore) {
            return b.similarityScore - a.similarityScore;
          }

          const orderRankA = a.orderRank || 'zzz';
          const orderRankB = b.orderRank || 'zzz';
          if (orderRankA !== orderRankB) {
            return orderRankA.localeCompare(orderRankB, undefined, {
              numeric: true,
              sensitivity: 'base'
            });
          }

          const menuOrderA = a.menuOrder || 999999;
          const menuOrderB = b.menuOrder || 999999;
          if (menuOrderA !== menuOrderB) {
            return menuOrderA - menuOrderB;
          }

          const dateA = new Date(a.publishedAt || a.modifiedAt || a._createdAt || 0);
          const dateB = new Date(b.publishedAt || b.modifiedAt || b._createdAt || 0);
          return dateB.getTime() - dateA.getTime();
        });

      const result = {
        contributorMixtapes: contributorMatches.slice(0, 6).map((mixtape: any) => ({
          ...mixtape,
          resolvedSlug: mixtape.slug?.current || mixtape.slug,
          matchCategory: 'contributor'
        })),
        tagBasedMixtapes: tagOnlyMixtapes.slice(0, 12)
      };

      console.log('🎵 Final result:', {
        contributorCount: result.contributorMixtapes.length,
        tagBasedCount: result.tagBasedMixtapes.length
      });

      return result;
    } catch (error) {
      console.error('Error fetching related mixtapes:', error);
      return { contributorMixtapes: [], tagBasedMixtapes: [] };
    }
  }

  async getFallbackMixtapes(currentMixtapeId: string, limit: number): Promise<any[]> {
    try {
      const fallbackMixtapes: any[] = [];

      return fallbackMixtapes.map((mixtape: any) => ({
        ...mixtape,
        commonTags: [],
        commonTagCount: 0,
        totalCurrentTags: 0,
        matchPercentage: 0,
        similarityScore: 0,
        resolvedSlug: mixtape.slug?.current || mixtape.slug,
        isFallback: true
      }));
    } catch (error) {
      return [];
    }
  }

  timeout(ms: number, message: string): Promise<never> {
    return new Promise((_, reject) => setTimeout(() => reject(new Error(message)), ms));
  }
}

const relatedMixtapesService = new RelatedMixtapesService();

export async function getRelatedMixtapes(currentMixtape: any): Promise<{
  contributorMixtapes: any[];
  tagBasedMixtapes: any[];
}> {
  return await relatedMixtapesService.getRelatedMixtapes(currentMixtape);
}

export function preloadRelatedMixtapes(mixtapeId: string): void {
  if (typeof window !== 'undefined' && mixtapeId) {
    setTimeout(() => {
      relatedMixtapesService
        .getRelatedMixtapes({ _id: mixtapeId })
        .catch((err) => console.warn('Background mixtape preload failed:', err.message));
    }, 100);
  }
}

export function clearRelatedMixtapesCache(): void {
  mixtapeCache.clear();
}

if (typeof window !== 'undefined') {
  (window as any).__preloadRelatedMixtapes = preloadRelatedMixtapes;
}
