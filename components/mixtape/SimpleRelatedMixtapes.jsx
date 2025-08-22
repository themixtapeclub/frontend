// components/mixtape/SimpleRelatedMixtapes.jsx - Fixed duplicate key issue
'use client';

import MixtapeCard from 'components/mixtapes/MixtapeCard';
import { useEffect, useMemo, useState } from 'react';
import { sanityClient } from '../../lib/queries/sanity/core/client';
import { GridContainer } from '../grid/Container';
import { GridItem } from '../grid/Item';

// Cache configuration
const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes
const cache = new Map();

// Contributor query - returns all relevant mixtapes by the same contributor
const CONTRIBUTOR_QUERY = `*[_type == "mixtape" && 
  !(_id in path("drafts.**")) &&
  _id != $currentId && 
  $contributorId in contributors[]._ref
] | order(publishedAt desc, modifiedAt desc, _createdAt desc) [0...12] {
  _id,
  title,
  slug,
  contributors[]->{
    _id,
    name,
    slug,
    image {
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
      alt
    }
  },
  contributorNames,
  _contributorNames,
  tags,
  publishedAt,
  modifiedAt,
  _createdAt,
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
    alt
  }
}`;

const PRIORITY_TAG_QUERY = `*[_type == "mixtape" && 
  !(_id in path("drafts.**")) &&
  _id != $currentId && 
  defined(tags) &&
  count(tags[@ in $priorityTags]) > 0
] [0...12] {
  _id,
  title,
  slug,
  contributors[]->{
    _id,
    name,
    slug,
    image {
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
      alt
    }
  },
  contributorNames,
  _contributorNames,
  tags,
  publishedAt,
  modifiedAt,
  _createdAt,
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
    alt
  },
  "matchedPriorityTags": tags[@ in $priorityTags],
  "priorityTagCount": count(tags[@ in $priorityTags])
}`;

const REGULAR_TAG_QUERY = `*[_type == "mixtape" && 
  !(_id in path("drafts.**")) &&
  _id != $currentId && 
  !(_id in $excludeIds) &&
  defined(tags) &&
  count(tags[@ in $targetTags]) > 0
] [0...$limit] {
  _id,
  title,
  slug,
  contributors[]->{
    _id,
    name,
    slug,
    image {
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
      alt
    }
  },
  contributorNames,
  _contributorNames,
  tags,
  publishedAt,
  modifiedAt,
  _createdAt,
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
    alt
  },
  "commonTags": tags[@ in $targetTags],
  "tagCount": count(tags[@ in $targetTags])
}`;

// Helper function to extract contributor info from data structure
function getContributorInfo(mixtape) {
  // Priority 1: New contributors array
  if (mixtape.contributors && mixtape.contributors.length > 0) {
    const primaryContributor = mixtape.contributors[0];
    return {
      name: primaryContributor.name,
      id: primaryContributor._id,
      slug: primaryContributor.slug?.current || null,
      shouldShow: true
    };
  }

  // Priority 2: contributorNames string
  if (mixtape.contributorNames) {
    return {
      name: mixtape.contributorNames,
      id: null,
      slug: null,
      shouldShow: true
    };
  }

  // Priority 3: _contributorNames
  if (mixtape._contributorNames) {
    return {
      name: mixtape._contributorNames,
      id: null,
      slug: null,
      shouldShow: true
    };
  }

  return {
    name: null,
    id: null,
    slug: null,
    shouldShow: false
  };
}

// Helper function to check if a mixtape is by 'butter' contributor
function isByButterContributor(mixtape) {
  const contributorInfo = getContributorInfo(mixtape);
  return contributorInfo.name && contributorInfo.name.toLowerCase().trim() === 'butter';
}

// Helper function to deduplicate mixtapes by _id
function deduplicateMixtapes(mixtapes) {
  const seen = new Set();
  return mixtapes.filter((mixtape) => {
    if (!mixtape || !mixtape._id || seen.has(mixtape._id)) {
      return false;
    }
    seen.add(mixtape._id);
    return true;
  });
}

