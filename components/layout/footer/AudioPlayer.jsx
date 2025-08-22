'use client';

import { useEffect, useState } from 'react';

// Global audio player state (you might want to use a context or state management later)
let globalAudioState = {
  currentTrack: null,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  audioRef: null,
  listeners: new Set(),
  lastTrack: null, // Add this to remember the last track even when stopped
  stopTimeout: null, // Add timeout for clearing last track
  // Enhanced playlist support with history
  playHistory: [], // All tracks that have been played
  currentTrackIndex: 0, // Position in the play history
  currentAlbumTracks: [], // Current album/product tracks for context
  currentAlbumStartIndex: 0 // Where the current album starts in history
};

export const AudioPlayer = () => {
  const [currentTrack, setCurrentTrack] = useState(globalAudioState.currentTrack);
  const [isPlaying, setIsPlaying] = useState(globalAudioState.isPlaying);
  const [currentTime, setCurrentTime] = useState(globalAudioState.currentTime);
  const [duration, setDuration] = useState(globalAudioState.duration);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Subscribe to global audio state changes
    const updateState = () => {
      setCurrentTrack(globalAudioState.currentTrack);
      setIsPlaying(globalAudioState.isPlaying);
      setCurrentTime(globalAudioState.currentTime);
      setDuration(globalAudioState.duration);
      setIsVisible(!!globalAudioState.currentTrack);
    };

    globalAudioState.listeners.add(updateState);
    updateState(); // Initial state

    return () => {
      globalAudioState.listeners.delete(updateState);
    };
  }, []);

  // ENHANCED: Listen for enhanced tracklist updates
  useEffect(() => {
    const handleEnhancedTracklist = (event) => {
      const { productId, productIdentifiers, enhancedTracklist } = event.detail;

      // Check if we have any tracks to update
      if (globalAudioState.playHistory.length === 0) {
        return;
      }

      // Find matching tracks with simplified logic
      const matchingIndices = [];

      globalAudioState.playHistory.forEach((track, index) => {
        if (!track) return;

        const matches = [
          track.productId === productId,
          track.sanityId === productId,
          track.swellId === productId,
          productIdentifiers && track.productSlug === productIdentifiers.productSlug
        ];

        if (matches.some(Boolean)) {
          matchingIndices.push(index);
        }
      });

      if (matchingIndices.length === 0) {
        return;
      }

      // Update all matching tracks
      let updatedCount = 0;
      matchingIndices.forEach((historyIndex) => {
        const originalTrack = globalAudioState.playHistory[historyIndex];
        if (!originalTrack) return;

        const albumStartIndex = globalAudioState.currentAlbumStartIndex;
        const trackIndexInAlbum = historyIndex - albumStartIndex;
        const enhancedTrack = enhancedTracklist[trackIndexInAlbum];

        if (
          enhancedTrack &&
          trackIndexInAlbum >= 0 &&
          trackIndexInAlbum < enhancedTracklist.length
        ) {
          const updatedTrack = {
            ...originalTrack,
            title: enhancedTrack.title || originalTrack.title,
            artist: enhancedTrack.artist || originalTrack.artist
          };

          globalAudioState.playHistory[historyIndex] = updatedTrack;
          updatedCount++;

          // If this is the currently playing track, update it too
          if (historyIndex === globalAudioState.currentTrackIndex) {
            globalAudioState.currentTrack = updatedTrack;
          }
        }
      });

      if (updatedCount > 0) {
        // Force immediate UI update
        setCurrentTrack(globalAudioState.currentTrack);
        setIsPlaying(globalAudioState.isPlaying);
        notifyListeners();
      }
    };

    window.addEventListener('enhancedTracklistAvailable', handleEnhancedTracklist);

    return () => {
      window.removeEventListener('enhancedTracklistAvailable', handleEnhancedTracklist);
    };
  }, []);

  const formatTime = (time) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handlePlayPause = () => {
    if (globalAudioState.audioRef) {
      if (isPlaying) {
        globalAudioState.audioRef.pause();
      } else {
        globalAudioState.audioRef.play();
      }
    }
  };

  const handleStop = () => {
    if (globalAudioState.audioRef) {
      globalAudioState.audioRef.pause();
      globalAudioState.audioRef.currentTime = 0;

      // Store last track before clearing current track
      globalAudioState.lastTrack = globalAudioState.currentTrack;
      globalAudioState.currentTrack = null;
      globalAudioState.isPlaying = false;
      globalAudioState.currentTime = 0;

      // Clear last track after 5 seconds
      if (globalAudioState.stopTimeout) {
        clearTimeout(globalAudioState.stopTimeout);
      }
      globalAudioState.stopTimeout = setTimeout(() => {
        globalAudioState.lastTrack = null;
        notifyListeners();
      }, 5000);

      notifyListeners();
    }
  };

  const handleSeek = (e) => {
    if (globalAudioState.audioRef && duration) {
      const rect = e.target.getBoundingClientRect();
      const percent = (e.clientX - rect.left) / rect.width;
      const newTime = percent * duration;
      globalAudioState.audioRef.currentTime = newTime;
    }
  };

  const handleImageClick = () => {
    // Navigate to product page if available
    if (currentTrack?.productSlug || currentTrack?.productUrl) {
      const href = currentTrack.productUrl || `/product/${currentTrack.productSlug}`;
      window.location.href = href;
    }
  };

  if (!isVisible || !currentTrack) {
    return null;
  }

  return (
    <div
      className="footer-audio-player position-fixed bg-dark bottom-0 end-0 start-0 p-3 text-white shadow-lg"
      style={{ zIndex: 1050 }}
    >
      <div className="container-fluid">
        <div className="row align-items-center">
          {/* Album Art & Track Info */}
          <div className="col-md-4 d-flex align-items-center">
            {/* Album Art */}
            {currentTrack.productImage && (
              <div
                className="me-3 flex-shrink-0"
                style={{ cursor: currentTrack.productSlug ? 'pointer' : 'default' }}
                onClick={currentTrack.productSlug ? handleImageClick : undefined}
                title={currentTrack.productSlug ? 'View product' : ''}
              >
                <img
                  src={currentTrack.productImage}
                  alt={currentTrack.album || currentTrack.title}
                  className="rounded"
                  style={{
                    width: '50px',
                    height: '50px',
                    objectFit: 'cover',
                    transition: 'opacity 0.2s ease'
                  }}
                  onMouseEnter={(e) => (e.target.style.opacity = '0.8')}
                  onMouseLeave={(e) => (e.target.style.opacity = '1')}
                />
              </div>
            )}

            {/* Track Info */}
            <div className="me-3">
              <div
                className="fw-medium small"
                style={{
                  cursor: currentTrack.productSlug ? 'pointer' : 'default',
                  transition: 'color 0.2s ease'
                }}
                onClick={currentTrack.productSlug ? handleImageClick : undefined}
                onMouseEnter={(e) => {
                  if (currentTrack.productSlug) e.target.style.color = '#adb5bd';
                }}
                onMouseLeave={(e) => (e.target.style.color = 'white')}
                title={currentTrack.productSlug ? 'View product' : ''}
              >
                {currentTrack.title}
              </div>
              {currentTrack.artist && (
                <div className="text-light small opacity-75">{currentTrack.artist}</div>
              )}
              {currentTrack.album && (
                <div className="text-light small opacity-50">{currentTrack.album}</div>
              )}
            </div>
          </div>

          {/* Controls */}
          <div className="col-md-4 text-center">
            <div className="d-flex justify-content-center align-items-center mb-2">
              <button
                className="btn btn-light btn-sm d-flex align-items-center justify-content-center me-2"
                onClick={handlePlayPause}
                style={{
                  width: '40px',
                  height: '40px',
                  fontSize: '16px',
                  transition: 'all 0.2s ease'
                }}
                title={isPlaying ? 'Pause' : 'Play'}
                onMouseEnter={(e) => (e.target.style.transform = 'scale(1.05)')}
                onMouseLeave={(e) => (e.target.style.transform = 'scale(1)')}
              >
                {isPlaying ? '⏸' : '▶'}
              </button>
              <button
                className="btn btn-outline-light btn-sm d-flex align-items-center justify-content-center"
                onClick={handleStop}
                style={{
                  width: '40px',
                  height: '40px',
                  fontSize: '14px',
                  transition: 'all 0.2s ease'
                }}
                title="Stop"
                onMouseEnter={(e) => (e.target.style.transform = 'scale(1.05)')}
                onMouseLeave={(e) => (e.target.style.transform = 'scale(1)')}
              >
                ⏹
              </button>
            </div>

            {/* Progress Bar */}
            <div className="d-flex align-items-center">
              <span className="text-light small me-2 opacity-75" style={{ minWidth: '35px' }}>
                {formatTime(currentTime)}
              </span>
              <div
                className="progress flex-grow-1 mx-2"
                style={{ height: '6px', cursor: 'pointer' }}
                onClick={handleSeek}
              >
                <div
                  className="progress-bar bg-light"
                  style={{
                    width: duration ? `${(currentTime / duration) * 100}%` : '0%',
                    transition: 'width 0.1s ease'
                  }}
                ></div>
              </div>
              <span className="text-light small ms-2 opacity-75" style={{ minWidth: '35px' }}>
                {formatTime(duration)}
              </span>
            </div>
          </div>

          {/* Close Button */}
          <div className="col-md-4 text-end">
            <button
              className="btn btn-outline-light btn-sm"
              onClick={handleStop}
              title="Close player"
              style={{
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => (e.target.style.backgroundColor = 'rgba(255,255,255,0.1)')}
              onMouseLeave={(e) => (e.target.style.backgroundColor = 'transparent')}
            >
              ✕
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Notify all listeners of state changes
const notifyListeners = () => {
  globalAudioState.listeners.forEach((listener) => listener());
};

// Enhanced playTracklist function - adds to history instead of replacing
export const playTracklist = (tracks, startIndex = 0) => {
  // Store current album context
  globalAudioState.currentAlbumTracks = tracks;
  globalAudioState.currentAlbumStartIndex = globalAudioState.playHistory.length;

  // Add all tracks to play history
  globalAudioState.playHistory.push(...tracks);

  // Set current position to the requested start track in the new album
  globalAudioState.currentTrackIndex = globalAudioState.currentAlbumStartIndex + startIndex;

  // Play the starting track
  playTrack(tracks[startIndex]);

  notifyListeners();
};

// Next track function - navigates through play history
export const nextTrack = () => {
  if (
    globalAudioState.playHistory.length > 0 &&
    globalAudioState.currentTrackIndex < globalAudioState.playHistory.length - 1
  ) {
    const newIndex = globalAudioState.currentTrackIndex + 1;

    globalAudioState.currentTrackIndex = newIndex;
    playTrack(globalAudioState.playHistory[newIndex]);
  }
};

// Previous track function - navigates through play history
export const previousTrack = () => {
  if (globalAudioState.playHistory.length > 0 && globalAudioState.currentTrackIndex > 0) {
    const newIndex = globalAudioState.currentTrackIndex - 1;

    globalAudioState.currentTrackIndex = newIndex;
    playTrack(globalAudioState.playHistory[newIndex]);
  }
};

// Global function to play a track from anywhere
export const playTrack = (track) => {
  // Clear any pending stop timeout since we're playing a new track
  if (globalAudioState.stopTimeout) {
    clearTimeout(globalAudioState.stopTimeout);
    globalAudioState.stopTimeout = null;
  }

  // Stop current audio if playing
  if (globalAudioState.audioRef) {
    globalAudioState.audioRef.pause();
    globalAudioState.audioRef = null;
  }

  if (!track.audioUrl) {
    return;
  }

  try {
    // Create new audio instance
    globalAudioState.audioRef = new Audio(track.audioUrl);
    globalAudioState.currentTrack = track;
    globalAudioState.lastTrack = track; // Also update last track

    // Audio event listeners
    globalAudioState.audioRef.addEventListener('canplay', () => {
      globalAudioState.isPlaying = true;
      notifyListeners();
    });

    globalAudioState.audioRef.addEventListener('play', () => {
      globalAudioState.isPlaying = true;
      notifyListeners();
    });

    globalAudioState.audioRef.addEventListener('pause', () => {
      globalAudioState.isPlaying = false;
      notifyListeners();
    });

    globalAudioState.audioRef.addEventListener('timeupdate', () => {
      globalAudioState.currentTime = globalAudioState.audioRef.currentTime;
      notifyListeners();
    });

    globalAudioState.audioRef.addEventListener('loadedmetadata', () => {
      globalAudioState.duration = globalAudioState.audioRef.duration;
      notifyListeners();
    });

    globalAudioState.audioRef.addEventListener('ended', () => {
      // Auto-advance to next track if we have more tracks in history
      if (
        globalAudioState.playHistory.length > 0 &&
        globalAudioState.currentTrackIndex < globalAudioState.playHistory.length - 1
      ) {
        nextTrack();
        return;
      }

      // Check if we have more tracks in the current album to auto-add
      const currentAlbumEndIndex =
        globalAudioState.currentAlbumStartIndex + globalAudioState.currentAlbumTracks.length - 1;
      const currentPositionInAlbum =
        globalAudioState.currentTrackIndex - globalAudioState.currentAlbumStartIndex;

      if (
        globalAudioState.currentTrackIndex === currentAlbumEndIndex &&
        currentPositionInAlbum < globalAudioState.currentAlbumTracks.length - 1
      ) {
        // We're at the end of history but there are more tracks in the current album
        const nextAlbumTrackIndex = currentPositionInAlbum + 1;
        const nextTrack = globalAudioState.currentAlbumTracks[nextAlbumTrackIndex];

        globalAudioState.playHistory.push(nextTrack);
        globalAudioState.currentTrackIndex = globalAudioState.playHistory.length - 1;
        playTrack(nextTrack);
        return;
      }

      // No more tracks, handle as before
      globalAudioState.lastTrack = globalAudioState.currentTrack;
      globalAudioState.currentTrack = null;
      globalAudioState.isPlaying = false;
      globalAudioState.currentTime = 0;

      // Clear last track after 5 seconds
      if (globalAudioState.stopTimeout) {
        clearTimeout(globalAudioState.stopTimeout);
      }
      globalAudioState.stopTimeout = setTimeout(() => {
        globalAudioState.lastTrack = null;
        notifyListeners();
      }, 5000);

      notifyListeners();
    });

    globalAudioState.audioRef.addEventListener('error', (e) => {
      // Store last track before clearing current track
      globalAudioState.lastTrack = globalAudioState.currentTrack;
      globalAudioState.currentTrack = null;
      globalAudioState.isPlaying = false;

      // Clear last track after 5 seconds
      if (globalAudioState.stopTimeout) {
        clearTimeout(globalAudioState.stopTimeout);
      }
      globalAudioState.stopTimeout = setTimeout(() => {
        globalAudioState.lastTrack = null;
        notifyListeners();
      }, 5000);

      notifyListeners();
    });

    // Start playback
    globalAudioState.audioRef.play();
    notifyListeners();
  } catch (error) {
    globalAudioState.currentTrack = null;
    globalAudioState.isPlaying = false;
    notifyListeners();
  }
};

// Function to pause current playback
export const pauseTrack = () => {
  if (globalAudioState.audioRef && !globalAudioState.audioRef.paused) {
    globalAudioState.audioRef.pause();
    globalAudioState.isPlaying = false;
    notifyListeners();
  }
};

// Function to resume current playback
export const resumeTrack = () => {
  if (globalAudioState.audioRef && globalAudioState.audioRef.paused) {
    globalAudioState.audioRef.play();
    globalAudioState.isPlaying = true;
    notifyListeners();
  }
};

// Function to check if a track is currently playing
export const isTrackPlaying = (track) => {
  return (
    globalAudioState.currentTrack &&
    globalAudioState.currentTrack.audioUrl === track.audioUrl &&
    globalAudioState.isPlaying
  );
};

// Function to get current playing track
export const getCurrentTrack = () => {
  // Return current track if playing, otherwise return last track (for navbar display)
  return globalAudioState.currentTrack || globalAudioState.lastTrack;
};

// Function to stop current playback
export const stopPlayback = () => {
  if (globalAudioState.audioRef) {
    globalAudioState.audioRef.pause();
    globalAudioState.audioRef.currentTime = 0;

    // Store last track before clearing current track
    globalAudioState.lastTrack = globalAudioState.currentTrack;
    globalAudioState.currentTrack = null;
    globalAudioState.isPlaying = false;
    globalAudioState.currentTime = 0;

    // Keep play history when stopping - don't clear it
    // Users can still navigate back through their play history

    // Clear last track after 5 seconds
    if (globalAudioState.stopTimeout) {
      clearTimeout(globalAudioState.stopTimeout);
    }
    globalAudioState.stopTimeout = setTimeout(() => {
      globalAudioState.lastTrack = null;
      notifyListeners();
    }, 5000);

    notifyListeners();
  }
};

// New function to clear play history (optional - for manual reset)
export const clearPlayHistory = () => {
  globalAudioState.playHistory = [];
  globalAudioState.currentTrackIndex = 0;
  globalAudioState.currentAlbumTracks = [];
  globalAudioState.currentAlbumStartIndex = 0;
  notifyListeners();
};

// Make functions available globally for the navbar
if (typeof window !== 'undefined') {
  window.getCurrentTrack = getCurrentTrack;
  window.isTrackPlaying = isTrackPlaying;
  window.playTrack = playTrack;
  window.stopPlayback = stopPlayback;
  window.pauseTrack = pauseTrack;
  window.resumeTrack = resumeTrack;
  window.globalAudioState = globalAudioState;

  // Add new playlist functions
  window.playTracklist = playTracklist;
  window.nextTrack = nextTrack;
  window.previousTrack = previousTrack;
  window.clearPlayHistory = clearPlayHistory;
}

export default AudioPlayer;
