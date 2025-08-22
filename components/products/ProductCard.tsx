// components/products/ProductCard.tsx
'use client';

import { AddToCart } from 'components/cart/add-to-cart';
import Price from 'components/ui/price';
import { preloadOnHover } from 'lib/queries/sanity/products/relatedProducts';
import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import TracklistUpdater from '../product/TracklistUpdater';
import NowPlayingOverlay from './NowPlayingOverlay';

interface Track {
  title?: string;
  artist?: string;
  audioUrl?: string;
  [key: string]: any;
}

interface Product {
  id?: string;
  _id?: string;
  name?: string;
  title?: string;
  price?: number;
  stock?: number;
  inStock?: boolean;
  stockStatus?: string;
  stock_status?: string;
  stockLevel?: number;
  inventory?: number;
  available?: boolean;
  purchasable?: boolean;
  searchPriority?: string;
  _searchPriority?: string;
  imageUrl?: string;
  productSlug?: string;
  slug?: string;
  handle?: string;
  sku?: string;
  artist?: any;
  label?: any;
  format?: any;
  tracklist?: Track[];
  discogsReleaseId?: string;
  description?: string;
  shortDescription?: string;
  images?: Array<{ file?: { url?: string } }>;
  sanityContent?: {
    _id?: string;
    title?: string;
    artist?: any;
    label?: any;
    format?: any;
    stock?: number;
    tracklist?: Track[];
    discogsReleaseId?: string;
    tracklistEnhanced?: boolean;
    description?: string;
    shortDescription?: string;
    swellProductId?: string;
    mainImage?: {
      asset?: {
        url?: string;
        metadata?: {
          lqip?: string;
        };
      };
    };
  };
  content?: {
    artist?: any;
    label?: any;
    format?: any;
    discogsReleaseId?: string;
  };
  mainImage?: {
    asset?: {
      url?: string;
      metadata?: {
        lqip?: string;
      };
    };
  };
}

interface ProductCardProps {
  product: Product;
  variant?: 'regular' | 'featured';
  priority?: boolean;
  index?: number;
  isFeatured?: boolean;
  context?: 'default' | 'related' | 'inMixtapes' | 'archive';
  configType?: string;
}

interface PlayIconProps {
  className?: string;
  isLoading?: boolean;
}

