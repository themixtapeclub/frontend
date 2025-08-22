// components/product/InMixtapes.tsx
'use client';

import { GridContainer } from 'components/grid/Container';
import { GridItem } from 'components/grid/Item';
import Mixtape from 'components/mixtapes/MixtapeCard';
import { useMemo } from 'react';

interface Contributor {
  _id: string;
  name: string;
  slug?: {
    current: string;
  };
  image?: {
    asset?: {
      _ref: string;
      url?: string;
    };
  };
  featured?: boolean;
  archived?: boolean;
  location?: string;
}

interface MixtapeReference {
  _key?: string;
  mixtape?: {
    _id?: string;
    _ref?: string;
    title?: string;
    slug?: { current: string };
    featuredImage?: any;
    mixcloudUrl?: string;
    publishedAt?: string;
    contributors?: Contributor[];
    contributorNames?: string;
    _contributorNames?: string;
    artist?: string;
  };
  trackTitle: string;
  trackArtist?: string;
  artist?: string;
  publishedAt?: string;
  contributors?: Contributor[];
  contributorNames?: string;
  _contributorNames?: string;
}

interface FormattedMixtape {
  _id: string;
  title: string;
  slug: { current: string };
  featuredImage?: any;
  mixcloudUrl?: string;
  publishedAt?: string;
  contributors?: Contributor[];
  contributorNames?: string;
  _contributorNames?: string;
  artist?: string;
  featuredTracks: Array<{
    _key: string;
    trackTitle: string;
    artist?: string;
  }>;
  category: string;
  featured: boolean;
}

interface InMixtapesProps {
  product: any;
  sanityContent?: {
    inMixtapes?: MixtapeReference[];
  };
  className?: string;
  rowClassName?: string;
}

export default function InMixtapes({
  product,
  sanityContent,
  className = '',
  rowClassName = 'row loop justify-content-start'
}: InMixtapesProps) {
  const mixtapes: MixtapeReference[] = sanityContent?.inMixtapes || [];

  const uniqueMixtapes: FormattedMixtape[] = useMemo(() => {
    return formatMixtapesForDisplay(mixtapes);
  }, [mixtapes]);

  if (!uniqueMixtapes || uniqueMixtapes.length === 0) {
    return null;
  }

  return (
    <>
      <p className="fs-6">In Mixtapes</p>
      <GridContainer className={`mixtapes-grid ${className}`} rowClassName={rowClassName}>
        {uniqueMixtapes.map((mixtape) => (
          <GridItem
            key={`mixtape-${mixtape._id}`}
            type="mixtape"
            id={mixtape._id}
            category={mixtape.category}
            featured={mixtape.featured}
            baseClassName="col-6 col-sm-4 col-lg-3 pb-5 ms-0 ps-0"
          >
            <Mixtape
              mixtape={mixtape}
              context="inMixtapes"
              key={`debug-${mixtape._id}-${Date.now()}`}
            />
          </GridItem>
        ))}
      </GridContainer>
      {uniqueMixtapes?.length > 3 && (
        <div className="mt-3 text-center">
          <a href="/mixtapes" className="btn btn-outline-secondary btn-sm">
            View All Mixtapes
          </a>
        </div>
      )}
    </>
  );
}

function formatMixtapesForDisplay(inMixtapes: MixtapeReference[]): FormattedMixtape[] {
  const mixtapeMap = new Map<string, FormattedMixtape>();

  inMixtapes.forEach((ref, index) => {
    const mixtapeId = ref.mixtape?._id || ref.mixtape?._ref || `mixtape-${index}`;

    if (mixtapeMap.has(mixtapeId)) {
      mixtapeMap.get(mixtapeId)!.featuredTracks.push({
        _key: ref._key || `track-${index}`,
        trackTitle: ref.trackTitle,
        artist: ref.trackArtist || ref.artist
      });
    } else {
      const contributors = ref.mixtape?.contributors || [];
      const contributorNames = ref.mixtape?.contributorNames;
      const _contributorNames = ref.mixtape?._contributorNames;

      mixtapeMap.set(mixtapeId, {
        _id: mixtapeId,
        title: ref.mixtape?.title || 'Unknown Mixtape',
        slug: { current: ref.mixtape?.slug?.current || '' },
        featuredImage: ref.mixtape?.featuredImage,
        mixcloudUrl: ref.mixtape?.mixcloudUrl,
        publishedAt: ref.publishedAt || ref.mixtape?.publishedAt,
        contributors: contributors,
        contributorNames: contributorNames,
        _contributorNames: _contributorNames,
        artist: ref.mixtape?.artist,
        featuredTracks: [
          {
            _key: ref._key || `track-${index}`,
            trackTitle: ref.trackTitle,
            artist: ref.trackArtist || ref.artist
          }
        ],
        category: 'Mixtape',
        featured: false
      });
    }
  });

  return Array.from(mixtapeMap.values());
}
