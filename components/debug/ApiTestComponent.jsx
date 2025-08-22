// components/debug/ApiTestComponent.jsx
'use client';

import { useState } from 'react';

const ApiTestComponent = () => {
  const [testResult, setTestResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const testApiEndpoint = async () => {
    setIsLoading(true);
    setTestResult(null);

    try {
      console.log('🧪 Testing API endpoint...');

      const response = await fetch('/api/update-tracklist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          documentId: 'test-document-id',
          tracklist: [
            {
              _key: 'track-1',
              title: 'Test Track 1',
              duration: '3:45'
            },
            {
              _key: 'track-2',
              title: 'Test Track 2',
              duration: '4:12'
            }
          ]
        })
      });

      console.log('🧪 API Response:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });

      const data = await response.json();

      setTestResult({
        success: response.ok,
        status: response.status,
        data
      });
    } catch (error) {
      console.error('🧪 API Test Error:', error);
      setTestResult({
        success: false,
        error: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  const testDiscogsApi = async () => {
    setIsLoading(true);
    setTestResult(null);

    try {
      console.log('🧪 Testing Discogs API...');

      // Test with a known release ID (Miles Davis - Kind of Blue)
      const releaseId = '1293762';
      const response = await fetch(`https://api.discogs.com/releases/${releaseId}`, {
        headers: {
          'User-Agent': 'TestApp/1.0'
        }
      });

      console.log('🧪 Discogs Response:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });

      if (response.ok) {
        const data = await response.json();
        setTestResult({
          success: true,
          status: response.status,
          data: {
            title: data.title,
            year: data.year,
            tracklistLength: data.tracklist?.length,
            tracklist: data.tracklist?.slice(0, 3) // First 3 tracks
          }
        });
      } else {
        throw new Error(`${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error('🧪 Discogs Test Error:', error);
      setTestResult({
        success: false,
        error: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  const checkEnvironmentVars = () => {
    const envVars = {
      NEXT_PUBLIC_SANITY_PROJECT_ID: !!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
      NEXT_PUBLIC_SANITY_DATASET: !!process.env.NEXT_PUBLIC_SANITY_DATASET
      // Note: Server-side env vars won't be visible here, but we can check if they're missing by API response
    };

    setTestResult({
      success: true,
      data: {
        clientSideEnvVars: envVars,
        note: 'Server-side SANITY_API_TOKEN visibility will be tested via API call'
      }
    });
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        background: 'white',
        border: '2px solid #ccc',
        borderRadius: '8px',
        padding: '20px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        zIndex: 9999,
        maxWidth: '400px',
        maxHeight: '500px',
        overflow: 'auto'
      }}
    >
      <h3 style={{ margin: '0 0 15px 0', fontSize: '16px' }}>🧪 Discogs Integration Test</h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '15px' }}>
        <button
          onClick={checkEnvironmentVars}
          disabled={isLoading}
          style={{
            padding: '8px 12px',
            backgroundColor: '#17a2b8',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Check Environment Variables
        </button>

        <button
          onClick={testDiscogsApi}
          disabled={isLoading}
          style={{
            padding: '8px 12px',
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
            padding: '8px 12px',
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

      {isLoading && (
        <div style={{ padding: '10px', background: '#f8f9fa', borderRadius: '4px' }}>
          Loading...
        </div>
      )}

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
            <div style={{ marginTop: '10px' }}>
              <strong>Data:</strong>
              <pre
                style={{
                  background: 'rgba(0,0,0,0.1)',
                  padding: '5px',
                  borderRadius: '3px',
                  fontSize: '10px',
                  overflow: 'auto',
                  maxHeight: '200px'
                }}
              >
                {JSON.stringify(testResult.data, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ApiTestComponent;
