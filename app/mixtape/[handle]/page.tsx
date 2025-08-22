// app/mixtape/[handle]/page.tsx
import { OptimizedImages } from 'components/common/OptimizedImages';
import { MixtapeContent } from 'components/mixtape/Content';
import { getMixtape } from 'lib/cms';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import MixtapeRelatedProducts from '../../../components/mixtape/MixtapeRelatedProducts';
import SimpleRelatedMixtapes from '../../../components/mixtape/SimpleRelatedMixtapes';

export const runtime = 'edge';

export async function generateMetadata({
  params
}: {
  params: Promise<{ handle: string }>;
}): Promise<Metadata> {
  const { handle } = await params;
  const mixtape = await getMixtape(handle);

  if (!mixtape) return notFound();

  const imageUrl = mixtape.featuredImage?.asset?.url;
  const contributorNames = getContributorNames(mixtape);
  const artistInfo = contributorNames.length > 0 ? contributorNames.join(', ') : mixtape.artist;

  return {
    title: `${mixtape.title}${artistInfo ? ` by ${artistInfo}` : ''}`,
    description:
      mixtape.description ||
      `Listen to ${mixtape.title} mixtape${artistInfo ? ` by ${artistInfo}` : ''}.`,
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true
      }
    },
    openGraph: imageUrl
      ? {
          images: [
            {
              url: imageUrl,
              width: mixtape.featuredImage?.asset?.metadata?.dimensions?.width || 1080,
              height: mixtape.featuredImage?.asset?.metadata?.dimensions?.height || 1080,
              alt: mixtape.featuredImage?.alt || mixtape.title
            }
          ]
        }
      : null
  };
}

function getContributorNames(mixtape: any): string[] {
  const names: string[] = [];

  if (mixtape.contributors && Array.isArray(mixtape.contributors)) {
    mixtape.contributors.forEach((contributor: any) => {
      if (contributor.name) {
        names.push(contributor.name);
      }
    });
  }

  if (names.length === 0 && mixtape.contributorNames) {
    if (Array.isArray(mixtape.contributorNames)) {
      names.push(...mixtape.contributorNames);
    } else if (typeof mixtape.contributorNames === 'string') {
      names.push(mixtape.contributorNames);
    }
  }

  if (names.length === 0 && mixtape.contributorString) {
    names.push(mixtape.contributorString);
  }

  if (names.length === 0 && mixtape.artist) {
    names.push(mixtape.artist);
  }

  return names;
}

export default async function MixtapePage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  const mixtape = await getMixtape(handle);

  if (!mixtape) {
    return notFound();
  }

  const contributorNames = getContributorNames(mixtape);
  const primaryArtist = contributorNames.length > 0 ? contributorNames[0] : mixtape.artist;

  const mixtapeJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'MusicPlaylist',
    name: mixtape.title,
    description: mixtape.description,
    image: mixtape.featuredImage?.asset?.url,
    creator: primaryArtist
      ? {
          '@type': 'Person',
          name: primaryArtist
        }
      : undefined,
    datePublished: mixtape.publishedAt || mixtape.releaseDate,
    genre: mixtape.genre,
    numTracks: mixtape.tracklist?.length || 0,
    track:
      mixtape.tracklist?.map((track: any, index: number) => ({
        '@type': 'MusicRecording',
        position: index + 1,
        name: track.trackTitle,
        byArtist: track.artist
          ? {
              '@type': 'Person',
              name: track.artist
            }
          : undefined
      })) || []
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(mixtapeJsonLd)
        }}
      />

      <div className="container-fluid">
        <MixtapeImagesOptimized handle={handle} mixtape={mixtape} />
        <MixtapeDetailsOptimized handle={handle} mixtape={mixtape} />
      </div>

      <Suspense fallback={null}>
        <SimpleRelatedMixtapes mixtape={mixtape} />
      </Suspense>

      <Suspense fallback={null}>
        <MixtapeRelatedProducts mixtape={mixtape} />
      </Suspense>
    </>
  );
}

function MixtapeImagesOptimized({ handle, mixtape }: { handle: string; mixtape: any }) {
  try {
    return <OptimizedImages handle={handle} mixtape={mixtape} enableFadeIn={true} />;
  } catch (error) {
    return <div className="col-12">Unable to load mixtape images</div>;
  }
}

function MixtapeDetailsOptimized({ handle, mixtape }: { handle: string; mixtape: any }) {
  try {
    return <MixtapeContent mixtape={mixtape} />;
  } catch (error) {
    return (
      <div className="row mixtape-details">
        <div className="col-12">
          <h1>{mixtape?.title || 'Mixtape'}</h1>
          <p>Unable to load mixtape details</p>
        </div>
      </div>
    );
  }
}
