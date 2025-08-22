// components/mixtape/Content.tsx
'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { usePersistentPlayer } from '../../contexts/PersistentPlayerContext';
import Tracklist from './Tracklist';

interface Product {
  _id: string;
  title: string;
  sku?: string;
  swellSlug?: string;
  swellProductId?: string;
  price?: number;
  artist?: string[];
  mainImage?: {
    asset?: {
      _id: string;
      url: string;
      metadata?: {
        dimensions?: {
          width: number;
          height: number;
        };
      };
    };
    alt?: string;
  };
}

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

interface MixtapeContentProps {
  mixtape: {
    _id: string;
    title: string;
    slug?: string | { current: string };
    artist?: string;
    contributor?: string | Contributor;
    contributorRef?: {
      _ref: string;
      _type: string;
    };
    contributorString?: string;
    contributorData?: Contributor;
    contributors?: Contributor[];
    contributorNames?: string;
    _contributorNames?: string;
    description?: string;
    duration?: string;
    genre?: string;
    releaseDate?: string;
    publishedAt?: string;
    featuredImage?: {
      asset?: {
        url: string;
      };
      alt?: string;
    };
    tracklist?: Array<{
      _key: string;
      trackTitle: string;
      artist?: string;
      location?: string;
      productId?: number;
      productRef?: string;
      product?: Product;
    }>;
    tracklistText?: string;
    mixcloudUrl?: string;
    streamingLinks?: {
      spotify?: string;
      soundcloud?: string;
      mixcloud?: string;
      youtube?: string;
    };
    credits?: string;
  };
}

function shouldTrackHaveProduct(track: any): boolean {
  return Boolean(track?.productRef && track?.product);
}

function getProductImageUrl(track: any, width = 80, height = 80): string | null {
  if (!shouldTrackHaveProduct(track)) {
    return null;
  }

  if (!track?.product?.mainImage?.asset?.url) {
    return null;
  }

  const baseUrl = track.product.mainImage.asset.url;

  if (baseUrl.includes('cdn.sanity.io')) {
    return `${baseUrl}?w=${width}&h=${height}&fit=crop&auto=format`;
  }

  return baseUrl;
}

function getProductLink(track: any): string | null {
  if (!shouldTrackHaveProduct(track)) {
    return null;
  }

  if (!track?.product?.swellSlug) {
    return null;
  }

  return `/product/${track.product.swellSlug}/`;
}

function getMixcloudEmbedUrl(url: string, autoplay = false): string {
  const mixcloudPattern = /https?:\/\/(www\.)?mixcloud\.com\/(.+?)\/?\s*$/;
  const match = url.trim().match(mixcloudPattern);

  if (match && match[2]) {
    const cleanPath = match[2].replace(/\/$/, '');
    const feedPath = encodeURIComponent(`/${cleanPath}/`);

    const params = new URLSearchParams({
      hide_cover: '1',
      mini: '1',
      hide_artwork: '1',
      hide_tracklist: '1',
      autoplay: autoplay ? '1' : '0',
      feed: feedPath
    });

    return `https://www.mixcloud.com/widget/iframe/?${params.toString()}`;
  }

  return url;
}

