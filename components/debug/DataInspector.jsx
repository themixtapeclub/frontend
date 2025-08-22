// components/debug/DataInspector.jsx
'use client';

import { useState } from 'react';

const DataInspector = ({ swellProduct, sanityContent }) => {
  const [showDetails, setShowDetails] = useState(false);

  // Analyze the tracklist
  const analyzeTracklist = (tracklist) => {
    if (!tracklist || !Array.isArray(tracklist)) return null;

    const analysis = {
      total: tracklist.length,
      withDefaultTitles: 0,
      withCustomTitles: 0,
      examples: []
    };

    tracklist.forEach((track, index) => {
      const title = track.title?.trim() || '';
      const isDefault = /^Track \d+$/i.test(title) || title === '' || !title;

      if (isDefault) {
        analysis.withDefaultTitles++;
      } else {
        analysis.withCustomTitles++;
      }

      if (index < 3) {
        analysis.examples.push({
          index,
          title: track.title,
          isDefault,
          hasKey: !!track._key,
          duration: track.duration
        });
      }
    });

    return analysis;
  };

  const tracklistAnalysis = analyzeTracklist(sanityContent?.tracklist);

  const data = {
    swellProduct: {
      exists: !!swellProduct,
      id: swellProduct?.id,
      name: swellProduct?.name,
      slug: swellProduct?.slug
    },
    sanityContent: {
      exists: !!sanityContent,
      id: sanityContent?._id,
      title: sanityContent?.title,
      hasDiscogsReleaseId: !!sanityContent?.discogsReleaseId,
      discogsReleaseId: sanityContent?.discogsReleaseId,
      hasTracklist: !!sanityContent?.tracklist,
      tracklistLength: sanityContent?.tracklist?.length,
      tracklistEnhanced: sanityContent?.tracklistEnhanced,
      tracklistLastUpdated: sanityContent?.tracklistLastUpdated
    },
    tracklistAnalysis
  };

  // Check if this should trigger a Discogs update
  const shouldUpdate =
    sanityContent?.discogsReleaseId &&
    sanityContent?.tracklist &&
    tracklistAnalysis?.withDefaultTitles > 0 &&
    !sanityContent?.tracklistEnhanced;

  return (
    <div
      style={{
        position: 'fixed',
        top: '50%',
        left: '20px',
        transform: 'translateY(-50%)',
        background: 'white',
        border: '2px solid #007bff',
        borderRadius: '8px',
        padding: '15px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        zIndex: 9999,
        maxWidth: '350px',
        maxHeight: '80vh',
        overflow: 'auto',
        fontSize: '12px'
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '10px'
        }}
      >
        <h3 style={{ margin: 0, fontSize: '14px', color: '#007bff' }}>📊 Data Inspector</h3>
        <button
          onClick={() => setShowDetails(!showDetails)}
          style={{
            background: 'none',
            border: '1px solid #007bff',
            borderRadius: '3px',
            padding: '2px 6px',
            fontSize: '10px',
            cursor: 'pointer'
          }}
        >
          {showDetails ? 'Hide' : 'Show'} Details
        </button>
      </div>

      {/* Quick Status */}
      <div
        style={{
          padding: '8px',
          background: shouldUpdate ? '#fff3cd' : '#d4edda',
          borderRadius: '4px',
          marginBottom: '10px',
          border: `1px solid ${shouldUpdate ? '#ffeaa7' : '#c3e6cb'}`
        }}
      >
        <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
          Status: {shouldUpdate ? '🟡 Should Update from Discogs' : '🟢 No Update Needed'}
        </div>
        <div style={{ fontSize: '11px' }}>
          {!sanityContent?.discogsReleaseId && '❌ Missing Discogs Release ID'}
          {!sanityContent?.tracklist && '❌ Missing Tracklist'}
          {tracklistAnalysis?.withDefaultTitles === 0 &&
            sanityContent?.tracklist &&
            '✅ All tracks have custom titles'}
          {sanityContent?.tracklistEnhanced && '✅ Already enhanced'}
        </div>
      </div>

      {/* Core Data */}
      <div style={{ marginBottom: '10px' }}>
        <div>
          <strong>Swell Product ID:</strong> {data.swellProduct.id || '❌ Missing'}
        </div>
        <div>
          <strong>Sanity Document ID:</strong> {data.sanityContent.id || '❌ Missing'}
        </div>
        <div>
          <strong>Discogs Release ID:</strong> {data.sanityContent.discogsReleaseId || '❌ Missing'}
        </div>
      </div>

      {/* Tracklist Summary */}
      {tracklistAnalysis && (
        <div
          style={{
            marginBottom: '10px',
            padding: '8px',
            background: '#f8f9fa',
            borderRadius: '4px'
          }}
        >
          <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>Tracklist Analysis:</div>
          <div>📝 Total tracks: {tracklistAnalysis.total}</div>
          <div>🔤 Default titles: {tracklistAnalysis.withDefaultTitles}</div>
          <div>✏️ Custom titles: {tracklistAnalysis.withCustomTitles}</div>
        </div>
      )}

      {/* Detailed View */}
      {showDetails && (
        <div style={{ fontSize: '10px' }}>
          <div style={{ marginBottom: '10px' }}>
            <strong>Sample Tracks:</strong>
            {tracklistAnalysis?.examples.map((track, i) => (
              <div
                key={i}
                style={{
                  marginLeft: '10px',
                  padding: '4px',
                  background: track.isDefault ? '#fff3cd' : '#d4edda',
                  borderRadius: '2px',
                  margin: '2px 0'
                }}
              >
                <div>
                  {i + 1}. "{track.title}" {track.isDefault ? '(Default)' : '(Custom)'}
                </div>
                {track.duration && (
                  <div style={{ fontSize: '9px', color: '#666' }}>Duration: {track.duration}</div>
                )}
              </div>
            ))}
          </div>

          <div style={{ marginBottom: '10px' }}>
            <strong>Environment Check:</strong>
            <div>
              • NEXT_PUBLIC_SANITY_PROJECT_ID:{' '}
              {process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ? '✅' : '❌'}
            </div>
            <div>
              • NEXT_PUBLIC_SANITY_DATASET: {process.env.NEXT_PUBLIC_SANITY_DATASET ? '✅' : '❌'}
            </div>
            <div>• Server env vars checked via API call</div>
          </div>

          <div>
            <strong>Full Data:</strong>
            <pre
              style={{
                background: '#f1f1f1',
                padding: '8px',
                borderRadius: '4px',
                fontSize: '9px',
                overflow: 'auto',
                maxHeight: '200px',
                whiteSpace: 'pre-wrap'
              }}
            >
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataInspector;
