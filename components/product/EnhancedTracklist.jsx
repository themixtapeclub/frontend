// components/product/EnhancedTracklist.jsx - Enhanced with progress bar
'use client';

import { useEffect, useRef, useState } from 'react';
import { getCurrentTrack, playTracklist } from '../layout/footer/AudioPlayer';

const EnhancedTracklist = ({ swellProduct, sanityContent, title = 'Tracklist' }) => {
  const [localTracklist, setLocalTracklist] = useState(sanityContent?.tracklist || []);
  const [, forceUpdate] = useState({});
  const [mounted, setMounted] = useState(false);
  const progressBarRefs = useRef({});

  // Add idle state management like NowPlaying
  const [trackIsPlaying, setTrackIsPlaying] = useState(false);
  const [lastPlayingTime, setLastPlayingTime] = useState(0);
  const [isIdle, setIsIdle] = useState(false);
  const [idleTransitionStartTime, setIdleTransitionStartTime] = useState(null);
  const [lastKnownProgress, setLastKnownProgress] = useState(0);

  // Track global playing state for animated bars
  useEffect(() => {
    if (!mounted) return;

    const updatePlayingState = () => {
      const globalState = window.globalAudioState;
      const playing = globalState?.isPlaying || false;

      if (playing !== trackIsPlaying) {
        setTrackIsPlaying(playing);

        if (playing) {
          setLastPlayingTime(Date.now());
          setIsIdle(false);
          setIdleTransitionStartTime(null);
        } else {
          // Audio stopped - will trigger idle transition timer
        }
      }
    };

    // Check playing state more frequently for responsive animated bars
    const interval = setInterval(updatePlayingState, 100);

    // Also add to global listeners
    const globalState = window.globalAudioState;
    if (globalState && globalState.listeners) {
      globalState.listeners.add(updatePlayingState);
    }

    return () => {
      clearInterval(interval);
      if (globalState && globalState.listeners) {
        globalState.listeners.delete(updatePlayingState);
      }
    };
  }, [mounted, trackIsPlaying]);

  // Idle state management for animated bars
  useEffect(() => {
    if (!mounted) return;

    const checkIdleState = () => {
      const now = Date.now();
      const timeSinceLastPlaying = lastPlayingTime ? now - lastPlayingTime : 0;

      // If music is playing, reset idle state
      if (trackIsPlaying) {
        if (isIdle || idleTransitionStartTime) {
          setIsIdle(false);
          setIdleTransitionStartTime(null);
        }
        return;
      }

      // Start idle transition after 5 seconds
      const shouldStartIdleTransition =
        !trackIsPlaying && lastPlayingTime && timeSinceLastPlaying > 5000;

      if (shouldStartIdleTransition && !idleTransitionStartTime && !isIdle) {
        setIdleTransitionStartTime(now);
      }

      // Complete idle transition after 2 seconds
      if (idleTransitionStartTime && !isIdle) {
        const idleTransitionElapsed = now - idleTransitionStartTime;
        if (idleTransitionElapsed > 2000) {
          setIsIdle(true);
          setIdleTransitionStartTime(null);
        }
      }
    };

    const idleCheckInterval = setInterval(checkIdleState, 100);
    return () => clearInterval(idleCheckInterval);
  }, [mounted, trackIsPlaying, lastPlayingTime, idleTransitionStartTime, isIdle]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Listen for tracklist updates from TracklistUpdater
  useEffect(() => {
    const handleTracklistUpdate = (event) => {
      const eventDetail = event.detail;
      const productKey = `${swellProduct?.id}-${sanityContent?._id}`;

      // Update if it's for our product or a global update
      if (!eventDetail.productKey || eventDetail.productKey === productKey) {
        if (eventDetail.tracklist && eventDetail.tracklist.length > 0) {
          setLocalTracklist(eventDetail.tracklist);
        }
      }
    };

    window.addEventListener('tracklistUpdated', handleTracklistUpdate);
    return () => window.removeEventListener('tracklistUpdated', handleTracklistUpdate);
  }, [
    swellProduct?.id,
    sanityContent?._id,
    swellProduct?.name,
    sanityContent?.title,
    localTracklist.length
  ]);

  // 🔄 NEW: Listen for cache invalidation events from ProductCard enhancements
  useEffect(() => {
    const handleSanityDataUpdate = (event) => {
      const { type, documentId, swellProductId, tracklist } = event.detail;

      if (type === 'tracklistUpdate') {
        const currentProductId = swellProduct?.id || swellProduct?.swellProductId;
        const currentDocumentId = sanityContent?._id;

        // Check if this update affects the current product
        const isRelevantUpdate =
          documentId === currentDocumentId || swellProductId === currentProductId;

        if (isRelevantUpdate && tracklist) {
          // Update the local tracklist with the new data
          setLocalTracklist([...tracklist]);
        }
      }
    };

    window.addEventListener('sanityDataUpdated', handleSanityDataUpdate);

    return () => {
      window.removeEventListener('sanityDataUpdated', handleSanityDataUpdate);
    };
  }, [swellProduct?.id, swellProduct?.swellProductId, sanityContent?._id, localTracklist.length]);

  // Use the updated tracklist if available, otherwise fall back to original
  const displayTracklist =
    localTracklist.length > 0 ? localTracklist : sanityContent?.tracklist || [];

  // Subscribe to global audio state changes to update UI - Enhanced for responsiveness
  useEffect(() => {
    if (!mounted) return;

    // Direct listener for immediate updates
    const updateTrackProgress = () => {
      forceUpdate({});
    };

    // Add to global audio listeners for immediate updates
    const globalState = window.globalAudioState;
    if (globalState && globalState.listeners) {
      globalState.listeners.add(updateTrackProgress);
    }

    // Reduced interval for smoother progress updates
    const interval = setInterval(() => {
      forceUpdate({});
    }, 100); // Faster updates: 100ms instead of 250ms

    return () => {
      clearInterval(interval);
      if (globalState && globalState.listeners) {
        globalState.listeners.delete(updateTrackProgress);
      }
    };
  }, [mounted]);

  const handlePlayPause = (track, index) => {
    if (!track.audioUrl) {
      alert(`No audio available for "${track.title}"`);
      return;
    }

    // Prepare all tracks with enhanced metadata for the playlist
    const enhancedTracks = displayTracklist.map((t, i) => ({
      ...t,
      artist: t.artist || sanityContent?.artist?.[0] || '',
      album: sanityContent?.title || swellProduct?.name || '',
      productSlug: swellProduct?.slug,
      productUrl: swellProduct?.slug ? `/product/${swellProduct.slug}` : null,
      productName: swellProduct?.name || sanityContent?.title,
      productImage:
        swellProduct?.images?.[0]?.file?.url || sanityContent?.image?.asset?.url || null,
      title: t.title || `Track ${i + 1}`
    }));

    // Filter to only include tracks with audio URLs
    const playableTracks = enhancedTracks.filter((t) => t.audioUrl);

    if (playableTracks.length === 0) {
      alert('No playable tracks found');
      return;
    }

    // Find the index of the clicked track in the playable tracks array
    const clickedTrackInPlayable = playableTracks.findIndex((t) => t.audioUrl === track.audioUrl);

    if (clickedTrackInPlayable === -1) {
      return;
    }

    // Use the playTracklist function to play from the clicked track onwards
    playTracklist(playableTracks, clickedTrackInPlayable);
  };

  // Row click handler for seeking anywhere on the track row
  const handleRowClick = (e, track) => {
    if (!track.audioUrl) return;

    // First ensure this track is the one that's loaded (if not currently playing)
    const currentGlobalTrack = getCurrentTrack();
    const isCurrentTrack = currentGlobalTrack && currentGlobalTrack.audioUrl === track.audioUrl;

    // If it's not the current track, we need to load it first
    if (!isCurrentTrack) {
      handlePlayPause(
        track,
        displayTracklist.findIndex((t) => t.audioUrl === track.audioUrl)
      );
      return;
    }

    const trackRow = progressBarRefs.current[track.audioUrl];
    if (!trackRow) return;

    const rect = trackRow.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const progressPercent = (clickX / rect.width) * 100;
    const clampedPercent = Math.max(0, Math.min(100, progressPercent));

    const globalState = window.globalAudioState;

    if (globalState && globalState.duration && globalState.audioRef) {
      const targetTime = (clampedPercent / 100) * globalState.duration;

      // Handle ended tracks - seek and start playing
      if (globalState.audioRef.ended || !globalState.isPlaying) {
        globalState.audioRef.currentTime = targetTime;
        globalState.currentTime = targetTime;

        // Start playing the track
        globalState.audioRef
          .play()
          .then(() => {})
          .catch(() => {});
      } else {
        // Normal seek during playback
        globalState.audioRef.currentTime = targetTime;
        globalState.currentTime = targetTime;
      }

      if (globalState.listeners) {
        globalState.listeners.forEach((listener) => listener());
      }
    }
  };

  // Get progress for a specific track
  const getTrackProgress = (track) => {
    if (!mounted) return 0;

    const globalState = window.globalAudioState;
    const currentGlobalTrack = getCurrentTrack();

    // Only show progress for the currently playing track
    if (!currentGlobalTrack || currentGlobalTrack.audioUrl !== track.audioUrl) {
      return 0;
    }

    const realProgress = globalState
      ? (globalState.currentTime / globalState.duration) * 100 || 0
      : 0;

    return realProgress;
  };

  if (!displayTracklist || displayTracklist.length === 0) {
    return (
      <div className="tracklist-section">
        <h3 className="h5 mb-3">{title}</h3>
        <p>No tracks available</p>
      </div>
    );
  }

  const currentGlobalTrack = getCurrentTrack();

  return (
    <div className="tracklist-section">
      <ol className="tracklist list-unstyled">
        {displayTracklist.map((track, index) => {
          const hasAudio = !!(track.audioUrl || track.audioFilename);
          const isCurrentlyPlaying =
            currentGlobalTrack && currentGlobalTrack.audioUrl === track.audioUrl;
          const trackProgress = getTrackProgress(track);

          const trackTitle = track.title || `Track ${index + 1}`;

          return (
            <li
              key={track._key || index}
              className="tracklist-item position-relative border-bottom"
              style={{
                padding: 0,
                backgroundColor: '#ffffff' // White background for the entire row
              }}
              ref={(el) => {
                if (el && track.audioUrl) {
                  progressBarRefs.current[track.audioUrl] = el;
                }
              }}
              onClick={hasAudio ? (e) => handleRowClick(e, track) : undefined}
              title={hasAudio ? 'Click to seek' : ''}
            >
              {/* Full-width Progress Bar - WHITE like NowPlaying exactly */}
              {hasAudio && isCurrentlyPlaying && (
                <div
                  className="position-absolute h-100 start-0 top-0"
                  style={{
                    backgroundColor: '#ffffff',
                    width: `${trackProgress}%`,
                    transition: trackProgress === 0 ? 'none' : 'width 0.1s ease',
                    mixBlendMode: 'difference',
                    zIndex: 3,
                    pointerEvents: 'none'
                  }}
                />
              )}

              {/* Content wrapper - higher z-index like NowPlaying */}
              <div className="d-flex align-items-center position-relative" style={{ zIndex: 2 }}>
                {/* Play Button / Track Number */}
                <div className="d-flex align-items-center p-2">
                  {hasAudio ? (
                    <button
                      className="play-btn btn btn-link me-0 p-0"
                      style={{
                        fontSize: '14px',
                        width: '20px',
                        textAlign: 'center',
                        border: 'none',
                        background: 'none',
                        transition: 'all 0.2s ease',
                        pointerEvents: 'none',
                        color: '#000000',
                        textDecoration: 'none'
                      }}
                      title="Play from this track onwards"
                    >
                      {isCurrentlyPlaying &&
                      trackIsPlaying &&
                      !isIdle &&
                      !idleTransitionStartTime ? (
                        <div className="frequency-bars">
                          <div className="frequency-bar"></div>
                          <div className="frequency-bar"></div>
                          <div className="frequency-bar"></div>
                        </div>
                      ) : (
                        <span>▶</span>
                      )}
                    </button>
                  ) : (
                    <span
                      className="track-number me-0"
                      style={{
                        fontSize: '14px',
                        width: '20px',
                        textAlign: 'center',
                        pointerEvents: 'none',
                        color: '#000000'
                      }}
                    >
                      {track.trackNumber || index + 1}.
                    </span>
                  )}
                </div>

                {/* Track Info - Remove margin-left and padding-left */}
                <div
                  className="flex-grow-1 d-flex align-items-center"
                  style={{
                    height: '2.5rem',
                    paddingRight: '12px',
                    cursor: hasAudio ? 'pointer' : 'default',
                    pointerEvents: 'none'
                  }}
                >
                  {/* Track Title - with z-index like NowPlaying */}
                  <span
                    className="fw-medium position-relative me-2"
                    style={{
                      fontSize: '0.875rem',
                      color: '#000000',
                      zIndex: 2,
                      pointerEvents: 'none',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      maxWidth: '200px', // Adjust as needed
                      display: 'inline-block'
                    }}
                  >
                    {trackTitle}
                  </span>

                  {/* Artist - with z-index like NowPlaying */}
                  {track.artist && track.artist.trim() && (
                    <span
                      className="position-relative me-2"
                      style={{
                        fontSize: '0.875rem',
                        color: '#000000',
                        zIndex: 2,
                        pointerEvents: 'none',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        maxWidth: '150px', // Adjust as needed
                        display: 'inline-block'
                      }}
                    >
                      {track.artist}
                    </span>
                  )}

                  {/* Duration - with z-index like NowPlaying */}
                  {track.duration && (
                    <span
                      className="position-relative ms-auto"
                      style={{
                        fontSize: '0.75rem',
                        color: '#000000',
                        zIndex: 2,
                        pointerEvents: 'none'
                      }}
                    >
                      {track.duration}
                    </span>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ol>

      <style jsx>{`
        .tracklist-item {
          transition: none;
          cursor: pointer;
        }
        .tracklist-item:hover {
          background-color: #ffffff !important;
          cursor: pointer;
        }
        .play-btn:hover {
          opacity: 1;
          transform: scale(1.1);
          text-decoration: none !important;
        }
        .play-btn {
          text-decoration: none !important;
        }
        .track-title {
          font-weight: 500;
        }
        /* Prevent text wrapping and add ellipsis */
        .tracklist-item span {
          white-space: nowrap !important;
          overflow: hidden !important;
          text-overflow: ellipsis !important;
        }
        /* Force black text and no borders */
        .tracklist-item span,
        .tracklist-item button {
          color: #000000 !important;
        }
        .tracklist-item .flex-grow-1 {
          border: none !important;
        }

        /* Animated frequency bars */
        .frequency-bars {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1px;
          height: 14px;
          width: 14px;
        }

        .frequency-bar {
          width: 2px;
          background-color: #000000;
          border-radius: 1px;
          animation: frequency-bounce 1s ease-in-out infinite;
        }

        .frequency-bar:nth-child(1) {
          height: 4px;
          animation-delay: 0s;
          animation-duration: 0.8s;
        }

        .frequency-bar:nth-child(2) {
          height: 8px;
          animation-delay: 0.2s;
          animation-duration: 1.2s;
        }

        .frequency-bar:nth-child(3) {
          height: 6px;
          animation-delay: 0.4s;
          animation-duration: 0.9s;
        }

        @keyframes frequency-bounce {
          0%,
          100% {
            transform: scaleY(0.3);
          }
          50% {
            transform: scaleY(1.5);
          }
        }
      `}</style>
    </div>
  );
};

export default EnhancedTracklist;
