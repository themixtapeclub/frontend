// components/mixtape/RelatedMixtapes.jsx - Client-side related mixtapes
'use client';

import { useEffect, useState } from 'react';
import { GridContainer } from '../grid/Container';
import { GridItem } from '../grid/Item';
import MixtapeCard from './MixtapeCard'; // Use your existing MixtapeCard

export default function RelatedMixtapes({ mixtape }) {
  const [relatedMixtapes, setRelatedMixtapes] = useState({
    contributorMixtapes: [],
    tagBasedMixtapes: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchRelatedMixtapes() {
      if (!mixtape?._id) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        console.log('🎵 Fetching related mixtapes for:', mixtape.title, mixtape._id);
        console.log('🎵 Current mixtape tags:', mixtape.tags);
        console.log('🎵 Current mixtape contributor:', mixtape.contributor);

        // Import the service dynamically to avoid SSR issues
        const { getRelatedMixtapes } = await import('../../lib/queries/sanity/mixtapes/relatedMixtapes');

        const related = await getRelatedMixtapes(mixtape);
        console.log('🎵 Related mixtapes result:', related);
        setRelatedMixtapes(related);
      } catch (err) {
        console.error('Error fetching related mixtapes:', err);
        setError(err);
        // Set empty results on error
        setRelatedMixtapes({
          contributorMixtapes: [],
          tagBasedMixtapes: []
        });
      } finally {
        setIsLoading(false);
      }
    }

    // Small delay to avoid blocking the main content render
    const timeoutId = setTimeout(fetchRelatedMixtapes, 100);
    return () => clearTimeout(timeoutId);
  }, [mixtape?._id]);

  // Don't render anything while loading or if there's an error
  if (isLoading || error) {
    return null;
  }

  // Extract the two arrays
  const { contributorMixtapes = [], tagBasedMixtapes = [] } = relatedMixtapes;
  const totalMixtapes = contributorMixtapes.length + tagBasedMixtapes.length;

  // Don't render if no related mixtapes found
  if (totalMixtapes === 0) {
    return null;
  }

  // Consolidation logic - if contributor has ≤1 mixtapes, move them to tag-based row
  const shouldConsolidate = contributorMixtapes.length <= 1;

  let finalContributorMixtapes = [];
  let finalTagBasedMixtapes = [];

  if (shouldConsolidate) {
    finalContributorMixtapes = [];
    finalTagBasedMixtapes = [
      ...contributorMixtapes.map((mixtape) => ({
        ...mixtape,
        originalCategory: 'contributor'
      })),
      ...tagBasedMixtapes
    ];
  } else {
    finalContributorMixtapes = contributorMixtapes;
    finalTagBasedMixtapes = tagBasedMixtapes;
  }

  // Generate dynamic title based on the DISPLAYED 4 contributor mixtapes
  const getContributorTitle = (displayedMixtapes) => {
    if (!displayedMixtapes || displayedMixtapes.length === 0) return null;

    const contributorCounts = {};

    displayedMixtapes.forEach((mixtape) => {
      const contributors = Array.isArray(mixtape.contributor)
        ? mixtape.contributor
        : [mixtape.contributor];

      contributors.forEach((contributor) => {
        if (contributor && contributor.trim()) {
          contributorCounts[contributor.trim()] = (contributorCounts[contributor.trim()] || 0) + 1;
        }
      });
    });

    const topContributor =
      Object.keys(contributorCounts).length > 0
        ? Object.keys(contributorCounts).reduce((a, b) =>
            contributorCounts[a] > contributorCounts[b] ? a : b
          )
        : null;

    const cleanContributor = topContributor
      ? topContributor.split(' ').slice(0, 3).join(' ')
      : null;

    if (cleanContributor) {
      return `More by ${cleanContributor}`;
    }

    return 'More by Same Contributor';
  };

  const getTagBasedTitle = () => {
    return 'More like this';
  };

  const renderMixtapeSection = (mixtapes, title, sectionType = 'default') => {
    if (!mixtapes.length) return null;

    const mixtapesToShow = mixtapes
      .sort((a, b) => {
        if (sectionType === 'contributor') {
          // Sort by publishedAt/releaseDate for contributor mixtapes
          const dateA = new Date(a.publishedAt || a.releaseDate || 0);
          const dateB = new Date(b.publishedAt || b.releaseDate || 0);
          return dateB - dateA;
        } else {
          // Sort by similarity for tag-based mixtapes
          const similarityA = a.similarityScore || a.commonTagCount || 0;
          const similarityB = b.similarityScore || b.commonTagCount || 0;

          if (similarityA !== similarityB) {
            return similarityB - similarityA;
          }

          const dateA = new Date(a.publishedAt || a.releaseDate || 0);
          const dateB = new Date(b.publishedAt || b.releaseDate || 0);
          return dateB - dateA;
        }
      })
      .slice(0, sectionType === 'contributor' ? 4 : 12); // 4 for contributor, 12 for tags

    const sectionTitle =
      sectionType === 'contributor' ? getContributorTitle(mixtapesToShow) : title;

    return (
      <section className="mb-5">
        <div className="container-fluid">
          <div className="row mb-4">
            <div className="col-12">
              <h3 className="h4 fw-semibold">{sectionTitle}</h3>
            </div>
          </div>
        </div>

        <GridContainer>
          {mixtapesToShow.map((mixtape, index) => {
            // Use your existing MixtapeCard component
            return (
              <GridItem
                key={mixtape._id}
                type="mixtape"
                id={mixtape._id}
                category={mixtape.originalCategory || sectionType}
                featured={false}
              >
                <div className="position-relative">
                  <MixtapeCard
                    mixtape={mixtape}
                    priority={index < 4}
                    index={index}
                    context="related"
                  />
                </div>
              </GridItem>
            );
          })}
        </GridContainer>
      </section>
    );
  };

  return (
    <div className="related-mixtapes border-top py-5">
      {/* Row 1: Contributor matches (only show if not consolidated, max 4) */}
      {!shouldConsolidate &&
        renderMixtapeSection(finalContributorMixtapes, getContributorTitle(), 'contributor')}

      {/* Row 2: Tag-based matches (includes moved contributor mixtapes if consolidated, max 12) */}
      {renderMixtapeSection(finalTagBasedMixtapes, getTagBasedTitle(), 'tags')}
    </div>
  );
}
