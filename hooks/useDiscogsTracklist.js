// Enhanced useDiscogsTracklist.js - Supports both title and artist enhancement
import { useEffect, useState } from 'react';

// ENHANCED: Helper function to check if a track needs title updating
const shouldUpdateTrackTitle = (track) => {
  if (!track || !track.title) return true;
  const title = track.title.trim();
  const defaultPattern = /^Track \d+$/i;
  return defaultPattern.test(title) || title === '' || title.length === 0;
};

// ENHANCED: Helper function to check if a track needs artist updating (for Various Artists)
const shouldUpdateTrackArtist = (track, isVariousArtist = false) => {
  if (!isVariousArtist) return false;
  if (!track) return true;
  const artist = track.artist;
  return !artist || artist.trim() === '' || artist.trim() === 'Various';
};

// ENHANCED: Check if any tracks in the tracklist need updating (titles or artists)
const tracklistNeedsUpdate = (tracklist, productArtist = null) => {
  if (!tracklist || tracklist.length === 0) return false;

  // Check if this is a Various Artists release
  const isVariousArtist = Array.isArray(productArtist)
    ? productArtist.some((a) => a?.toLowerCase?.() === 'various')
    : typeof productArtist === 'string' && productArtist.toLowerCase() === 'various';

  return tracklist.some(
    (track) => shouldUpdateTrackTitle(track) || shouldUpdateTrackArtist(track, isVariousArtist)
  );
};

// Enhanced in-memory cache for browser storage compatibility
class EnhancedMemoryDiscogCache {
  constructor(ttl = 86400000) {
    this.ttl = ttl;
    this.cache = new Map();
    this.processedCache = new Map();
  }

  get(key) {
    try {
      const item = this.cache.get(`discogs_${key}`);
      if (!item) return null;
      if (Date.now() > item.expiry) {
        this.cache.delete(`discogs_${key}`);
        return null;
      }
      return item.data;
    } catch (error) {
      return null;
    }
  }

  set(key, data) {
    try {
      const item = { data, expiry: Date.now() + this.ttl };
      this.cache.set(`discogs_${key}`, item);
    } catch (error) {
      // Silent fail
    }
  }

  has(key) {
    return this.get(key) !== null;
  }

  delete(key) {
    try {
      this.cache.delete(`discogs_${key}`);
    } catch (error) {
      // Silent fail
    }
  }

  clear() {
    try {
      this.cache.clear();
      this.processedCache.clear();
    } catch (error) {
      // Silent fail
    }
  }

  markAsProcessed(key) {
    try {
      const item = { data: 'PROCESSED', expiry: Date.now() + this.ttl };
      this.processedCache.set(`discogs_processed_${key}`, item);
    } catch (error) {
      // Silent fail
    }
  }

  isProcessed(key) {
    try {
      const item = this.processedCache.get(`discogs_processed_${key}`);
      if (!item) return false;
      if (Date.now() > item.expiry) {
        this.processedCache.delete(`discogs_processed_${key}`);
        return false;
      }
      return true;
    } catch (error) {
      return false;
    }
  }

  clearProcessed(key) {
    try {
      this.processedCache.delete(`discogs_processed_${key}`);
    } catch (error) {
      // Silent fail
    }
  }
}

// Single enhanced cache instance
const enhancedDiscogsCache = new EnhancedMemoryDiscogCache();

// ENHANCED: Helper function to emit events consistently with enhancement details
const emitEnhancedTracklistEvent = (
  tracklist,
  productKey,
  reason = 'unknown',
  enhancementTypes = {}
) => {
  const event = new CustomEvent('tracklistUpdated', {
    detail: {
      tracklist: tracklist || [],
      productKey,
      timestamp: Date.now(),
      reason,
      enhancementTypes // NEW: Track what was enhanced
    }
  });
  window.dispatchEvent(event);
};

