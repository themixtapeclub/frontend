// components/layout/header/now-playing.tsx

'use client';

import { BackwardIcon, ForwardIcon, PauseIcon, PlayIcon } from '@heroicons/react/24/solid';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { getCurrentTrack } from '../footer/AudioPlayer';
import { useSearch } from './search-provider';

interface Track {
  title?: string;
  artist?: string;
  album?: string;
  productImage?: string;
  productSlug?: string;
  productUrl?: string;
  audioUrl?: string;
  productId?: string;
  sanityId?: string;
  swellId?: string;
  trackIndex?: number;
}

export default function NowPlaying() {
  const { isSearchVisible } = useSearch();
  const router = useRouter();
  const progressBarRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [lastKnownTrack, setLastKnownTrack] = useState<Track | null>(null);
  const [trackIsPlaying, setTrackIsPlaying] = useState(false);
  const [lastPlayingTime, setLastPlayingTime] = useState(0);
  const [slowHideStartTime, setSlowHideStartTime] = useState<number | null>(null);
  const [hasPlaylistControls, setHasPlaylistControls] = useState(false);
  const [previousTrackId, setPreviousTrackId] = useState<string | null>(null);
  const [isIdle, setIsIdle] = useState(false);
  const [idleTransitionStartTime, setIdleTransitionStartTime] = useState<number | null>(null);
  const [justWokeUp, setJustWokeUp] = useState(false);
  const [lastKnownProgress, setLastKnownProgress] = useState(0);

  const findEnhancedTrackData = (track: Track) => {
    if (!track) return null;

    const globalState = (window as any).globalAudioState;
    const productId = track.productId || track.swellId || track.sanityId;

    if (globalState?.playHistory && typeof track.trackIndex === 'number') {
      const playHistoryTrack = globalState.playHistory[track.trackIndex];
      if (
        playHistoryTrack &&
        playHistoryTrack.title &&
        !/^Track \d+$/i.test(playHistoryTrack.title)
      ) {
        return playHistoryTrack;
      }
    }

    if (globalState?.playHistory && productId) {
      for (let i = 0; i < globalState.playHistory.length; i++) {
        const historyTrack = globalState.playHistory[i];
        const historyProductId =
          historyTrack?.productId || historyTrack?.swellId || historyTrack?.sanityId;

        if (
          historyProductId === productId &&
          historyTrack?.trackIndex === track.trackIndex &&
          historyTrack?.title &&
          !/^Track \d+$/i.test(historyTrack.title)
        ) {
          return historyTrack;
        }
      }
    }

    if (typeof window !== 'undefined' && (window as any).lastEnhancedTracklists && productId) {
      const enhancedData = (window as any).lastEnhancedTracklists[productId];
      if (enhancedData && Array.isArray(enhancedData) && enhancedData[track.trackIndex || 0]) {
        const enhancedTrack = enhancedData[track.trackIndex || 0];
        if (enhancedTrack.title && !/^Track \d+$/i.test(enhancedTrack.title)) {
          return {
            ...track,
            title: enhancedTrack.title,
            artist: enhancedTrack.artist || track.artist
          };
        }
      }
    }

    return null;
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (currentTrack) {
      setLastKnownTrack(currentTrack);
    }
  }, [currentTrack]);

  useEffect(() => {
    if (!mounted) return;

    const handleEnhancedTracklistUpdate = (event: CustomEvent) => {
      const eventDetail = event.detail;
      const currentGlobalTrack = getCurrentTrack() as Track | null;

      if (!currentGlobalTrack) {
        return;
      }

      const currentProductId =
        (currentGlobalTrack as any).productId ||
        (currentGlobalTrack as any).swellId ||
        (currentGlobalTrack as any).sanityId;
      const eventProductId =
        eventDetail.productId || eventDetail.swellProductId || eventDetail.documentId;

      const isOurProduct =
        currentProductId &&
        eventProductId &&
        (currentProductId === eventProductId ||
          (currentGlobalTrack as any).sanityId === eventDetail.documentId ||
          (currentGlobalTrack as any).swellId === eventDetail.swellProductId ||
          (currentGlobalTrack as any).productId === eventDetail.productId);

      if (!isOurProduct) {
        return;
      }

      const enhancedTracklist = eventDetail.enhancedTracklist || eventDetail.tracklist;
      if (!enhancedTracklist || !Array.isArray(enhancedTracklist)) {
        return;
      }

      const currentTrackIndex = (currentGlobalTrack as any).trackIndex;
      if (
        typeof currentTrackIndex !== 'number' ||
        currentTrackIndex < 0 ||
        currentTrackIndex >= enhancedTracklist.length
      ) {
        return;
      }

      const enhancedTrack = enhancedTracklist[currentTrackIndex];
      if (!enhancedTrack) {
        return;
      }

      const updatedTrack = {
        ...(currentGlobalTrack as any),
        title: enhancedTrack.title || (currentGlobalTrack as any).title,
        artist: enhancedTrack.artist || (currentGlobalTrack as any).artist
      };

      if (typeof window !== 'undefined') {
        if (!(window as any).lastEnhancedTracklists) {
          (window as any).lastEnhancedTracklists = {};
        }
        (window as any).lastEnhancedTracklists[eventProductId] = enhancedTracklist;
      }

      setCurrentTrack(updatedTrack);
      setLastKnownTrack(updatedTrack);

      const globalState = (window as any).globalAudioState;
      if (globalState && globalState.playHistory) {
        for (let i = 0; i < globalState.playHistory.length; i++) {
          const playHistoryTrack = globalState.playHistory[i];
          const playHistoryProductId =
            playHistoryTrack?.productId || playHistoryTrack?.swellId || playHistoryTrack?.sanityId;

          if (
            playHistoryProductId === eventProductId &&
            typeof playHistoryTrack?.trackIndex === 'number'
          ) {
            const enhancedTrackForIndex = enhancedTracklist[playHistoryTrack.trackIndex];

            if (enhancedTrackForIndex) {
              globalState.playHistory[i] = {
                ...playHistoryTrack,
                title: enhancedTrackForIndex.title || playHistoryTrack.title,
                artist: enhancedTrackForIndex.artist || playHistoryTrack.artist
              };
            }
          }
        }

        if (
          globalState.currentTrack &&
          (globalState.currentTrack.productId === eventProductId ||
            globalState.currentTrack.swellId === eventProductId ||
            globalState.currentTrack.sanityId === eventProductId)
        ) {
          globalState.currentTrack = updatedTrack;
        }

        if (globalState.listeners) {
          globalState.listeners.forEach((listener: any) => {
            try {
              listener();
            } catch (error: any) {}
          });
        }
      }
    };

    const eventTypes = ['enhancedTracklistAvailable', 'tracklistUpdated', 'sanityDataUpdated'];

    eventTypes.forEach((eventType) => {
      window.addEventListener(eventType, handleEnhancedTracklistUpdate as EventListener);
    });

    return () => {
      eventTypes.forEach((eventType) => {
        window.removeEventListener(eventType, handleEnhancedTracklistUpdate as EventListener);
      });
    };
  }, [mounted]);

  useEffect(() => {
    if (!mounted) return;

    let lastLoggedTrackId = '';

    const updateTrackInfo = () => {
      const track = getCurrentTrack() as Track | null;
      const playing = (window as any).globalAudioState?.isPlaying || false;
      const currentTrackId = track?.audioUrl || track?.title || '';

      if (currentTrackId && currentTrackId !== previousTrackId) {
        setPreviousTrackId(currentTrackId);

        setIsIdle(false);
        setIdleTransitionStartTime(null);

        if (track && typeof track.trackIndex === 'number') {
          if (/^Track \d+$/i.test(track.title || '')) {
            const enhancedTrack = findEnhancedTrackData(track);
            if (enhancedTrack) {
              setCurrentTrack(enhancedTrack);
              return;
            }
          }
        }
      }

      setCurrentTrack(track);
      setTrackIsPlaying(playing);

      const globalState = (window as any).globalAudioState;
      const realProgress = globalState
        ? (globalState.currentTime / globalState.duration) * 100 || 0
        : 0;

      if (playing && realProgress > 0) {
        setLastKnownProgress(realProgress);
      }

      const controlsAvailable = !!(
        ((window as any).previousTrack && (window as any).nextTrack) ||
        (globalState?.playHistory && globalState.playHistory.length > 1) ||
        (globalState?.playlist && globalState.playlist.length > 1) ||
        (globalState?.previousTrack && globalState.nextTrack) ||
        (globalState?.tracks && globalState.tracks.length > 1) ||
        (globalState?.currentPlaylist && globalState.currentPlaylist.length > 1) ||
        globalState?.currentTrack
      );
      setHasPlaylistControls(controlsAvailable);

      if (playing) {
        const newTime = Date.now();
        setLastPlayingTime(newTime);

        setIsIdle(false);
        setIdleTransitionStartTime(null);
        setSlowHideStartTime(null);
      } else if (track && !playing && trackIsPlaying) {
        const globalState = (window as any).globalAudioState;
        const finalProgress = globalState
          ? (globalState.currentTime / globalState.duration) * 100 || 0
          : 0;
        if (finalProgress > lastKnownProgress) {
          setLastKnownProgress(finalProgress);
        }

        setLastKnownProgress(0);
      }
    };

    updateTrackInfo();

    const interval = setInterval(updateTrackInfo, 250);

    const globalState = (window as any).globalAudioState;
    if (globalState && globalState.listeners) {
      globalState.listeners.add(updateTrackInfo);
    }

    return () => {
      clearInterval(interval);
      if (globalState && globalState.listeners) {
        globalState.listeners.delete(updateTrackInfo);
      }
    };
  }, [mounted, previousTrackId, trackIsPlaying, lastKnownProgress]);

  useEffect(() => {
    if (!mounted) return;

    if (isSearchVisible) {
      setIsTransitioning(true);
      const timer = setTimeout(() => setIsHidden(true), 150);
      return () => clearTimeout(timer);
    } else {
      setIsHidden(false);
      setIsTransitioning(true);

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsTransitioning(false);
        });
      });
    }

    return undefined;
  }, [isSearchVisible, mounted]);

  useEffect(() => {
    if (!mounted) return;

    const checkIdleState = () => {
      const now = Date.now();
      const timeSinceLastPlaying = lastPlayingTime ? now - lastPlayingTime : 0;

      if (trackIsPlaying) {
        if (isIdle || idleTransitionStartTime) {
          setIsIdle(false);
          setIdleTransitionStartTime(null);
        }
        return;
      }

      const shouldStartIdleTransition =
        !trackIsPlaying && lastPlayingTime && timeSinceLastPlaying > 5000;

      if (shouldStartIdleTransition && !idleTransitionStartTime && !isSearchVisible && !isIdle) {
        setIdleTransitionStartTime(now);
        setJustWokeUp(false);
      }

      if (idleTransitionStartTime && !isIdle) {
        const idleTransitionElapsed = now - idleTransitionStartTime;
        if (idleTransitionElapsed > 2000) {
          setIsIdle(true);
          setIdleTransitionStartTime(null);
        }
      }
    };

    const idleCheckInterval = setInterval(checkIdleState, 100);

    return () => {
      clearInterval(idleCheckInterval);
    };
  }, [mounted, trackIsPlaying, lastPlayingTime, idleTransitionStartTime, isIdle, isSearchVisible]);

  const displayTrack = currentTrack || lastKnownTrack;

  // Try to get product image from current page if track doesn't have it
  const getProductImage = () => {
    if (displayTrack?.productImage) {
      return displayTrack.productImage;
    }

    // Try to get image from the current page's product data
    if (typeof window !== 'undefined') {
      // Look for product images in the current page
      const productImages = document.querySelectorAll(
        'img[alt*="product"], img[src*="sanity"], img[src*="swell"]'
      );
      if (productImages.length > 0) {
        const firstImage = productImages[0] as HTMLImageElement;
        if (firstImage.src && !firstImage.src.includes('placeholder')) {
          return firstImage.src;
        }
      }

      // Try to get from page metadata
      const ogImage = document.querySelector('meta[property="og:image"]') as HTMLMetaElement;
      if (ogImage && ogImage.content) {
        return ogImage.content;
      }
    }

    return null;
  };

  const productImage = getProductImage();

  if (!mounted || isHidden || !displayTrack) {
    return null;
  }

  const handleImageClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (displayTrack?.productSlug || displayTrack?.productUrl) {
      const href = displayTrack.productUrl || `/product/${displayTrack.productSlug}`;
      router.push(href);
    }
  };

  const handlePlayPause = () => {
    if (trackIsPlaying) {
      (window as any).pauseTrack?.();
    } else {
      (window as any).resumeTrack?.();
    }
  };

  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current) return;

    e.stopPropagation();

    if (isIdle || idleTransitionStartTime) {
      setIsIdle(false);
      setIdleTransitionStartTime(null);
    }

    const rect = progressBarRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const progressPercent = (clickX / rect.width) * 100;
    const clampedPercent = Math.max(0, Math.min(100, progressPercent));

    const globalState = (window as any).globalAudioState;

    if (globalState && globalState.duration && globalState.audioRef) {
      const targetTime = (clampedPercent / 100) * globalState.duration;

      if (globalState.audioRef.ended || !trackIsPlaying) {
        globalState.audioRef.currentTime = targetTime;
        globalState.currentTime = targetTime;

        globalState.audioRef
          .play()
          .then(() => {})
          .catch((error: any) => {});
      } else {
        globalState.audioRef.currentTime = targetTime;
        globalState.currentTime = targetTime;
      }

      setLastPlayingTime(Date.now());

      if (globalState.listeners) {
        globalState.listeners.forEach((listener: any) => listener());
      }
    }
  };

  const handlePreviousTrack = () => {
    if ((window as any).previousTrack) {
      (window as any).previousTrack();
    } else if ((window as any).globalAudioState?.previousTrack) {
      (window as any).globalAudioState.previousTrack();
    } else {
      import('../footer/AudioPlayer')
        .then((audioPlayer) => {
          if (audioPlayer.previousTrack) {
            audioPlayer.previousTrack();
          }
        })
        .catch(() => {});
    }
  };

  const handleNextTrack = () => {
    if ((window as any).nextTrack) {
      (window as any).nextTrack();
    } else if ((window as any).globalAudioState?.nextTrack) {
      (window as any).globalAudioState.nextTrack();
    } else {
      import('../footer/AudioPlayer')
        .then((audioPlayer) => {
          if (audioPlayer.nextTrack) {
            audioPlayer.nextTrack();
          }
        })
        .catch(() => {});
    }
  };

  const canGoBack = mounted && (window as any).globalAudioState?.currentTrackIndex > 0;
  const canGoForward =
    mounted &&
    (window as any).globalAudioState?.playHistory &&
    (window as any).globalAudioState.currentTrackIndex <
      (window as any).globalAudioState.playHistory.length - 1;

  const globalState = (window as any).globalAudioState;
  const realProgress =
    mounted && globalState ? (globalState.currentTime / globalState.duration) * 100 || 0 : 0;

  const currentProgress = trackIsPlaying ? realProgress : 0;

  const getTransitionStyles = () => {
    const now = Date.now();
    const baseStyles = {
      boxShadow: 'inset 0 0 0 1px #dee2e6'
    };

    if (isTransitioning) {
      return {
        ...baseStyles,
        transition: 'opacity 0.15s ease-out, filter 0.15s ease-out',
        opacity: 0,
        filter: 'blur(8px)',
        willChange: 'opacity, filter'
      };
    } else if (idleTransitionStartTime && !isIdle) {
      const idleTransitionElapsed = now - idleTransitionStartTime;
      const progress = Math.min(idleTransitionElapsed / 2000, 1);
      const opacity = 1 - progress * 0.6;
      const blur = progress * 12;

      return {
        ...baseStyles,
        opacity,
        filter: `blur(${blur}px)`,
        willChange: 'opacity, filter'
      };
    } else if (isIdle) {
      return {
        ...baseStyles,
        transition: 'opacity 0.3s ease-out, filter 0.3s ease-out',
        opacity: 0.4,
        filter: 'blur(12px)',
        willChange: 'opacity, filter'
      };
    } else {
      return {
        ...baseStyles,
        transition: 'opacity 0.15s ease-out, filter 0.15s ease-out',
        opacity: 1,
        filter: 'blur(0px)',
        willChange: 'opacity, filter'
      };
    }
  };

  return (
    <div
      className="now-playing col bg-white p-0"
      style={getTransitionStyles()}
      onMouseEnter={() => {
        if (isIdle || idleTransitionStartTime) {
          setIsIdle(false);
          setIdleTransitionStartTime(null);
          setJustWokeUp(true);
        }
      }}
    >
      <div className="d-flex align-items-center ps-2">
        {hasPlaylistControls && (
          <button
            onClick={handlePreviousTrack}
            className="btn me-2 p-0"
            style={{
              fontSize: '0.875rem',
              lineHeight: 1,
              width: '16px',
              color: canGoBack ? 'inherit' : '#6c757d',
              opacity: canGoBack ? 1 : 0.5
            }}
            title="Previous track"
            aria-label="Previous track"
            disabled={!canGoBack}
          >
            <BackwardIcon className="h-4 w-4" />
          </button>
        )}

        <button
          onClick={handlePlayPause}
          className="btn me-2 p-0"
          style={{ fontSize: '0.875rem', lineHeight: 1, width: '16px' }}
          title={trackIsPlaying ? 'Pause' : 'Play'}
          aria-label={trackIsPlaying ? 'Pause' : 'Play'}
        >
          {trackIsPlaying ? <PauseIcon className="h-4 w-4" /> : <PlayIcon className="h-4 w-4" />}
        </button>

        {hasPlaylistControls && (
          <button
            onClick={handleNextTrack}
            className="btn me-2 p-0"
            style={{
              fontSize: '0.875rem',
              lineHeight: 1,
              width: '16px',
              color: canGoForward ? 'inherit' : '#6c757d',
              opacity: canGoForward ? 1 : 0.5
            }}
            title="Next track"
            aria-label="Next track"
            disabled={!canGoForward}
          >
            <ForwardIcon className="h-4 w-4" />
          </button>
        )}

        {productImage && (
          <div
            style={{
              height: '1.45rem',
              width: '1.45rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            <img
              src={productImage}
              alt={displayTrack.album || displayTrack.title}
              style={{
                height: '100%',
                width: '100%',
                objectFit: 'cover',
                cursor: displayTrack.productSlug ? 'pointer' : 'default'
              }}
              onClick={displayTrack.productSlug ? handleImageClick : undefined}
              onLoad={() => {}}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
        )}

        <div
          ref={progressBarRef}
          className="flex-grow-1 position-relative"
          style={{
            backgroundColor: '#ffffff',
            height: '1.45rem',
            display: 'flex',
            alignItems: 'center',
            paddingRight: '0px',
            cursor: 'pointer',
            minWidth: 0,
            overflow: 'hidden'
          }}
          onClick={handleProgressBarClick}
          title="Click to seek"
        >
          <div
            style={{
              color: '#000000',
              zIndex: 2,
              fontSize: '0.875rem',
              pointerEvents: 'none',
              width: '100%',
              minWidth: 0,
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
              paddingLeft: '8px',
              borderTop: '1px solid #dee2e6',
              borderRight: '1px solid #dee2e6',
              borderBottom: '1px solid #dee2e6'
            }}
          >
            <span className="bold me-1">{displayTrack.title || 'Unknown Track'}</span>
            {displayTrack.artist && (
              <>
                <span> </span>
                <span>{displayTrack.artist}</span>
              </>
            )}
          </div>

          <div
            className="position-absolute h-100 start-0 top-0"
            style={{
              backgroundColor: '#ffffff',
              width: `${currentProgress}%`,
              transition: currentProgress === 0 ? 'none' : 'width 0.1s ease',
              mixBlendMode: 'difference',
              zIndex: 3,
              pointerEvents: 'none'
            }}
          />
        </div>
      </div>
    </div>
  );
}
