// components/products/NowPlayingOverlay.tsx
'use client';

import { useEffect, useState } from 'react';

// Import getCurrentTrack function - adjust path based on your file structure
const getCurrentTrack = () => {
  if (typeof window !== 'undefined' && (window as any).getCurrentTrack) {
    return (window as any).getCurrentTrack();
  }
  return null;
};

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

interface NowPlayingOverlayProps {
  productId?: string;
  sanityId?: string;
  swellId?: string;
  className?: string;
}

export default function NowPlayingOverlay({
  productId,
  sanityId,
  swellId,
  className = ''
}: NowPlayingOverlayProps) {
  const [mounted, setMounted] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [trackIsPlaying, setTrackIsPlaying] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [lastPlayingTime, setLastPlayingTime] = useState(0);
  const [isIdle, setIsIdle] = useState(false);
  const [idleTransitionStartTime, setIdleTransitionStartTime] = useState<number | null>(null);
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const updateTrackInfo = () => {
      const track = getCurrentTrack() as Track | null;
      const playing = Boolean((window as any).globalAudioState?.isPlaying);

      setCurrentTrack(track);
      setTrackIsPlaying(Boolean(playing));

      // Check if this track belongs to this product
      if (track) {
        const trackProductId = track.productId || track.swellId || track.sanityId;
        const matchesProduct = Boolean(
          (productId && trackProductId === productId) ||
            (sanityId && trackProductId === sanityId) ||
            (swellId && trackProductId === swellId)
        );

        setIsVisible(matchesProduct);

        if (playing && matchesProduct) {
          setLastPlayingTime(Date.now());
          setIsIdle(false);
          setIdleTransitionStartTime(null);
        }
      } else {
        setIsVisible(false);
      }
    };

    // Enhanced tracklist event handlers
    const handleEnhancedTracklist = (event: CustomEvent) => {
      const eventDetail = event.detail;
      const currentGlobalTrack = getCurrentTrack() as Track | null;

      if (!currentGlobalTrack) return;

      // Check if this enhancement is for our current track's product
      const currentProductId =
        currentGlobalTrack.productId || currentGlobalTrack.swellId || currentGlobalTrack.sanityId;
      const eventProductId =
        eventDetail.documentId || eventDetail.swellProductId || eventDetail.productKey;

      const isOurProduct =
        currentProductId &&
        eventProductId &&
        (currentProductId === eventProductId ||
          eventDetail.documentId === (sanityId || currentGlobalTrack.sanityId) ||
          eventDetail.swellProductId === (swellId || currentGlobalTrack.swellId));

      if (!isOurProduct) return;

      const enhancedTracklist = eventDetail.tracklist;
      if (!enhancedTracklist || !Array.isArray(enhancedTracklist)) return;

      const currentTrackIndex = currentGlobalTrack.trackIndex;
      if (
        typeof currentTrackIndex !== 'number' ||
        currentTrackIndex < 0 ||
        currentTrackIndex >= enhancedTracklist.length
      )
        return;

      const enhancedTrack = enhancedTracklist[currentTrackIndex];
      if (!enhancedTrack) return;

      // Update current track with enhanced data
      const updatedTrack = {
        ...currentGlobalTrack,
        title: enhancedTrack.title || currentGlobalTrack.title,
        artist: enhancedTrack.artist || currentGlobalTrack.artist
      };

      // Update global audio state
      const globalState = (window as any).globalAudioState;
      if (globalState) {
        globalState.currentTrack = updatedTrack;

        // Update play history if exists
        if (globalState.playHistory && typeof globalState.currentTrackIndex === 'number') {
          globalState.playHistory[globalState.currentTrackIndex] = updatedTrack;
        }

        // Update current album tracks
        if (
          globalState.currentAlbumTracks &&
          currentTrackIndex < globalState.currentAlbumTracks.length
        ) {
          globalState.currentAlbumTracks[currentTrackIndex] = enhancedTrack;
        }

        // Store enhanced data globally for future reference
        if (!(window as any).lastEnhancedTracklists) {
          (window as any).lastEnhancedTracklists = {};
        }
        (window as any).lastEnhancedTracklists[eventProductId] = enhancedTracklist;

        // Notify all listeners
        if (globalState.listeners) {
          globalState.listeners.forEach((listener: any) => {
            try {
              listener();
            } catch (error) {}
          });
        }
      }

      setCurrentTrack(updatedTrack);
    };

    updateTrackInfo();

    const interval = setInterval(updateTrackInfo, 250);

    const globalState = (window as any).globalAudioState;
    if (globalState && globalState.listeners) {
      globalState.listeners.add(updateTrackInfo);
    }

    // Listen for enhancement events
    const eventTypes = ['tracklistUpdated', 'sanityDataUpdated', 'enhancedTracklistAvailable'];
    eventTypes.forEach((eventType) => {
      window.addEventListener(eventType, handleEnhancedTracklist as EventListener);
    });

    return () => {
      clearInterval(interval);
      if (globalState && globalState.listeners) {
        globalState.listeners.delete(updateTrackInfo);
      }
      eventTypes.forEach((eventType) => {
        window.removeEventListener(eventType, handleEnhancedTracklist as EventListener);
      });
    };
  }, [mounted, productId, sanityId, swellId]);

  // Handle idle state for fade out
  useEffect(() => {
    if (!mounted || !isVisible) return;

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
        !trackIsPlaying && lastPlayingTime && timeSinceLastPlaying > 3000;

      if (shouldStartIdleTransition && !idleTransitionStartTime && !isIdle) {
        setIdleTransitionStartTime(now);
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
  }, [mounted, isVisible, trackIsPlaying, lastPlayingTime, idleTransitionStartTime, isIdle]);

  // Check for tracks within current product only, not global history
  const getCurrentProductTracks = () => {
    if (typeof window === 'undefined' || !mounted) {
      return { canGoBack: false, canGoForward: false };
    }

    const globalState = (window as any).globalAudioState;
    if (!globalState?.currentAlbumTracks || !currentTrack)
      return { canGoBack: false, canGoForward: false };

    const currentTrackIndex = currentTrack.trackIndex || 0;
    const totalTracks = globalState.currentAlbumTracks.length;

    return {
      canGoBack: currentTrackIndex > 0,
      canGoForward: currentTrackIndex < totalTracks - 1
    };
  };

  const { canGoBack, canGoForward } = getCurrentProductTracks();

  const handlePreviousTrack = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();

    if (!canGoBack || !currentTrack) return;

    const globalState = (window as any).globalAudioState;
    if (globalState?.currentAlbumTracks && typeof currentTrack.trackIndex === 'number') {
      const prevTrackIndex = currentTrack.trackIndex - 1;
      if (prevTrackIndex >= 0 && globalState.currentAlbumTracks[prevTrackIndex]) {
        const prevTrack = globalState.currentAlbumTracks[prevTrackIndex];

        // Preserve enhanced track data if available
        const productIdentifier =
          currentTrack.productId || currentTrack.swellId || currentTrack.sanityId;
        if (productIdentifier && (window as any).lastEnhancedTracklists?.[productIdentifier]) {
          const enhancedData = (window as any).lastEnhancedTracklists[productIdentifier];
          if (enhancedData[prevTrackIndex]) {
            prevTrack.title = enhancedData[prevTrackIndex].title || prevTrack.title;
            prevTrack.artist = enhancedData[prevTrackIndex].artist || prevTrack.artist;
          }
        }

        if ((window as any).playTrack) {
          (window as any).playTrack(prevTrack);
        }
      }
    }
  };

  const handleNextTrack = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();

    if (!canGoForward || !currentTrack) return;

    const globalState = (window as any).globalAudioState;
    if (globalState?.currentAlbumTracks && typeof currentTrack.trackIndex === 'number') {
      const nextTrackIndex = currentTrack.trackIndex + 1;
      if (
        nextTrackIndex < globalState.currentAlbumTracks.length &&
        globalState.currentAlbumTracks[nextTrackIndex]
      ) {
        const nextTrack = globalState.currentAlbumTracks[nextTrackIndex];

        // Preserve enhanced track data if available
        const productIdentifier =
          currentTrack.productId || currentTrack.swellId || currentTrack.sanityId;
        if (productIdentifier && (window as any).lastEnhancedTracklists?.[productIdentifier]) {
          const enhancedData = (window as any).lastEnhancedTracklists[productIdentifier];
          if (enhancedData[nextTrackIndex]) {
            nextTrack.title = enhancedData[nextTrackIndex].title || nextTrack.title;
            nextTrack.artist = enhancedData[nextTrackIndex].artist || nextTrack.artist;
          }
        }

        if ((window as any).playTrack) {
          (window as any).playTrack(nextTrack);
        }
      }
    }
  };

  if (!mounted || !isVisible || !currentTrack) {
    return null;
  }

  const getOverlayStyles = () => {
    const now = Date.now();

    if (idleTransitionStartTime && !isIdle) {
      const idleTransitionElapsed = now - idleTransitionStartTime;
      const progress = Math.min(idleTransitionElapsed / 2000, 1);
      const opacity = 1 - progress * 0.7;
      const blur = progress * 8;

      return {
        opacity,
        filter: `blur(${blur}px)`,
        willChange: 'opacity, filter'
      };
    } else if (isIdle) {
      return {
        opacity: 0.3,
        filter: 'blur(8px)',
        transition: 'opacity 0.3s ease-out, filter 0.3s ease-out',
        willChange: 'opacity, filter'
      };
    } else {
      return {
        opacity: 1,
        filter: 'blur(0px)',
        transition: 'opacity 0.15s ease-out, filter 0.15s ease-out',
        willChange: 'opacity, filter'
      };
    }
  };

  return (
    <div
      className={`position-absolute w-100 h-100 ${className}`}
      style={{
        top: 0,
        left: 0,
        zIndex: 10,
        pointerEvents: 'none',
        ...getOverlayStyles()
      }}
      onMouseEnter={() => {
        setIsHovering(true);
        if (isIdle || idleTransitionStartTime) {
          setIsIdle(false);
          setIdleTransitionStartTime(null);
        }
      }}
      onMouseLeave={() => {
        setIsHovering(false);
      }}
    >
      {/* Bottom overlay with controls and title - blocks entire horizontal area */}
      <div
        className="position-absolute w-100 d-flex align-items-center justify-content-between"
        style={{
          bottom: 0,
          left: 0,
          padding: '12px',
          pointerEvents: 'auto',
          minHeight: '40px',
          cursor: 'default' // Default cursor for non-interactive area
        }}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          e.nativeEvent.stopImmediatePropagation();
        }}
        onMouseDown={(e) => {
          e.preventDefault();
          e.stopPropagation();
          e.nativeEvent.stopImmediatePropagation();
        }}
      >
        {/* Skip Previous Button - only show when hovering */}
        <button
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            e.nativeEvent.stopImmediatePropagation();
          }}
          onClick={handlePreviousTrack}
          className="flex-shrink-0"
          style={{
            background: 'none',
            border: 'none',
            color: canGoBack && isHovering ? '#ffd700' : 'transparent',
            fontSize: '1rem',
            cursor: canGoBack && isHovering ? 'pointer' : 'default',
            padding: 0,
            width: '16px',
            height: '16px',
            filter:
              canGoBack && isHovering
                ? `
              drop-shadow(-0.5px -0.5px 0 #000)
              drop-shadow(0.5px -0.5px 0 #000)
              drop-shadow(-0.5px 0.5px 0 #000)
              drop-shadow(0.5px 0.5px 0 #000)
              drop-shadow(-1px 0 0 #000)
              drop-shadow(1px 0 0 #000)
              drop-shadow(0 -1px 0 #000)
              drop-shadow(0 1px 0 #000)
            `
                : 'none',
            transition: 'opacity 0.2s ease',
            visibility: canGoBack && isHovering ? 'visible' : 'hidden'
          }}
          onMouseEnter={(e) => canGoBack && isHovering && (e.currentTarget.style.opacity = '0.8')}
          onMouseLeave={(e) => canGoBack && isHovering && (e.currentTarget.style.opacity = '1')}
          title="Previous track"
          disabled={!canGoBack}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="currentColor"
            stroke="currentColor"
            strokeWidth="1"
          >
            <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
          </svg>
        </button>

        {/* Track Title with Music Icon */}
        <div
          className="flex-grow-1 mx-3 text-center"
          style={{
            minWidth: 0
          }}
        >
          <div
            className="fs-6 fw-bold font-monospace text-uppercase d-flex align-items-center justify-content-center"
            style={{
              color: '#ffd700',
              lineHeight: '1.2',
              filter: `
                drop-shadow(-0.5px -0.5px 0 #000)
                drop-shadow(0.5px -0.5px 0 #000)
                drop-shadow(-0.5px 0.5px 0 #000)
                drop-shadow(0.5px 0.5px 0 #000)
                drop-shadow(-1px 0 0 #000)
                drop-shadow(1px 0 0 #000)
                drop-shadow(0 -1px 0 #000)
                drop-shadow(0 1px 0 #000)
              `,
              gap: '6px'
            }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="currentColor"
              stroke="currentColor"
              strokeWidth="1"
              style={{ flexShrink: 0 }}
            >
              <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
            </svg>
            <span
              style={{
                minWidth: 0,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
            >
              {currentTrack.title || 'Unknown Track'}
            </span>
          </div>
        </div>

        {/* Skip Next Button */}
        <button
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            e.nativeEvent.stopImmediatePropagation();
          }}
          onClick={handleNextTrack}
          className="flex-shrink-0"
          style={{
            background: 'none',
            border: 'none',
            color: canGoForward ? '#ffd700' : 'transparent',
            fontSize: '1rem',
            cursor: canGoForward ? 'pointer' : 'default',
            padding: 0,
            width: '16px',
            height: '16px',
            filter: canGoForward
              ? `
              drop-shadow(-0.5px -0.5px 0 #000)
              drop-shadow(0.5px -0.5px 0 #000)
              drop-shadow(-0.5px 0.5px 0 #000)
              drop-shadow(0.5px 0.5px 0 #000)
              drop-shadow(-1px 0 0 #000)
              drop-shadow(1px 0 0 #000)
              drop-shadow(0 -1px 0 #000)
              drop-shadow(0 1px 0 #000)
            `
              : 'none',
            transition: 'opacity 0.2s ease',
            visibility: canGoForward ? 'visible' : 'hidden'
          }}
          onMouseEnter={(e) => canGoForward && (e.currentTarget.style.opacity = '0.8')}
          onMouseLeave={(e) => canGoForward && (e.currentTarget.style.opacity = '1')}
          title="Next track"
          disabled={!canGoForward}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="currentColor"
            stroke="currentColor"
            strokeWidth="1"
          >
            <path d="M16 18h2V6h-2zm-3.5-6L4 6v12z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
