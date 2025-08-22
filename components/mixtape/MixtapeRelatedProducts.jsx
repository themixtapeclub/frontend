// components/MixtapeRelatedProducts.jsx - Optimized with caching and faster loading
'use client';

import { useEffect, useMemo, useState } from 'react';
import { sanityClient } from '../../lib/queries/sanity/core/client';
import { GridContainer } from '../grid/Container';
import { GridItem } from '../grid/Item';
import ProductCard from '../products/ProductCard';

// Cache configuration
const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes
const cache = new Map();

// Cache management functions
function getCacheKey(mixtapeId, tracklistTags, tracklistProductIds) {
  const sortedTags = [...tracklistTags].sort();
  const sortedIds = [...tracklistProductIds].sort();
  return `products-${mixtapeId}-${sortedTags.join(',')}-${sortedIds.join(',')}`;
}

function getCachedResults(cacheKey) {
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  cache.delete(cacheKey);
  return null;
}

function setCachedResults(cacheKey, data) {
  cache.set(cacheKey, {
    data,
    timestamp: Date.now()
  });
}

export default function MixtapeRelatedProducts({ mixtape }) {
  const [relatedProducts, setRelatedProducts] = useState([]);

  // Extract all tags from tracklist products with frequency tracking
  const tracklistTags = useMemo(() => {
    if (!mixtape?.tracklist) return [];

    const tagFrequency = new Map();
    mixtape.tracklist.forEach((track) => {
      const product = track.resolvedProduct || track.product || track.productLookup;
      if (product?.tags) {
        product.tags.forEach((tag) => {
          if (tag && typeof tag === 'string' && tag.trim()) {
            const cleanTag = tag.trim();
            tagFrequency.set(cleanTag, (tagFrequency.get(cleanTag) || 0) + 1);
          }
        });
      }
    });

    // Convert to array sorted by frequency
    const tagsWithFrequency = Array.from(tagFrequency.entries()).map(([tag, count]) => ({
      tag,
      count,
      frequency: count / mixtape.tracklist.length
    }));

    tagsWithFrequency.sort((a, b) => b.count - a.count);
    return tagsWithFrequency.map((item) => item.tag);
  }, [mixtape?.tracklist]);

  // Create tag frequency map for weighted scoring
  const tagFrequencyMap = useMemo(() => {
    if (!mixtape?.tracklist) return new Map();

    const tagFrequency = new Map();
    const totalTracks = mixtape.tracklist.length;

    mixtape.tracklist.forEach((track) => {
      const product = track.resolvedProduct || track.product || track.productLookup;
      if (product?.tags) {
        product.tags.forEach((tag) => {
          if (tag && typeof tag === 'string' && tag.trim()) {
            const cleanTag = tag.trim();
            tagFrequency.set(cleanTag, (tagFrequency.get(cleanTag) || 0) + 1);
          }
        });
      }
    });

    // Convert counts to weights
    const weightedMap = new Map();
    tagFrequency.forEach((count, tag) => {
      const frequency = count / totalTracks;
      let weight = frequency;
      if (frequency >= 0.8) weight *= 10;
      else if (frequency >= 0.6) weight *= 5;
      else if (frequency >= 0.4) weight *= 3;
      else if (frequency >= 0.2) weight *= 2;

      weightedMap.set(tag, { count, frequency, weight });
    });

    return weightedMap;
  }, [mixtape?.tracklist]);

  // Get IDs of products already in tracklist to exclude them
  const tracklistProductIds = useMemo(() => {
    if (!mixtape?.tracklist) return new Set();

    const ids = new Set();
    mixtape.tracklist.forEach((track) => {
      const product = track.resolvedProduct || track.product || track.productLookup;
      if (product?._id) ids.add(product._id);
      if (product?.swellProductId) ids.add(product.swellProductId);
      if (product?.sku) ids.add(product.sku);
      if (track.wpProductId) ids.add(track.wpProductId);
    });

    return ids;
  }, [mixtape?.tracklist]);

  // Memoize cache key
  const cacheKey = useMemo(
    () => (mixtape?._id ? getCacheKey(mixtape._id, tracklistTags, tracklistProductIds) : null),
    [mixtape?._id, tracklistTags, tracklistProductIds]
  );

  useEffect(() => {
    async function fetchRelatedProducts() {
      if (!mixtape?.tracklist?.length) {
        return;
      }

      // Check cache first
      if (cacheKey) {
        const cachedResults = getCachedResults(cacheKey);
        if (cachedResults) {
          setRelatedProducts(cachedResults);
          return;
        }
      }

      try {
        // If no tags from resolved products, try direct product lookup
        let productsWithTags = [];

        if (tracklistTags.length === 0) {
          const productIdentifiers = mixtape.tracklist
            .map((track) => ({
              wpProductId: track.wpProductId,
              productRef: track.productRef,
              trackTitle: track.trackTitle
            }))
            .filter((item) => item.wpProductId || item.productRef);

          const wpProductIds = productIdentifiers.map((item) => item.wpProductId).filter(Boolean);
          const productRefs = productIdentifiers.map((item) => item.productRef).filter(Boolean);

          // Parallel lookup strategies
          const promises = [];

          if (wpProductIds.length > 0) {
            promises.push(
              sanityClient.fetch(
                `*[_type == "product" && !(_id in path("drafts.**")) && wpProductId in $wpProductIds] {
                  _id, title, sku, tags, wpProductId
                }`,
                { wpProductIds }
              )
            );
          }

          if (productRefs.length > 0) {
            promises.push(
              sanityClient.fetch(
                `*[_type == "product" && !(_id in path("drafts.**")) && sku in $skus] {
                  _id, title, sku, tags, wpProductId
                }`,
                { skus: productRefs }
              )
            );

            promises.push(
              sanityClient.fetch(
                `*[_type == "product" && !(_id in path("drafts.**")) && _id in $ids] {
                  _id, title, sku, tags, wpProductId
                }`,
                { ids: productRefs }
              )
            );
          }

          const results = await Promise.all(promises);
          productsWithTags = results.flat();

          // Deduplicate products
          const uniqueProducts = [];
          const seenIds = new Set();
          productsWithTags.forEach((product) => {
            if (!seenIds.has(product._id)) {
              seenIds.add(product._id);
              uniqueProducts.push(product);
            }
          });

          if (uniqueProducts.length > 0) {
            const extractedTags = new Set();
            uniqueProducts.forEach((product) => {
              if (product.tags) {
                product.tags.forEach((tag) => {
                  if (tag && typeof tag === 'string' && tag.trim()) {
                    extractedTags.add(tag.trim());
                  }
                });
              }
            });

            const tagsArray = Array.from(extractedTags);
            if (tagsArray.length === 0) {
              setRelatedProducts([]);
              return;
            }

            return await performRelatedProductsQuery(tagsArray, wpProductIds);
          } else {
            setRelatedProducts([]);
            return;
          }
        }

        // Normal flow if we have tags
        if (tracklistTags.length > 0) {
          const wpProductIds = mixtape.tracklist.map((track) => track.wpProductId).filter(Boolean);
          return await performRelatedProductsQuery(tracklistTags, wpProductIds);
        }

        setRelatedProducts([]);
      } catch (error) {
        console.error('Error fetching mixtape related products:', error);
        setRelatedProducts([]);
      }
    }

    async function performRelatedProductsQuery(tags, excludeWpProductIds = []) {
      // Query for products that match the collected tags
      const products = await sanityClient.fetch(
        `*[_type == "product" && !(_id in path("drafts.**")) && 
          defined(swellProductId) &&
          defined(mainImage.asset->url) &&
          defined(tags) &&
          count(tags[@ in $targetTags]) >= 2 &&
          stock > 0 &&
          !(wpProductId in $excludeIds)
        ] [0...50] {
          _id,
          _createdAt,
          title,
          "artist": artist,
          "label": label,
          "format": format[0].main,
          "genre": genre[0].main,
          tags,
          price,
          stock,
          swellProductId,
          description,
          variants,
          menuOrder,
          orderRank,
          wpProductId,
          "slug": coalesce(swellSlug, slug.current, swellProductId),
          "imageUrl": mainImage.asset->url + "?w=400&h=400&fit=fill&auto=format&q=80&fm=webp",
          "lqip": mainImage.asset->metadata.lqip,
          "commonTags": tags[@ in $targetTags],
          "tagCount": count(tags[@ in $targetTags])
        }`,
        {
          targetTags: tags,
          excludeIds: excludeWpProductIds
        }
      );

      // Filter and process results
      const filteredProducts = products
        .filter((product) => {
          return (
            !tracklistProductIds.has(product._id) &&
            !tracklistProductIds.has(product.swellProductId) &&
            !excludeWpProductIds.includes(product.wpProductId)
          );
        })
        .map((product) => {
          const commonTagCount = product.tagCount || 0;
          const matchPercentage = Math.round((commonTagCount / tags.length) * 100);

          // Calculate weighted similarity score
          let weightedScore = 0;
          let totalPossibleWeight = 0;

          if (product.commonTags && Array.isArray(product.commonTags)) {
            product.commonTags.forEach((tag) => {
              const tagData = tagFrequencyMap.get(tag);
              if (tagData) {
                weightedScore += tagData.weight;
              }
            });
          }

          tagFrequencyMap.forEach((tagData) => {
            totalPossibleWeight += tagData.weight;
          });

          const weightedPercentage =
            totalPossibleWeight > 0 ? Math.round((weightedScore / totalPossibleWeight) * 100) : 0;

          // Enhanced similarity scoring
          let similarityScore = 0;
          similarityScore += weightedScore * 1000;

          if (weightedPercentage >= 50) {
            similarityScore += 1000;
          } else if (weightedPercentage >= 30) {
            similarityScore += 500;
          } else if (weightedPercentage >= 15) {
            similarityScore += 200;
          }

          similarityScore += commonTagCount * 100;

          const totalTags = product.tags?.length || 0;
          if (totalTags >= 5) {
            similarityScore += 50;
          }

          const daysSinceCreated =
            (Date.now() - new Date(product._createdAt).getTime()) / (1000 * 60 * 60 * 24);
          if (daysSinceCreated < 30) {
            similarityScore += 25;
          }

          return {
            ...product,
            commonTags: product.commonTags || [],
            commonTagCount,
            totalMixtapeTags: tags.length,
            matchPercentage,
            weightedScore,
            weightedPercentage,
            similarityScore,
            resolvedSlug: product.slug,
            totalProductTags: totalTags
          };
        })
        .sort((a, b) => {
          if (b.commonTagCount !== a.commonTagCount) {
            return b.commonTagCount - a.commonTagCount;
          }

          if (b.weightedPercentage !== a.weightedPercentage) {
            return b.weightedPercentage - a.weightedPercentage;
          }

          const orderRankA = a.orderRank || 'zzz';
          const orderRankB = b.orderRank || 'zzz';
          if (orderRankA !== orderRankB) {
            return orderRankA.localeCompare(orderRankB);
          }

          const menuOrderA = a.menuOrder || 999999;
          const menuOrderB = b.menuOrder || 999999;
          return menuOrderA - menuOrderB;
        })
        .slice(0, 12);

      // Cache the results
      if (cacheKey) {
        setCachedResults(cacheKey, filteredProducts);
      }

      setRelatedProducts(filteredProducts);
    }

    fetchRelatedProducts();
  }, [tracklistTags, tracklistProductIds, mixtape, tagFrequencyMap, cacheKey]);

  // Don't render if no products or quality is too low
  if (relatedProducts.length === 0) {
    return null;
  }

  // Check if we have good quality matches
  const hasQualityMatches = relatedProducts.some(
    (product) => product.commonTagCount >= 2 || product.matchPercentage >= 10
  );

  if (!hasQualityMatches) {
    return null;
  }

  return (
    <section className="mixtape-related-products border-top py-5">
      <div className="container-fluid">
        <div className="row mb-4">
          <div className="col-12">
            <h3 className="h4 fw-semibold">More like this mixtape</h3>
          </div>
        </div>
      </div>

      <GridContainer>
        {relatedProducts.map((product, index) => {
          // Format product for ProductCard component
          const productForCard = {
            id: product.swellProductId || product._id,
            name: product.title || 'Untitled',
            title: product.title || 'Untitled',
            price: product.price || 0,
            handle: product.resolvedSlug || product.slug || product.swellProductId,
            slug: product.resolvedSlug || product.slug || product.swellProductId,

            // Optimized image handling
            mainImage: product.imageUrl
              ? {
                  asset: {
                    url: product.imageUrl,
                    metadata: {
                      lqip: product.lqip,
                      dimensions: { width: 800, height: 800 }
                    }
                  }
                }
              : undefined,

            imageUrl: product.imageUrl,
            description: product.description || '',
            variants: product.variants || [],
            stock_status: 'in_stock',
            content: {
              artist: product.artist || '',
              label: product.label || '',
              genre: product.genre || '',
              format: product.format || ''
            }
          };

          return (
            <GridItem
              key={product.swellProductId || product._id}
              type="product"
              id={productForCard.id}
              inStock={product.stock > 0}
              stock={product.stock}
              category="mixtape-related"
              featured={false}
            >
              <ProductCard product={productForCard} priority={index < 6} />
            </GridItem>
          );
        })}
      </GridContainer>
    </section>
  );
}
