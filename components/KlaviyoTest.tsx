// components/KlaviyoTest.tsx
'use client';

import { useState } from 'react';
import { klaviyo } from '../lib/services/klaviyo';

const KlaviyoTest = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleTest = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      await klaviyo.subscribeEmail(email, [], {
        test_signup: true,
        source: 'test_form'
      });

      await klaviyo.trackEvent(email, 'Test Signup', {
        source: 'test_form'
      });

      setMessage('✅ Test successful! Check your Klaviyo dashboard.');
    } catch (error) {
      setMessage(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto mt-8 max-w-md rounded-lg bg-white p-6 shadow-lg">
      <h2 className="mb-4 text-xl font-bold">Test Klaviyo Integration</h2>

      <form onSubmit={handleTest} className="space-y-4">
        <div>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter test email"
            required
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading || !email}
          className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? 'Testing...' : 'Test Integration'}
        </button>
      </form>

      {message && (
        <div className="mt-4 rounded-md bg-gray-100 p-3">
          <p className="text-sm">{message}</p>
        </div>
      )}

      <div className="mt-4 text-xs text-gray-500">
        <p>This will:</p>
        <ul className="list-inside list-disc">
          <li>Create/update a profile in Klaviyo</li>
          <li>Track a "Test Signup" event</li>
          <li>Test bot protection</li>
        </ul>
      </div>
    </div>
  );
};

export default KlaviyoTest;
