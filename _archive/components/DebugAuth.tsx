// components/DebugAuth.tsx - Temporary debug component
'use client';

import { useState } from 'react';
import { authManager, debugSwell } from '../lib/services/auth';

export default function DebugAuth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [result, setResult] = useState<string>('');

  const handleDebug = () => {
    debugSwell();
    setResult('Check console for debug info');
  };

  const handleTestLogin = async () => {
    try {
      setResult('Testing login...');
      const loginResult = await authManager.login(email, password);
      setResult(`Login result: ${JSON.stringify(loginResult, null, 2)}`);
    } catch (error) {
      setResult(`Error: ${error}`);
    }
  };

  const handleTestAccount = async () => {
    try {
      await authManager.testAccountCreation();
      setResult('Check console for account test info');
    } catch (error) {
      setResult(`Error: ${error}`);
    }
  };

  return (
    <div className="mx-auto mt-8 max-w-md rounded-lg bg-gray-100 p-6">
      <h3 className="mb-4 text-lg font-bold">Debug Swell Auth</h3>

      <div className="space-y-4">
        <button
          onClick={handleDebug}
          className="w-full rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
        >
          Debug Swell Methods
        </button>

        <button
          onClick={handleTestAccount}
          className="w-full rounded bg-green-500 px-4 py-2 text-white hover:bg-green-600"
        >
          Test Account Methods
        </button>

        <div className="space-y-2">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded border px-3 py-2"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded border px-3 py-2"
          />
          <button
            onClick={handleTestLogin}
            className="w-full rounded bg-red-500 px-4 py-2 text-white hover:bg-red-600"
          >
            Test Login
          </button>
        </div>

        {result && (
          <pre className="max-h-40 overflow-auto rounded bg-white p-3 text-xs">{result}</pre>
        )}
      </div>
    </div>
  );
}