export const useDiscogsTracklist = (swellProduct, sanityContent, options = {}) => {
  const {
    sanityClient,
    customUpdateFunction,
    enableSanityPersistence = true,
    skipIfAlreadyEnhanced = true,
    enhancementOptions = {} // NEW: Enhancement configuration
  } = options;

  const {
    enhanceTitles = true,
    enhanceArtists = true,
    preserveExistingData = true,
    requireDiscogsId = true
  } = enhancementOptions;

  const [localTracklist, setLocalTracklist] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateStatus, setUpdateStatus] = useState(null);
  const [sanityUpdateStatus, setSanityUpdateStatus] = useState(null);

  useEffect(() => {
    const productKey = `${swellProduct?.id}-${sanityContent?._id}`;
    const tracklist = sanityContent?.tracklist;
    const productArtist = sanityContent?.artist;

    // Early returns with events
    if (!tracklist || tracklist.length === 0) {
      setLocalTracklist([]);
      setUpdateStatus('no_tracklist');
      setTimeout(() => emitEnhancedTracklistEvent([], productKey, 'no_tracklist'), 100);
      return;
    }

    if (enhancedDiscogsCache.has(productKey)) {
      const cached = enhancedDiscogsCache.get(productKey);
      setLocalTracklist(cached);
      setUpdateStatus('cached');
      setTimeout(() => emitEnhancedTracklistEvent(cached, productKey, 'cached'), 100);
      return;
    }

    if (skipIfAlreadyEnhanced && sanityContent?.tracklistEnhanced) {
      setLocalTracklist(tracklist);
      setUpdateStatus('already_enhanced');
      setTimeout(() => emitEnhancedTracklistEvent(tracklist, productKey, 'already_enhanced'), 100);
      return;
    }

    if (enhancedDiscogsCache.isProcessed(productKey)) {
      setLocalTracklist(tracklist);
      setUpdateStatus('already_processed');
      setTimeout(() => emitEnhancedTracklistEvent(tracklist, productKey, 'already_processed'), 100);
      return;
    }

    const discogsReleaseId = sanityContent?.discogsReleaseId;

    if (requireDiscogsId && !discogsReleaseId) {
      enhancedDiscogsCache.set(productKey, tracklist);
      setLocalTracklist(tracklist);
      setUpdateStatus('no_discogs_id');
      setTimeout(() => emitEnhancedTracklistEvent(tracklist, productKey, 'no_discogs_id'), 100);
      return;
    }

    // ENHANCED: Check if enhancement is needed (titles or artists)
    const needsUpdate = tracklistNeedsUpdate(tracklist, productArtist);

    if (!needsUpdate) {
      setLocalTracklist(tracklist);
      setUpdateStatus('skipped');
      setTimeout(() => emitEnhancedTracklistEvent(tracklist, productKey, 'skipped'), 100);
      return;
    }

    // ENHANCED: Proceed with comprehensive Discogs update
    const updateFromDiscogs = async () => {
      setIsUpdating(true);
      setUpdateStatus('fetching');
      setSanityUpdateStatus(null);

      try {
        // NEW: Use the enhanced API route instead of direct Discogs call
        if (customUpdateFunction && enableSanityPersistence && sanityContent?._id) {
          setSanityUpdateStatus('updating');

          // Let the API handle the comprehensive enhancement
          const sanitySuccess = await customUpdateFunction(sanityContent._id, tracklist);

          setSanityUpdateStatus(sanitySuccess ? 'success' : 'failed');
          setUpdateStatus(sanitySuccess ? 'success' : 'error');

          if (sanitySuccess) {
            // Mark as processed and cache will be updated via event listener
            enhancedDiscogsCache.markAsProcessed(productKey);
          } else {
            enhancedDiscogsCache.set(productKey, tracklist);
            setLocalTracklist(tracklist);
            setTimeout(() => emitEnhancedTracklistEvent(tracklist, productKey, 'api_error'), 100);
          }
        } else {
          // FALLBACK: Direct Discogs fetch for cases without API
          const discogsData = await fetchEnhancedDiscogsData(discogsReleaseId);

          if (!discogsData || !discogsData.tracklist) {
            enhancedDiscogsCache.set(productKey, tracklist);
            setLocalTracklist(tracklist);
            setUpdateStatus('no_data');
            setTimeout(() => emitEnhancedTracklistEvent(tracklist, productKey, 'no_data'), 100);
            return;
          }

          // ENHANCED: Update tracks with comprehensive Discogs data
          const { updatedTracks, enhancementTypes } = enhanceTracksWithDiscogs(
            tracklist,
            discogsData.tracklist,
            productArtist,
            { enhanceTitles, enhanceArtists, preserveExistingData }
          );

          enhancedDiscogsCache.set(productKey, updatedTracks);
          setLocalTracklist(updatedTracks);
          setUpdateStatus('success');

          // Try to persist to Sanity if enabled (fallback method)
          if (enableSanityPersistence && sanityContent?._id && sanityClient) {
            setSanityUpdateStatus('updating');
            const sanitySuccess = await updateSanityTracklist(
              sanityContent._id,
              updatedTracks,
              sanityClient
            );
            setSanityUpdateStatus(sanitySuccess ? 'success' : 'failed');
          }

          emitEnhancedTracklistEvent(
            updatedTracks,
            productKey,
            'discogs_success',
            enhancementTypes
          );
        }
      } catch (error) {
        enhancedDiscogsCache.set(productKey, tracklist);
        setLocalTracklist(tracklist);
        setUpdateStatus('error');
        setTimeout(() => emitEnhancedTracklistEvent(tracklist, productKey, 'discogs_error'), 100);
      } finally {
        setIsUpdating(false);
      }
    };

    updateFromDiscogs();
  }, [
    swellProduct?.id,
    sanityContent?._id,
    sanityContent?.tracklist,
    sanityContent?.discogsReleaseId,
    sanityContent?.tracklistEnhanced,
    sanityContent?.artist,
    sanityClient,
    customUpdateFunction,
    enableSanityPersistence,
    skipIfAlreadyEnhanced,
    enhanceTitles,
    enhanceArtists
  ]);

  return {
    localTracklist,
    isUpdating,
    updateStatus,
    sanityUpdateStatus,
    shouldUpdateTrackTitle,
    shouldUpdateTrackArtist,
    tracklistNeedsUpdate: tracklistNeedsUpdate(
      localTracklist || sanityContent?.tracklist,
      sanityContent?.artist
    ),
    updatedTracklist: localTracklist,
    discogsReleaseId: sanityContent?.discogsReleaseId,
    retryUpdate: () => {
      const productKey = `${swellProduct?.id}-${sanityContent?._id}`;
      enhancedDiscogsCache.delete(productKey);
      enhancedDiscogsCache.clearProcessed(productKey);
    }
  };
};