// Cache management functions
function getCacheKey(mixtapeId, tags, contributorInfo) {
  const sortedTags = [...(tags || [])].sort();
  const contributorKey = contributorInfo.shouldShow ? contributorInfo.id : 'none';
  return `${mixtapeId}-${sortedTags.join(',')}-${contributorKey}`;
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

export default function SimpleRelatedMixtapes({ mixtape }) {
  const [relatedMixtapes, setRelatedMixtapes] = useState([]);
  const [contributorResults, setContributorResults] = useState([]);

  // Memoize contributor info and cache key
  const contributorInfo = useMemo(
    () =>
      mixtape
        ? getContributorInfo(mixtape)
        : { shouldShow: false, name: null, id: null, slug: null },
    [mixtape?.contributors, mixtape?.contributorNames, mixtape?._contributorNames]
  );

  const cacheKey = useMemo(
    () => (mixtape?._id ? getCacheKey(mixtape._id, mixtape.tags, contributorInfo) : null),
    [mixtape?._id, mixtape?.tags, contributorInfo]
  );

  useEffect(() => {
    async function fetchRelatedMixtapes() {
      if (!mixtape?._id) {
        // Clear states when no valid mixtape data
        setRelatedMixtapes([]);
        setContributorResults([]);
        return;
      }

      // Check cache first
      if (cacheKey) {
        const cachedResults = getCachedResults(cacheKey);
        if (cachedResults) {
          setRelatedMixtapes(cachedResults.relatedMixtapes);
          setContributorResults(cachedResults.contributorResults);
          return;
        }
      }

      try {
        let contributorMixtapes = [];
        let tagBasedMixtapes = [];

        // Parallel fetch for better performance
        const promises = [];

        // Get current mixtape's contributor info
        const currentContributorInfo = getContributorInfo(mixtape);
        const currentContributorName = currentContributorInfo.name?.trim().toLowerCase();

        // STEP 1: Get mixtapes by same contributor - Only if valid contributor and not excluded
        const excludedContributors = ['the mixtape shop', 'butter'];
        const shouldFetchContributor =
          contributorInfo.shouldShow &&
          contributorInfo.id &&
          !excludedContributors.includes(currentContributorName);

        if (shouldFetchContributor) {
          const contributorQueryParams = {
            currentId: mixtape._id,
            contributorId: contributorInfo.id
          };

          promises.push(
            sanityClient.fetch(CONTRIBUTOR_QUERY, contributorQueryParams).then((results) => {
              contributorMixtapes = results;
              return { type: 'contributor', results };
            })
          );
        }

        // STEP 2: Only fetch tag-based mixtapes if there are tags
        if (mixtape.tags && mixtape.tags.length > 0) {
          const priorityTags = [
            'dance',
            'groovy',
            'listening',
            'healing',
            'global',
            'chill',
            'nostalgia'
          ];

          const currentMixtapePriorityTags = mixtape.tags.filter((tag) =>
            priorityTags.includes(tag.toLowerCase())
          );

          // STEP 2a: Get priority tag matches
          if (currentMixtapePriorityTags.length > 0) {
            promises.push(
              sanityClient
                .fetch(PRIORITY_TAG_QUERY, {
                  currentId: mixtape._id,
                  priorityTags: currentMixtapePriorityTags
                })
                .then((results) => ({ type: 'priority', results }))
            );
          }
        }

        // Wait for all initial queries to complete
        const initialResults = await Promise.all(promises);

        // Process initial tag-based results
        for (const { type, results } of initialResults) {
          if (type === 'priority') {
            tagBasedMixtapes = [...results];
          }
        }

        // STEP 3: Get regular tag matches if needed and if we have tags
        if (mixtape.tags && mixtape.tags.length > 0 && tagBasedMixtapes.length < 12) {
          const remaining = 12 - tagBasedMixtapes.length;
          // Make sure we exclude both the current mixtape and any results we already have
          const excludeIds = [
            ...tagBasedMixtapes.map((item) => item._id),
            mixtape._id,
            // Also exclude any contributor mixtapes to prevent duplicates
            ...contributorMixtapes.map((item) => item._id)
          ];

          const regularResults = await sanityClient.fetch(REGULAR_TAG_QUERY, {
            currentId: mixtape._id,
            excludeIds: excludeIds,
            targetTags: mixtape.tags,
            limit: remaining + 5 // Get a few extra for flexibility
          });

          tagBasedMixtapes = [...tagBasedMixtapes, ...regularResults.slice(0, remaining)];
        }

        // Process and sort tag-based results
        const processedResults = tagBasedMixtapes.map((item) => {
          const isPriorityMatch = Boolean(item.matchedPriorityTags?.length);
          const matchedPriorityTags = item.matchedPriorityTags || [];
          const commonTags = item.commonTags || [];
          const tagCount = item.tagCount || 0;

          return {
            ...item,
            isPriorityMatch,
            matchedPriorityTags,
            commonTags,
            tagCount: isPriorityMatch ? matchedPriorityTags.length : tagCount
          };
        });

        // Sort tag-based results and filter out butter contributor
        const sortedResults = processedResults
          .filter((item) => !isByButterContributor(item)) // Filter out butter contributor
          .sort((a, b) => {
            // Filter out specific mixtapes (like "butter")
            // You can add specific IDs to filter out here
            const filterOutIds = []; // Add IDs to filter here, e.g. ['butter-mixtape-id']
            if (filterOutIds.includes(a._id)) return 1;
            if (filterOutIds.includes(b._id)) return -1;

            if (a.isPriorityMatch && !b.isPriorityMatch) return -1;
            if (!a.isPriorityMatch && b.isPriorityMatch) return 1;

            if (a.isPriorityMatch && b.isPriorityMatch) {
              const orderRankA = a.orderRank || 'zzz';
              const orderRankB = b.orderRank || 'zzz';
              if (orderRankA !== orderRankB) {
                return orderRankA.localeCompare(orderRankB, undefined, {
                  numeric: true,
                  sensitivity: 'base'
                });
              }
            }

            if (!a.isPriorityMatch && !b.isPriorityMatch) {
              if (b.tagCount !== a.tagCount) {
                return b.tagCount - a.tagCount;
              }

              const orderRankA = a.orderRank || 'zzz';
              const orderRankB = b.orderRank || 'zzz';
              if (orderRankA !== orderRankB) {
                return orderRankA.localeCompare(orderRankB, undefined, {
                  numeric: true,
                  sensitivity: 'base'
                });
              }
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

        // Get final filtered tag-based results with deduplication
        const finalTagBasedResults = deduplicateMixtapes(
          sortedResults.filter((result) => result._id !== mixtape._id)
        ).slice(0, 12);

        // Deduplicate contributor results as well
        const deduplicatedContributorResults = deduplicateMixtapes(contributorMixtapes);

        // Cache the results
        if (cacheKey) {
          setCachedResults(cacheKey, {
            relatedMixtapes: finalTagBasedResults,
            contributorResults: deduplicatedContributorResults
          });
        }

        setRelatedMixtapes(finalTagBasedResults);
        setContributorResults(deduplicatedContributorResults);
      } catch (error) {
        console.error('Error fetching related mixtapes:', error);
        setRelatedMixtapes([]);
        setContributorResults([]);
      }
    }

    fetchRelatedMixtapes();
  }, [mixtape?._id, mixtape?.tags, contributorInfo, cacheKey]);

  // Helper function to get contributor title
  const getContributorTitle = (results) => {
    if (!results || results.length === 0) return null;

    // Look at current mixtape's contributor first
    if (contributorInfo.name) {
      return `More by ${contributorInfo.name}`;
    }

    // Fallback to first result's contributor
    const firstResult = results[0];
    const resultContributorInfo = getContributorInfo(firstResult);
    return resultContributorInfo.name
      ? `More by ${resultContributorInfo.name}`
      : 'More by Same Contributor';
  };

  // Check if the contributor is one we should exclude from dedicated section
  const isExcludedContributor =
    contributorInfo.name &&
    ['The Mixtape Shop', 'Butter', 'the mixtape shop', 'butter'].includes(
      contributorInfo.name.trim()
    );

  // Only show dedicated contributor section if we have at least 2 results AND not an excluded contributor
  const shouldShowContributorSection = contributorResults.length >= 2 && !isExcludedContributor;

  // Split contributor results: max 8 for dedicated section, rest for "More like this"
  const contributorForDedicatedSection = contributorResults.slice(0, 8);
  const contributorOverflow = contributorResults.slice(8);

  // Only show tag-based results if we have any
  let shouldShowTagBasedSection = relatedMixtapes.length > 0 || contributorOverflow.length > 0;

  // Build final tag-based results with proper deduplication
  let finalTagBasedResults = [];

  // Collect all IDs that will be shown in the contributor section
  const contributorSectionIds = new Set(
    shouldShowContributorSection ? contributorForDedicatedSection.map((m) => m._id) : []
  );

  // Add contributor overflow at the beginning of "More like this"
  if (contributorOverflow.length > 0) {
    finalTagBasedResults = [...contributorOverflow, ...relatedMixtapes];
    shouldShowTagBasedSection = true;
  }
  // If there's exactly 1 contributor result and we're not showing the dedicated section,
  // we'll incorporate it into the tag-based section
  else if (contributorResults.length === 1 && !shouldShowContributorSection) {
    // Add the single contributor result to the beginning of the tag-based results
    finalTagBasedResults = [...contributorResults, ...relatedMixtapes];
    shouldShowTagBasedSection = true;
  }
  // Otherwise, just use the regular related mixtapes, but filter out any that appear in contributor section
  else {
    finalTagBasedResults = relatedMixtapes.filter(
      (mixtape) => !contributorSectionIds.has(mixtape._id)
    );
  }

  // Final deduplication and validation
  finalTagBasedResults = deduplicateMixtapes(finalTagBasedResults)
    .filter((mixtape) => mixtape && mixtape._id) // Remove any null/undefined items
    .slice(0, 12);

  // If neither section has content, don't render anything
  if (!shouldShowContributorSection && !shouldShowTagBasedSection) {
    return null;
  }

  const renderMixtapeSection = (mixtapes, title, sectionType = 'default') => {
    if (!mixtapes.length) return null;

    // For contributor section, show up to 8 mixtapes
    // For "More like this" section, show up to 12 mixtapes
    const maxItems = sectionType === 'contributor' ? 8 : 12;
    const mixtapesToShow = mixtapes.slice(0, maxItems);

    return (
      <section className="mb-5">
        <div className="container-fluid">
          <div className="row mb-4">
            <div className="col-12">
              <h3 className="h4 fw-semibold">{title}</h3>
            </div>
          </div>
        </div>

        <GridContainer>
          {mixtapesToShow.map((mixtape, index) => {
            // Additional safety check
            if (!mixtape || !mixtape._id) {
              console.warn(`Invalid mixtape at index ${index}:`, mixtape);
              return null;
            }

            try {
              return (
                <GridItem
                  key={`${sectionType}-${mixtape._id}-${index}`} // More unique key
                  type="mixtape"
                  id={mixtape._id}
                  category={sectionType}
                  featured={false}
                >
                  <MixtapeCard
                    mixtape={mixtape}
                    priority={index < 4}
                    index={index}
                    context="related"
                  />
                </GridItem>
              );
            } catch (error) {
              console.error(`Error rendering MixtapeCard for ${mixtape._id}:`, error);
              return null;
            }
          })}
        </GridContainer>
      </section>
    );
  };

  return (
    <div className="related-mixtapes border-top py-5">
      {/* Always show contributor section first if available (max 8 mixtapes) */}
      {shouldShowContributorSection &&
        renderMixtapeSection(
          contributorForDedicatedSection,
          getContributorTitle(contributorResults),
          'contributor'
        )}

      {/* Only show tag-based section if we have results (includes contributor overflow) */}
      {shouldShowTagBasedSection &&
        renderMixtapeSection(finalTagBasedResults, 'More like this', 'main')}
    </div>
  );
}
