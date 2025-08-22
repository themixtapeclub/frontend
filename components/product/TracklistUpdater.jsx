// Enhanced TracklistUpdater - Handles both title and artist enhancement
'use client';

import { useEffect } from 'react';
import { useDiscogsTracklist } from '../../hooks/useDiscogsTracklist';

const updateTracklistViaSanity = async (documentId, tracklist) => {
  try {
    // Test API endpoint availability first
    const testResponse = await fetch('/api/update-tracklist', {
      method: 'GET'
    });

    if (!testResponse.ok) {
      const errorText = await testResponse.text();
      throw new Error(
        `API endpoint test failed: ${testResponse.status} ${testResponse.statusText} - ${errorText}`
      );
    }

    await testResponse.json();

    // Make the enhanced POST request
    const requestBody = {
      documentId,
      tracklist,
      enhancementRequest: {
        enhanceTitles: tracklist.some((t) => /^Track \d+$/i.test(t.title || '')),
        enhanceArtists: tracklist.some(
          (t) => !t.artist || t.artist.trim() === '' || t.artist.trim() === 'Various'
        ),
        timestamp: Date.now()
      }
    };

    const response = await fetch('/api/update-tracklist', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const result = await response.json();

    // Broadcast the enhanced update
    if (result.success) {
      if (typeof window !== 'undefined') {
        const enhancedEvent = new CustomEvent('tracklistUpdated', {
          detail: {
            type: 'enhancedTracklistUpdate',
            documentId,
            swellProductId: result.swellProductId,
            tracklist: result.tracklist,
            enhancementTypes: {
              titles: result.titleEnhancementsApplied,
              artists: result.artistEnhancementsApplied
            },
            timestamp: Date.now()
          }
        });
        window.dispatchEvent(enhancedEvent);

        // Also emit the legacy event for compatibility
        const legacyEvent = new CustomEvent('sanityDataUpdated', {
          detail: {
            type: 'tracklistUpdate',
            documentId,
            swellProductId: result.swellProductId,
            tracklist: result.tracklist,
            timestamp: Date.now()
          }
        });
        window.dispatchEvent(legacyEvent);
      }
    }

    return result.success;
  } catch (error) {
    return false;
  }
};

const TracklistUpdater = ({ swellProduct, sanityContent }) => {
  useEffect(() => {}, []);

  const hookResult = useDiscogsTracklist(swellProduct, sanityContent, {
    customUpdateFunction: updateTracklistViaSanity,
    enableSanityPersistence: true,
    skipIfAlreadyEnhanced: true,
    enhancementOptions: {
      enhanceTitles: true,
      enhanceArtists: true,
      preserveExistingData: true,
      requireDiscogsId: true
    }
  });

  return null;
};

export default TracklistUpdater;
