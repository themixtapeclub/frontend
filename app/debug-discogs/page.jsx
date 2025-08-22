// app/debug-discogs/page.js - Complete version with real data
'use client';

import { useState } from 'react';
import TracklistUpdater from '../../components/product/TracklistUpdater';

// Inline simplified test component
const SimpleApiTest = () => {
  const [testResult, setTestResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const testApiEndpoint = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/update-tracklist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentId: 'test-doc-id',
          tracklist: [{ _key: 'test', title: 'Test Track' }]
        })
      });

      const data = await response.json();
      setTestResult({ success: response.ok, status: response.status, data });
    } catch (error) {
      setTestResult({ success: false, error: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const testDiscogsApi = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('https://api.discogs.com/releases/1293762', {
        headers: { 'User-Agent': 'TestApp/1.0' }
      });

      if (response.ok) {
        const data = await response.json();
        setTestResult({
          success: true,
          status: response.status,
          data: {
            title: data.title,
            tracklistLength: data.tracklist?.length,
            sample: data.tracklist?.slice(0, 2)
          }
        });
      } else {
        throw new Error(`${response.status} ${response.statusText}`);
      }
    } catch (error) {
      setTestResult({ success: false, error: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        background: 'white',
        border: '1px solid #ccc',
        borderRadius: '8px',
        padding: '20px',
        margin: '20px 0'
      }}
    >
      <h3>🧪 Quick API Tests</h3>
      <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
        <button
          onClick={testDiscogsApi}
          disabled={isLoading}
          style={{
            padding: '8px 15px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Test Discogs API
        </button>
        <button
          onClick={testApiEndpoint}
          disabled={isLoading}
          style={{
            padding: '8px 15px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Test Update API
        </button>
      </div>

      {isLoading && <div>Loading...</div>}
      {testResult && (
        <div
          style={{
            padding: '10px',
            background: testResult.success ? '#d4edda' : '#f8d7da',
            borderRadius: '4px',
            fontSize: '12px'
          }}
        >
          <div>
            <strong>Success:</strong> {testResult.success ? 'Yes' : 'No'}
          </div>
          {testResult.status && (
            <div>
              <strong>Status:</strong> {testResult.status}
            </div>
          )}
          {testResult.error && (
            <div>
              <strong>Error:</strong> {testResult.error}
            </div>
          )}
          {testResult.data && (
            <pre
              style={{
                background: 'rgba(0,0,0,0.1)',
                padding: '5px',
                borderRadius: '3px',
                fontSize: '10px'
              }}
            >
              {JSON.stringify(testResult.data, null, 2)}
            </pre>
          )}
        </div>
      )}
    </div>
  );
};

// Inline data inspector
const SimpleDataInspector = ({ swellProduct, sanityContent }) => {
  const analyzeTracklist = (tracklist) => {
    if (!tracklist || !Array.isArray(tracklist)) return null;

    let defaultTitles = 0;
    let customTitles = 0;

    tracklist.forEach((track) => {
      const title = track.title?.trim() || '';
      if (/^Track \d+$/i.test(title) || title === '' || !title) {
        defaultTitles++;
      } else {
        customTitles++;
      }
    });

    return { total: tracklist.length, defaultTitles, customTitles };
  };

  const analysis = analyzeTracklist(sanityContent?.tracklist);
  const shouldUpdate =
    sanityContent?.discogsReleaseId &&
    analysis?.defaultTitles > 0 &&
    !sanityContent?.tracklistEnhanced;

  return (
    <div
      style={{
        background: shouldUpdate ? '#fff3cd' : '#d4edda',
        border: '1px solid ' + (shouldUpdate ? '#ffeaa7' : '#c3e6cb'),
        borderRadius: '8px',
        padding: '15px',
        margin: '20px 0'
      }}
    >
      <h3>📊 Data Analysis</h3>
      <div>
        <strong>Status:</strong> {shouldUpdate ? '🟡 Should Update' : '🟢 No Update Needed'}
      </div>
      <div>
        <strong>Swell Product ID:</strong> {swellProduct?.id || '❌ Missing'}
      </div>
      <div>
        <strong>Sanity Document ID:</strong> {sanityContent?._id || '❌ Missing'}
      </div>
      <div>
        <strong>Discogs Release ID:</strong> {sanityContent?.discogsReleaseId || '❌ Missing'}
      </div>
      <div>
        <strong>Tracklist Enhanced:</strong> {sanityContent?.tracklistEnhanced ? 'Yes' : 'No'}
      </div>

      {analysis && (
        <div
          style={{
            marginTop: '10px',
            padding: '8px',
            background: 'rgba(0,0,0,0.05)',
            borderRadius: '4px'
          }}
        >
          <div>
            <strong>Tracklist:</strong> {analysis.total} tracks total
          </div>
          <div>🔤 Default titles: {analysis.defaultTitles}</div>
          <div>✏️ Custom titles: {analysis.customTitles}</div>
        </div>
      )}

      <div style={{ marginTop: '10px', fontSize: '12px' }}>
        <strong>Environment:</strong>
        <div>
          • NEXT_PUBLIC_SANITY_PROJECT_ID: {process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ? '✅' : '❌'}
        </div>
        <div>
          • NEXT_PUBLIC_SANITY_DATASET: {process.env.NEXT_PUBLIC_SANITY_DATASET ? '✅' : '❌'}
        </div>
      </div>
    </div>
  );
};

export default function DebugDiscogsPage() {
  // REAL DATA from your Sanity document
  const [testData, setTestData] = useState({
    swellProduct: {
      id: '68467ea11285d80012178143',
      name: "Baby You're The One",
      slug: 'baby-youre-the-one-2'
    },
    sanityContent: {
      _id: 'SxeZ4JbLLCDxdlHB25usqe', // Your real Sanity document ID
      title: "Baby You're The One",
      artist: ['Wind Chymes'],
      discogsReleaseId: '33672036', // Your real Discogs release ID
      tracklistEnhanced: false, // Make sure this is false to trigger update
      tracklist: [
        {
          _key: '683511962dc92',
          _type: 'object',
          artist: '',
          audioFileSize: 1083663,
          audioFilename: 'cer007_a_1',
          audioMimeType: 'audio/mpeg',
          audioUrl: 'https://storage.googleapis.com/themixtapeshop/2025/05/4c16dffb-cer007_a_1.mp3',
          storageProvider: 'google',
          title: 'Track 1', // This should get updated from Discogs
          trackNumber: 1,
          wordpressAttachmentId: 204255
        },
        {
          _key: '6835119631668',
          _type: 'object',
          artist: '',
          audioFileSize: 1074886,
          audioFilename: 'cer007_b_1',
          audioMimeType: 'audio/mpeg',
          audioUrl: 'https://storage.googleapis.com/themixtapeshop/2025/05/5491b30e-cer007_b_1.mp3',
          storageProvider: 'google',
          title: 'Track 2', // This should get updated from Discogs
          trackNumber: 2,
          wordpressAttachmentId: 204256
        }
      ]
    }
  });

  // Test what Discogs returns for this release ID
  const testSpecificRelease = async () => {
    try {
      console.log('🧪 Testing specific Discogs release:', testData.sanityContent.discogsReleaseId);

      const response = await fetch(
        `https://api.discogs.com/releases/${testData.sanityContent.discogsReleaseId}`,
        {
          headers: { 'User-Agent': 'TestApp/1.0' }
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log('🧪 Your release data from Discogs:', {
          title: data.title,
          artists: data.artists?.map((a) => a.name),
          tracklistLength: data.tracklist?.length,
          fullTracklist: data.tracklist
        });
      } else {
        console.error('🧪 Discogs API error:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('🧪 Error testing release:', error);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'system-ui', maxWidth: '800px', margin: '0 auto' }}>
      <h1>🔧 Discogs Integration Debug - REAL DATA</h1>

      <div
        style={{
          background: '#d1ecf1',
          padding: '15px',
          borderRadius: '8px',
          border: '1px solid #bee5eb',
          marginBottom: '20px'
        }}
      >
        <h3>🔍 Instructions</h3>
        <ol>
          <li>
            <strong>Open browser console</strong> (F12 → Console)
          </li>
          <li>
            <strong>Look for these prefixes:</strong> 🎵 🔄 📡 🗄️ 🌐
          </li>
          <li>
            <strong>Test your specific Discogs release</strong> using button below
          </li>
          <li>
            <strong>Watch console</strong> for TracklistUpdater activity
          </li>
        </ol>
      </div>

      {/* Quick API Tests */}
      <SimpleApiTest />

      {/* Test your specific release */}
      <div
        style={{
          background: '#fff3cd',
          border: '1px solid #ffeaa7',
          borderRadius: '8px',
          padding: '15px',
          margin: '20px 0'
        }}
      >
        <h3>🎯 Test Your Specific Release</h3>
        <button
          onClick={testSpecificRelease}
          style={{
            padding: '8px 15px',
            backgroundColor: '#ffc107',
            color: 'black',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Test Wind Chymes Release (ID: {testData.sanityContent.discogsReleaseId})
        </button>
        <p style={{ marginTop: '10px', fontSize: '14px' }}>
          This will show what track data Discogs has for your specific release.
        </p>
      </div>

      {/* Data Analysis - should now show "Should Update" */}
      <SimpleDataInspector
        swellProduct={testData.swellProduct}
        sanityContent={testData.sanityContent}
      />

      {/* Current Test Data */}
      <div
        style={{
          background: '#e9ecef',
          padding: '15px',
          borderRadius: '8px',
          marginBottom: '20px'
        }}
      >
        <h3>📋 Your Real Product Data</h3>
        <div>
          <strong>Product:</strong> {testData.sanityContent.title} by{' '}
          {testData.sanityContent.artist?.[0]}
        </div>
        <div>
          <strong>Discogs Release ID:</strong> {testData.sanityContent.discogsReleaseId}
        </div>
        <div>
          <strong>Current Track Titles:</strong>
        </div>
        <ul>
          {testData.sanityContent.tracklist.map((track, i) => (
            <li key={i} style={{ color: track.title.match(/^Track \d+$/) ? 'orange' : 'green' }}>
              {track.title} {track.title.match(/^Track \d+$/) ? '(needs update)' : '(custom)'}
            </li>
          ))}
        </ul>
      </div>

      {/* Active TracklistUpdater with REAL DATA */}
      <div
        style={{
          background: '#d4edda',
          border: '1px solid #c3e6cb',
          borderRadius: '8px',
          padding: '15px'
        }}
      >
        <h3>🚀 Active TracklistUpdater with Real Data</h3>
        <p>This should now process your actual Wind Chymes release!</p>

        <TracklistUpdater
          swellProduct={testData.swellProduct}
          sanityContent={testData.sanityContent}
          showDebugInfo={true}
        />
      </div>

      {/* Expected Results */}
      <div
        style={{
          background: '#f8d7da',
          border: '1px solid #f5c6cb',
          borderRadius: '8px',
          padding: '15px',
          marginTop: '20px'
        }}
      >
        <h3>📋 Expected Results</h3>
        <p>
          <strong>What should happen:</strong>
        </p>
        <ol>
          <li>TracklistUpdater detects "Track 1" and "Track 2" need updating</li>
          <li>Fetches data from Discogs release ID 33672036</li>
          <li>Updates titles with real track names from Discogs</li>
          <li>Saves updated tracklist back to your Sanity document</li>
        </ol>
        <p>
          <strong>Check console for:</strong> 🎵 🔄 📡 🗄️ 🌐 prefixed messages
        </p>
      </div>
    </div>
  );
}