export function MixtapeContent({ mixtape }: MixtapeContentProps) {
  const { showPlayer, playerState } = usePersistentPlayer();
  const [hasClickedPlay, setHasClickedPlay] = useState(false);
  const [canControlPlayer, setCanControlPlayer] = useState(false);

  const contributorObj =
    mixtape.contributorData ||
    (typeof mixtape.contributor === 'object' ? mixtape.contributor : null);

  const contributorName =
    contributorObj?.name ||
    mixtape.contributorString ||
    (typeof mixtape.contributor === 'string' ? mixtape.contributor : null);

  const artistName =
    contributorName && contributorName.toLowerCase() !== 'the mixtape shop'
      ? contributorName
      : mixtape.artist;

  const isPlayingInPersistent =
    playerState.isVisible && playerState.mixtapeData?.mixcloudUrl === mixtape.mixcloudUrl;

  useEffect(() => {
    const checkUserInteraction = () => {
      if (typeof window !== 'undefined' && (window as any).hasUserInteractedWithPlayer) {
        const hasInteracted = (window as any).hasUserInteractedWithPlayer();
        setCanControlPlayer(hasInteracted);
      }
    };

    if (isPlayingInPersistent) {
      checkUserInteraction();
      const interval = setInterval(checkUserInteraction, 2000);
      return () => clearInterval(interval);
    }

    // Explicitly return undefined for the else case
    return undefined;
  }, [isPlayingInPersistent, hasClickedPlay]);

  useEffect(() => {
    if (!isPlayingInPersistent) {
      setHasClickedPlay(false);
      setCanControlPlayer(false);
    }
  }, [isPlayingInPersistent]);

  const handlePlayPause = useCallback(async () => {
    if (!mixtape.mixcloudUrl) {
      return;
    }

    if (isPlayingInPersistent && canControlPlayer) {
      if (window.toggleMixcloudPlayer) {
        try {
          await window.toggleMixcloudPlayer();
        } catch (error) {
          console.error('Error toggling footer player:', error);
        }
      }
    } else {
      setHasClickedPlay(true);

      const slug = typeof mixtape.slug === 'string' ? mixtape.slug : mixtape.slug?.current;

      const playerData = {
        title: mixtape.title,
        artist: artistName,
        mixcloudUrl: mixtape.mixcloudUrl,
        embedUrl: getMixcloudEmbedUrl(mixtape.mixcloudUrl, false),
        imageUrl: mixtape.featuredImage?.asset?.url,
        slug: slug
      };

      showPlayer(playerData);
    }
  }, [mixtape, artistName, showPlayer, isPlayingInPersistent, canControlPlayer, hasClickedPlay]);

  const handleTrackClick = useCallback(() => {
    handlePlayPause();
  }, [handlePlayPause]);

  return (
    <>
      <div className="row mixtape-details">
        <div className="col-12 mx-auto my-0">
          <div className="mb-5">
            <h1 className="display-4 fw-bold mb-2">{mixtape.title}</h1>

            {mixtape.contributors && mixtape.contributors.length > 0 && (
              <div className="contributor-byline mb-3">
                <span style={{ fontSize: '1.1rem', color: '#666' }}>by </span>
                {mixtape.contributors.map((contributor: any, index: number) => (
                  <span
                    key={contributor._id || index}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
                  >
                    {contributor.image?.asset?.url && (
                      <img
                        src={contributor.image.asset.url}
                        alt={contributor.name || 'Contributor'}
                        style={{
                          width: '1rem',
                          height: '1rem',
                          borderRadius: '50%',
                          objectFit: 'cover'
                        }}
                      />
                    )}
                    <span style={{ fontSize: '1.1rem', fontWeight: '500' }}>
                      {contributor.slug?.current ? (
                        <Link
                          href={`/contributor/${contributor.slug.current}`}
                          className="text-decoration-none"
                        >
                          {contributor.name}
                        </Link>
                      ) : (
                        contributor.name
                      )}
                    </span>
                  </span>
                ))}
              </div>
            )}

            {(!mixtape.contributors || mixtape.contributors.length === 0) &&
              (mixtape.contributorNames || mixtape._contributorNames || artistName) &&
              artistName &&
              artistName.toLowerCase() !== 'the mixtape shop' && (
                <div className="contributor-byline mb-3">
                  <span style={{ fontSize: '1.1rem', color: '#666' }}>by </span>
                  <span style={{ fontSize: '1.1rem', fontWeight: '500' }}>
                    {contributorObj?.slug?.current ? (
                      <Link
                        href={`/contributor/${contributorObj.slug.current}`}
                        className="text-decoration-none"
                      >
                        {mixtape.contributorNames || mixtape._contributorNames || artistName}
                      </Link>
                    ) : (
                      mixtape.contributorNames || mixtape._contributorNames || artistName
                    )}
                  </span>
                </div>
              )}

            <div className="d-flex align-items-center mb-4 flex-wrap gap-3">
              {mixtape.genre && <span className="badge bg-primary fs-6">{mixtape.genre}</span>}
              {mixtape.duration && <span className="text-muted">{mixtape.duration}</span>}
            </div>
          </div>
        </div>
      </div>

      {mixtape.mixcloudUrl && (
        <>
          {(!hasClickedPlay || (isPlayingInPersistent && canControlPlayer)) && (
            <div className="row">
              <div className="col-12 m-0 p-0">
                <div className="custom-player-controller position-relative bg-dark d-flex align-items-center p-3 text-white">
                  <button
                    onClick={handlePlayPause}
                    className="btn btn-primary d-flex align-items-center me-3"
                  >
                    {isPlayingInPersistent && playerState.isPlaying && canControlPlayer ? (
                      <svg
                        fill="currentColor"
                        viewBox="0 0 24 24"
                        width="20"
                        height="20"
                        className="me-2"
                      >
                        <path
                          fillRule="evenodd"
                          d="M6.75 5.25a.75.75 0 01.75-.75H9a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H7.5a.75.75 0 01-.75-.75V5.25zm7.5 0A.75.75 0 0115 4.5h1.5a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H15a.75.75 0 01-.75-.75V5.25z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : (
                      <svg
                        fill="currentColor"
                        viewBox="0 0 24 24"
                        width="20"
                        height="20"
                        className="me-2"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                    {isPlayingInPersistent && playerState.isPlaying && canControlPlayer
                      ? 'Pause'
                      : 'Play Mixtape'}
                  </button>

                  <div className="flex-grow-1">
                    <div className="fw-bold">{mixtape.title}</div>
                    {artistName && (
                      <div className="text-light small opacity-75">by {artistName}</div>
                    )}
                  </div>

                  <div className="text-light small text-end opacity-75">
                    {mixtape.duration && <div>{mixtape.duration}</div>}
                    {mixtape.genre && <div>{mixtape.genre}</div>}
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      <Tracklist
        tracklist={mixtape.tracklist}
        tracklistText={mixtape.tracklistText}
        credits={mixtape.credits}
        onTrackClick={handleTrackClick}
        getProductImageUrl={getProductImageUrl}
        getProductLink={getProductLink}
      />
    </>
  );
}