// ENHANCED: Function to enhance tracks with comprehensive Discogs data
const enhanceTracksWithDiscogs = (originalTracks, discogsTracks, productArtist, options = {}) => {
  const { enhanceTitles = true, enhanceArtists = true, preserveExistingData = true } = options;

  const isVariousArtist = Array.isArray(productArtist)
    ? productArtist.some((a) => a?.toLowerCase?.() === 'various')
    : typeof productArtist === 'string' && productArtist.toLowerCase() === 'various';

  let titleEnhancements = 0;
  let artistEnhancements = 0;

  const updatedTracks = originalTracks.map((track, index) => {
    const discogsTrack = discogsTracks[index];
    if (!discogsTrack) return track;

    let enhancedTrack = { ...track };

    // TITLE ENHANCEMENT
    if (enhanceTitles && shouldUpdateTrackTitle(track)) {
      if (discogsTrack.title && discogsTrack.title.trim()) {
        enhancedTrack.title = discogsTrack.title.trim();
        titleEnhancements++;
      }
    }

    // ARTIST ENHANCEMENT (for Various Artists)
    if (enhanceArtists && isVariousArtist && shouldUpdateTrackArtist(track, isVariousArtist)) {
      // Extract artist from Discogs track
      let artistName = null;

      if (discogsTrack.artists && discogsTrack.artists.length > 0) {
        artistName = discogsTrack.artists[0].name.replace(/\s*\(\d+\)$/, '');
      } else if (discogsTrack.extraartists && discogsTrack.extraartists.length > 0) {
        artistName = discogsTrack.extraartists[0].name.replace(/\s*\(\d+\)$/, '');
      }

      if (artistName) {
        enhancedTrack.artist = artistName;
        artistEnhancements++;
      }
    }

    // Preserve duration if available
    if (discogsTrack.duration && !enhancedTrack.duration) {
      enhancedTrack.duration = discogsTrack.duration;
    }

    return enhancedTrack;
  });

  return {
    updatedTracks,
    enhancementTypes: {
      titles: titleEnhancements > 0,
      artists: artistEnhancements > 0,
      titleCount: titleEnhancements,
      artistCount: artistEnhancements
    }
  };
};