export default function ProductCard({
  product,
  variant = 'regular',
  priority = false,
  index = 0,
  isFeatured = false,
  context = 'default',
  configType
}: ProductCardProps) {
  const [hasLoaded, setHasLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [enhancedTracklist, setEnhancedTracklist] = useState<Track[]>(() => {
    const initialTracklist = product.sanityContent?.tracklist || product.tracklist || [];
    return initialTracklist;
  });
  const [hasReceivedEnhancement, setHasReceivedEnhancement] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [shouldEnhance, setShouldEnhance] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showCartButton, setShowCartButton] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const shouldUseFeaturedStyle = variant === 'featured' || isFeatured;
  const isInFirstSixFeatured = shouldUseFeaturedStyle && index < 6;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  function normalizeToArray(value: any): string[] {
    if (!value) return [];
    if (Array.isArray(value)) {
      return value
        .flatMap((item) => {
          if (typeof item === 'object' && item !== null && item.main) {
            return item.main;
          }
          if (typeof item === 'string' && item.includes(',')) {
            return item
              .split(',')
              .map((s) => s.trim())
              .filter(Boolean);
          }
          return typeof item === 'string' ? item : String(item);
        })
        .filter((item) => item && typeof item === 'string' && item.trim())
        .map((item) => item.trim());
    }
    if (typeof value === 'string') {
      if (value.includes(',')) {
        return value
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);
      }
      return value.trim() ? [value.trim()] : [];
    }
    if (typeof value === 'object' && value !== null && value.main) {
      return [value.main];
    }
    return [];
  }

  function createSlug(text: string): string {
    let decodedText = text;
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = text;
      decodedText = tempDiv.textContent || tempDiv.innerText || text;
    } else {
      decodedText = text
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&nbsp;/g, ' ');
    }
    return decodedText
      .toLowerCase()
      .replace(/\s*&\s*/g, ' ')
      .replace(/\s+/g, '-')
      .replace(/[^\w-]/g, '')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  function hasPlayableAudio(tracklist: Track[]): boolean {
    if (!tracklist || !Array.isArray(tracklist) || tracklist.length === 0) {
      return false;
    }
    return tracklist.some((track: Track) => {
      return track && track.audioUrl && track.audioUrl.trim() !== '';
    });
  }

  function optimizeImageUrl(url: string, title: string): string {
    if (!url) {
      return '/placeholder.jpg';
    }

    if (url.includes('sanity')) {
      const baseUrl = url.split('?')[0];
      return `${baseUrl}?w=800&h=800&fit=fill&bg=000000&auto=format&q=85`;
    }

    if (url.includes('w=400')) {
      return url
        .replace(/w=\d+&h=\d+/, 'w=800&h=800')
        .replace(/fit=\w+/, 'fit=fill')
        .replace(/crop=\w+/, '');
    }

    return url;
  }

  const isCurrentProductPlaying = useCallback((): boolean => {
    if (typeof window === 'undefined') return false;

    const globalState = (window as any).globalAudioState;
    const currentTrack = globalState?.currentTrack;

    if (!currentTrack || !globalState?.isPlaying) return false;

    const currentTrackProductId =
      currentTrack.productId || currentTrack.swellId || currentTrack.sanityId;
    const thisProductId = product.id || product._id || product.sanityContent?._id;

    return currentTrackProductId === thisProductId;
  }, [product]);

  const productData = useMemo(() => {
    const productName = product.sanityContent?.title || product.name || product.title || 'Untitled';
    const productId = product.id || product._id || 'unknown';

    const rawImageUrl =
      product.imageUrl ||
      product.images?.[0]?.file?.url ||
      product.sanityContent?.mainImage?.asset?.url ||
      product.mainImage?.asset?.url;

    const imageUrl = optimizeImageUrl(rawImageUrl || '', productName);

    const blurDataURL =
      product.sanityContent?.mainImage?.asset?.metadata?.lqip ||
      product.mainImage?.asset?.metadata?.lqip;

    const artistSource = product.sanityContent?.artist || product.content?.artist || product.artist;
    const allArtists = normalizeToArray(artistSource);

    const labelSource = product.sanityContent?.label || product.content?.label || product.label;
    const allLabels = normalizeToArray(labelSource);

    const formatSource = product.sanityContent?.format || product.content?.format || product.format;
    const formatArray = normalizeToArray(formatSource);
    const format = formatArray.length > 0 ? formatArray[0] : null;

    const productSlug =
      product.productSlug || product.slug || product.handle || product.sku || product.id;
    const productUrl = `/product/${productSlug}`;

    const hasAudio = hasPlayableAudio(enhancedTracklist);

    const stockValue = product.sanityContent?.stock ?? product.stock;
    const searchPriority = product.searchPriority || product._searchPriority || '';

    const isInStock =
      stockValue !== undefined && stockValue !== null
        ? Number(stockValue) > 0
        : searchPriority.includes('instock') ||
          Boolean(
            product.inStock === true ||
              product.stock_status === 'in_stock' ||
              product.stockStatus === 'in_stock' ||
              (product.stockLevel !== undefined &&
                product.stockLevel !== null &&
                product.stockLevel > 0) ||
              (product.inventory !== undefined &&
                product.inventory !== null &&
                product.inventory > 0) ||
              product.available === true ||
              product.purchasable === true
          );

    return {
      productName,
      productId,
      imageUrl,
      blurDataURL,
      allArtists,
      allLabels,
      format,
      productUrl,
      hasAudio,
      isInStock
    };
  }, [product, enhancedTracklist]);

  useEffect(() => {
    if (containerRef.current && product.id) {
      preloadOnHover(containerRef.current, product.id);
    }
  }, [product.id]);

  useEffect(() => {
    const sanityTracklist = product.sanityContent?.tracklist;
    const swellTracklist = product.tracklist;

    let bestTracklist: Track[] = [];
    let dataSource = 'none';

    if (sanityTracklist && sanityTracklist.length > 0) {
      bestTracklist = sanityTracklist;
      dataSource = 'sanity';
    } else if (swellTracklist && swellTracklist.length > 0) {
      bestTracklist = swellTracklist;
      dataSource = 'swell';
    }

    const hasDefaultTitles = bestTracklist.some((track: Track) =>
      /^Track \d+$/i.test(track.title || '')
    );

    const hasEnhancedTitles = bestTracklist.some(
      (track: Track) => track.title && !/^Track \d+$/i.test(track.title)
    );

    const hasEnhancedArtists = bestTracklist.some(
      (track: Track) => track.artist && track.artist.trim() && track.artist.trim() !== 'Various'
    );

    if (bestTracklist.length > 0 && !hasReceivedEnhancement) {
      setEnhancedTracklist(bestTracklist);
      if (dataSource === 'sanity' && hasEnhancedTitles && hasEnhancedArtists) {
        setHasReceivedEnhancement(true);
      }
    }
  }, [product, hasReceivedEnhancement]);

  const playTracklistFromCard = useCallback(
    (startingTrackIndex = 0, tracklistToPlay: Track[] | null = null) => {
      const activeTracklist = tracklistToPlay || enhancedTracklist;

      if (!activeTracklist || activeTracklist.length === 0) {
        return;
      }

      const productArtist =
        product.sanityContent?.artist || product.artist || product.content?.artist;
      const isVariousArtist = Array.isArray(productArtist)
        ? productArtist.some((a: any) => a?.toLowerCase?.() === 'various')
        : typeof productArtist === 'string' && productArtist.toLowerCase() === 'various';

      const fallbackArtist = isVariousArtist
        ? 'Various'
        : Array.isArray(productArtist)
          ? productArtist[0]
          : productArtist || 'Unknown Artist';

      const playableTracks = activeTracklist
        .map((track: Track, index: number) => {
          if (!track || !track.audioUrl || track.audioUrl.trim() === '') {
            return null;
          }

          let trackArtist = fallbackArtist;
          if (track.artist && track.artist.trim() && track.artist.trim() !== 'Various') {
            trackArtist = track.artist.trim();
          }

          // Use enhanced track title if available, otherwise fall back to default
          let trackTitle = track.title || `Track ${index + 1}`;

          // Check if we have enhanced data stored globally
          if (typeof window !== 'undefined') {
            const productIdentifier = product.id || product._id || product.sanityContent?._id;
            if (productIdentifier) {
              const enhancedData = (window as any).lastEnhancedTracklists?.[productIdentifier];
              if (enhancedData && Array.isArray(enhancedData) && enhancedData[index]) {
                const enhancedTrack = enhancedData[index];
                if (enhancedTrack.title && !/^Track \d+$/i.test(enhancedTrack.title)) {
                  trackTitle = enhancedTrack.title;
                  if (enhancedTrack.artist && enhancedTrack.artist.trim() !== 'Various') {
                    trackArtist = enhancedTrack.artist.trim();
                  }
                }
              }
            }
          }

          const enhancedTrack = {
            ...track,
            title: trackTitle,
            artist: trackArtist,
            album: product.sanityContent?.title || product.title || product.name || 'Unknown Album',
            productSlug:
              product.productSlug || product.slug || product.handle || product.sku || product.id,
            productUrl: product.productSlug
              ? `/product/${product.productSlug}`
              : product.slug
                ? `/product/${product.slug}`
                : null,
            productName: product.sanityContent?.title || product.title || product.name,
            productImage:
              product.imageUrl ||
              product.images?.[0]?.file?.url ||
              product.sanityContent?.mainImage?.asset?.url ||
              product.mainImage?.asset?.url ||
              null,
            trackIndex: index,
            productId: product.id || product._id,
            sanityId: product.sanityContent?._id || product._id,
            swellId: product.id,
            discogsReleaseId: product.discogsReleaseId || product.sanityContent?.discogsReleaseId
          };

          return enhancedTrack;
        })
        .filter(Boolean);

      if (playableTracks.length === 0) {
        return;
      }

      const actualStartIndex = Math.max(0, Math.min(startingTrackIndex, playableTracks.length - 1));

      if (typeof window !== 'undefined' && (window as any).playTracklist) {
        (window as any).playTracklist(playableTracks, actualStartIndex);
      } else {
        import('../layout/footer/AudioPlayer')
          .then((audioPlayer: any) => {
            if (audioPlayer.playTracklist) {
              audioPlayer.playTracklist(playableTracks, actualStartIndex);
            } else if (audioPlayer.playTrack) {
              audioPlayer.playTrack(playableTracks[actualStartIndex]);
            }
          })
          .catch(() => {});
      }
    },
    [enhancedTracklist, product]
  );

  const needsEnhancement = useMemo((): boolean => {
    const discogsReleaseId =
      product.discogsReleaseId ||
      product.sanityContent?.discogsReleaseId ||
      product.content?.discogsReleaseId;

    if (!discogsReleaseId) {
      return false;
    }

    const hasDefaultTitles = enhancedTracklist.some((track: Track) =>
      /^Track \d+$/i.test(track.title || '')
    );

    const productArtist =
      product.sanityContent?.artist || product.artist || product.content?.artist;
    const isVariousArtist = Array.isArray(productArtist)
      ? productArtist.some((a: any) => a?.toLowerCase?.() === 'various')
      : typeof productArtist === 'string' && productArtist.toLowerCase() === 'various';

    const tracksNeedingArtistEnhancement = isVariousArtist
      ? enhancedTracklist.filter((track: Track) => {
          const missingArtist =
            !track.artist || track.artist.trim() === '' || track.artist.trim() === 'Various';
          return missingArtist;
        })
      : [];

    const needsTitleEnhancement = hasDefaultTitles;
    const needsArtistEnhancement = isVariousArtist && tracksNeedingArtistEnhancement.length > 0;

    const finalDecision =
      (needsTitleEnhancement || needsArtistEnhancement) && !hasReceivedEnhancement;

    return finalDecision;
  }, [enhancedTracklist, hasReceivedEnhancement, product]);

  const handlePlayClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      // Show cart button when play is clicked
      setShowCartButton(true);

      // Check if this product is currently playing
      if (isCurrentProductPlaying()) {
        // If playing, pause it (don't stop)
        if ((window as any).pauseTrack) {
          (window as any).pauseTrack();
        }
        return;
      }

      // Check if this product was paused (has current track but not playing)
      const globalState = (window as any).globalAudioState;
      const currentTrack = globalState?.currentTrack;
      if (currentTrack && !globalState?.isPlaying) {
        const currentTrackProductId =
          currentTrack.productId || currentTrack.swellId || currentTrack.sanityId;
        const thisProductId = product.id || product._id || product.sanityContent?._id;

        if (currentTrackProductId === thisProductId) {
          // Resume the paused track
          if ((window as any).resumeTrack) {
            (window as any).resumeTrack();
          }
          return;
        }
      }

      // If not playing, start playing from beginning
      if (!productData.hasAudio) {
        return;
      }

      playTracklistFromCard(0);

      if (needsEnhancement && !hasReceivedEnhancement && !isEnhancing) {
        setIsEnhancing(true);
        setShouldEnhance(true);
      }
    },
    [
      isCurrentProductPlaying,
      productData.hasAudio,
      needsEnhancement,
      enhancedTracklist,
      hasReceivedEnhancement,
      isEnhancing,
      playTracklistFromCard,
      product
    ]
  );

  useEffect(() => {
    if (isEnhancing) {
      const timeoutId = setTimeout(() => {
        setIsEnhancing(false);
        setShouldEnhance(false);
      }, 30000);

      return () => {
        clearTimeout(timeoutId);
      };
    }
    return undefined;
  }, [isEnhancing]);

  useEffect(() => {
    const handleTracklistUpdate = (event: CustomEvent) => {
      const eventDetail = event.detail;
      const ourSanityId = product.sanityContent?._id || product._id;
      const ourSwellId = product.id;
      const eventSanityId = eventDetail.documentId;
      const eventSwellId = eventDetail.swellProductId;
      const isOurProduct = ourSanityId === eventSanityId || ourSwellId === eventSwellId;

      if (isOurProduct && eventDetail.tracklist && eventDetail.tracklist.length > 0) {
        console.log('ProductCard received enhanced tracklist:', {
          productId: ourSwellId || ourSanityId,
          trackCount: eventDetail.tracklist.length,
          sampleTrack: eventDetail.tracklist[0],
          enhancementTypes: eventDetail.enhancementTypes
        });

        // Update local enhanced tracklist
        setEnhancedTracklist([...eventDetail.tracklist]);
        setHasReceivedEnhancement(true);
        setIsEnhancing(false);

        if (typeof window !== 'undefined') {
          const productIdentifiers = {
            sanityId: ourSanityId,
            swellId: ourSwellId,
            productSlug: product.productSlug || product.slug || product.handle,
            productName: productData.productName,
            discogsReleaseId: product.sanityContent?.discogsReleaseId || product.discogsReleaseId
          };

          // Store enhanced tracklist globally for future reference
          if (!(window as any).lastEnhancedTracklists) {
            (window as any).lastEnhancedTracklists = {};
          }
          const productIdentifier = ourSwellId || ourSanityId;
          if (productIdentifier) {
            (window as any).lastEnhancedTracklists[productIdentifier] = eventDetail.tracklist;
          }

          // Update global audio state if this product is currently playing
          const globalState = (window as any).globalAudioState;
          if (globalState?.currentTrack) {
            const currentTrackProductId =
              globalState.currentTrack.productId ||
              globalState.currentTrack.swellId ||
              globalState.currentTrack.sanityId;
            if (currentTrackProductId === productIdentifier) {
              const currentTrackIndex = globalState.currentTrack.trackIndex;
              if (
                typeof currentTrackIndex === 'number' &&
                eventDetail.tracklist[currentTrackIndex]
              ) {
                const enhancedCurrentTrack = {
                  ...globalState.currentTrack,
                  title:
                    eventDetail.tracklist[currentTrackIndex].title ||
                    globalState.currentTrack.title,
                  artist:
                    eventDetail.tracklist[currentTrackIndex].artist ||
                    globalState.currentTrack.artist
                };

                globalState.currentTrack = enhancedCurrentTrack;

                // Update current album tracks
                if (globalState.currentAlbumTracks) {
                  globalState.currentAlbumTracks = eventDetail.tracklist.map(
                    (track: Track, index: number) => ({
                      ...track,
                      trackIndex: index,
                      productId: ourSwellId || ourSanityId,
                      sanityId: ourSanityId,
                      swellId: ourSwellId,
                      productName: productData.productName,
                      productImage: productData.imageUrl,
                      album: productData.productName
                    })
                  );
                }

                // Update play history if exists
                if (globalState.playHistory && typeof globalState.currentTrackIndex === 'number') {
                  globalState.playHistory[globalState.currentTrackIndex] = enhancedCurrentTrack;
                }

                // Notify all listeners
                if (globalState.listeners) {
                  globalState.listeners.forEach((listener: any) => {
                    try {
                      listener();
                    } catch (error) {}
                  });
                }
              }
            }
          }

          // Dispatch enhanced tracklist available event
          const trackUpdateEvent = new CustomEvent('enhancedTracklistAvailable', {
            detail: {
              productId: ourSwellId || ourSanityId,
              productIdentifiers,
              enhancedTracklist: eventDetail.tracklist,
              timestamp: Date.now(),
              enhancementTypes: eventDetail.enhancementTypes || {}
            }
          });

          window.dispatchEvent(trackUpdateEvent);
        }
      }
    };

    // Listen for both legacy and new enhancement events
    const eventTypes = ['tracklistUpdated', 'sanityDataUpdated'];
    eventTypes.forEach((eventType) => {
      window.addEventListener(eventType, handleTracklistUpdate as EventListener);
    });

    return () => {
      eventTypes.forEach((eventType) => {
        window.removeEventListener(eventType, handleTracklistUpdate as EventListener);
      });
    };
  }, [
    product.id,
    product._id,
    product.sanityContent?._id,
    enhancedTracklist.length,
    playTracklistFromCard,
    productData.productName,
    productData.imageUrl
  ]);

  // Add an effect to listen for audio state changes
  useEffect(() => {
    if (!isMounted) return;

    const updatePlayingState = () => {
      setIsPlaying(isCurrentProductPlaying());
    };

    updatePlayingState();
    const interval = setInterval(updatePlayingState, 250);

    const globalState = (window as any).globalAudioState;
    if (globalState && globalState.listeners) {
      globalState.listeners.add(updatePlayingState);
    }

    return () => {
      clearInterval(interval);
      if (globalState && globalState.listeners) {
        globalState.listeners.delete(updatePlayingState);
      }
    };
  }, [isMounted, isCurrentProductPlaying]);

  const renderLinks = useCallback((items: string[], linkType: string): React.ReactNode => {
    if (items.length === 0) return null;
    const textClass = 'text-muted';
    return items.map((item: string, index: number) => (
      <span key={`${linkType}-${index}-${item}`}>
        <Link
          href={`/shop/${linkType}/${createSlug(item)}`}
          className={`text-decoration-none ${textClass} hover:text-primary`}
        >
          {item}
        </Link>
        {index < items.length - 1 && <span className={textClass}>, </span>}
      </span>
    ));
  }, []);

  function PlayIcon({ className = 'w-4 h-4', isLoading = false }: PlayIconProps) {
    const currentlyPlaying = isCurrentProductPlaying();

    if (isLoading) {
      return (
        <svg
          className={`${className} animate-spin`}
          fill="none"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      );
    }

    if (currentlyPlaying) {
      // Pause icon
      return (
        <svg
          className={className}
          fill="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            d="M6.75 5.25a.75.75 0 01.75-.75H9a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H7.5a.75.75 0 01-.75-.75V5.25zm7.5 0A.75.75 0 0115 4.5h1.5a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H15a.75.75 0 01-.75-.75V5.25z"
            clipRule="evenodd"
          />
        </svg>
      );
    }

    // Play icon (default)
    return (
      <svg
        className={className}
        fill="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fillRule="evenodd"
          d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z"
          clipRule="evenodd"
        />
      </svg>
    );
  }

  const handleImageLoad = useCallback((): void => {
    setHasLoaded(true);
  }, []);

  const handleImageError = useCallback((e: React.SyntheticEvent<HTMLImageElement>): void => {
    const target = e.target as HTMLImageElement;
    target.src = '/placeholder.jpg';
    setImageError(true);
  }, []);

  const {
    productName,
    imageUrl,
    blurDataURL,
    allArtists,
    allLabels,
    productUrl,
    hasAudio,
    isInStock
  } = productData;

  const discogsReleaseId =
    product.discogsReleaseId ||
    product.sanityContent?.discogsReleaseId ||
    product.content?.discogsReleaseId ||
    // Fallback: try common alternative field names
    (product as any).discogs_release_id ||
    (product.sanityContent as any)?.discogs_release_id;

  const playButtonTitle = isPlaying ? 'Pause tracklist' : 'Play tracklist';
  const playButtonAriaLabel = isPlaying ? 'Pause tracklist' : 'Play tracklist';

  // Create a Swell-compatible product object for the AddToCartButton
  const swellProduct = {
    id: product.sanityContent?.swellProductId || product.id,
    name: productName,
    price: product.price,
    slug: product.productSlug || product.slug
  };

  return (
    <>
      {shouldEnhance && isEnhancing && needsEnhancement && discogsReleaseId && (
        <TracklistUpdater
          key={`${product.id || product._id}-tracklist-updater-${Date.now()}`}
          swellProduct={{
            id: product.id || product._id,
            name: productName
          }}
          sanityContent={{
            _id: product.sanityContent?._id || product._id,
            title: productName,
            artist: product.sanityContent?.artist || product.artist || product.content?.artist,
            tracklist: enhancedTracklist,
            discogsReleaseId: product.discogsReleaseId || product.sanityContent?.discogsReleaseId,
            tracklistEnhanced: product.sanityContent?.tracklistEnhanced
          }}
        />
      )}

      <div className={`product m-0 mb-5 p-0`}>
        <div
          className={isInFirstSixFeatured ? 'px-sm-5 px-md-0 px-xl-5 px-0' : ''}
          style={{
            backgroundColor: 'black'
          }}
        >
          <div
            className={`position-relative mx-auto overflow-hidden ${
              isInFirstSixFeatured ? 'w-100 w-sm-60 w-md-100 w-xl-60' : 'w-100'
            }`}
            style={{
              aspectRatio: '1/1',
              zIndex: 1
            }}
          >
            <Link
              href={productUrl}
              className={
                shouldUseFeaturedStyle
                  ? 'd-block px-sm-5 py-sm-5 px-md-0 py-md-0 px-xl-5 py-xl-5 px-0 py-0'
                  : 'd-block bg-black'
              }
            >
              {isMounted && (
                <div
                  className="position-relative w-100 h-100"
                  style={{
                    aspectRatio: '1/1',
                    overflow: 'hidden'
                  }}
                >
                  <Image
                    src={imageUrl}
                    alt={productName}
                    fill
                    className="transition-opacity"
                    priority={priority}
                    placeholder={blurDataURL ? 'blur' : 'empty'}
                    blurDataURL={blurDataURL}
                    onLoad={handleImageLoad}
                    onError={handleImageError}
                    unoptimized={true}
                    style={{
                      objectFit: 'cover',
                      objectPosition: 'center',
                      transition: 'opacity 0.3s ease-in-out',
                      width: '100%',
                      height: '100%'
                    }}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>
              )}
            </Link>

            {/* NowPlayingOverlay outside the Link */}
            <NowPlayingOverlay
              productId={product.id || product._id}
              sanityId={product.sanityContent?._id || product._id}
              swellId={product.id}
            />
          </div>
        </div>

        <div className={`card-body row d-flex m-0 p-0 pe-3 ps-2 pt-2`}>
          <div className={`col d-flex align-items-center m-0 p-0 pe-4`}>
            <div className="info col">
              <div className={`m-0 me-3`}>
                {allArtists.length > 0 && (
                  <div className="lh-sm">
                    <span className="text-muted me-2">{renderLinks(allArtists, 'artist')}</span>
                  </div>
                )}

                <h2 className="product_title fs-6 fw-bold lh-sm">
                  <Link href={productUrl} className="text-decoration-none">
                    {productName}
                  </Link>
                </h2>
              </div>
            </div>
          </div>

          {shouldUseFeaturedStyle &&
            (product.shortDescription || product.sanityContent?.shortDescription) && (
              <div className="musicby m-0 p-0">
                <p className="small italic">
                  {product.shortDescription || product.sanityContent?.shortDescription}
                </p>
              </div>
            )}

          <div className={`small tags d-flex m-0 mt-2 flex-wrap p-0`}>
            <div className="d-flex align-items-center">
              {hasAudio && (
                <button
                  onClick={handlePlayClick}
                  className="btn btn-link text-muted me-2 p-0"
                  style={{
                    fontSize: '16px',
                    lineHeight: 1,
                    border: 'none',
                    background: 'none',
                    transition: 'all 0.2s ease'
                  }}
                  title={playButtonTitle}
                  aria-label={playButtonAriaLabel}
                >
                  <PlayIcon className="play h-4 w-4" />
                </button>
              )}

              {isInStock &&
                (product.price ? (
                  <Price
                    amount={product.price.toString()}
                    currencyCode="USD"
                    className="d-inline"
                    currencyCodeClassName="d-none"
                  />
                ) : (
                  <span>Price TBA</span>
                ))}
            </div>
          </div>

          {/* Add to Cart Button - shows after play button clicked */}
          {showCartButton && swellProduct.id && productData.isInStock && product.price && (
            <div className="mt-2 px-0">
              <AddToCart
                product={swellProduct}
                availableForSale={productData.isInStock}
                variant="compact"
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
}