// Function to update Sanity document with new tracklist
const updateSanityTracklist = async (documentId, updatedTracklist, sanityClient) => {
  try {
    if (!sanityClient || !documentId) return false;
    const result = await sanityClient
      .patch(documentId)
      .set({
        tracklist: updatedTracklist,
        tracklistEnhanced: true,
        tracklistLastUpdated: new Date().toISOString()
      })
      .commit();
    return true;
  } catch (error) {
    return false;
  }
};

// ENHANCED: Discogs API function with better error handling
const fetchEnhancedDiscogsData = async (releaseId) => {
  const headers = {
    'User-Agent': 'TheMixtapeClub/1.0 +https://themixtapeclub.com'
  };

  // Add token if available in environment
  if (typeof window !== 'undefined' && window.DISCOGS_TOKEN) {
    headers['Authorization'] = `Discogs token=${window.DISCOGS_TOKEN}`;
  }

  const response = await fetch(`https://api.discogs.com/releases/${releaseId}`, { headers });

  if (!response.ok) {
    throw new Error(`Discogs API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return { tracklist: data.tracklist || [] };
};

// ENHANCED: Utility functions
export const clearEnhancedDiscogsCache = () => enhancedDiscogsCache.clear();
export const clearProductFromEnhancedCache = (productKey) => {
  enhancedDiscogsCache.delete(productKey);
  enhancedDiscogsCache.clearProcessed(productKey);
};
export const clearEnhancedProcessedFlag = (productKey) =>
  enhancedDiscogsCache.clearProcessed(productKey);
export const updateSanityTracklistManually = async (documentId, tracklist, sanityClient) => {
  return await updateSanityTracklist(documentId, tracklist, sanityClient);
};

// ENHANCED: Helper to check what enhancements are needed
export const analyzeEnhancementNeeds = (tracklist, productArtist) => {
  const isVariousArtist = Array.isArray(productArtist)
    ? productArtist.some((a) => a?.toLowerCase?.() === 'various')
    : typeof productArtist === 'string' && productArtist.toLowerCase() === 'various';

  const titleEnhancementNeeded = tracklist?.some(shouldUpdateTrackTitle) || false;
  const artistEnhancementNeeded =
    isVariousArtist &&
    (tracklist?.some((track) => shouldUpdateTrackArtist(track, isVariousArtist)) || false);

  return {
    titleEnhancementNeeded,
    artistEnhancementNeeded,
    anyEnhancementNeeded: titleEnhancementNeeded || artistEnhancementNeeded,
    isVariousArtist,
    tracksNeedingTitleUpdate: tracklist?.filter(shouldUpdateTrackTitle).length || 0,
    tracksNeedingArtistUpdate: isVariousArtist
      ? tracklist?.filter((track) => shouldUpdateTrackArtist(track, isVariousArtist)).length || 0
      : 0
  };
};
