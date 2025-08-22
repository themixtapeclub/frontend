// components/layout/client-providers.tsx - Add hydration class + AuthProvider + PersistentPlayer
'use client';

import { AuthProvider } from 'contexts/AuthContext';
import { PersistentPlayerProvider } from 'contexts/PersistentPlayerContext';
import { ReactNode, useEffect, useRef } from 'react';
import MixcloudFooter from './footer/Mixcloud';

interface ClientProvidersProps {
  children: ReactNode;
}

export default function ClientProviders({ children }: ClientProvidersProps) {
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (hasInitialized.current) return;

    hasInitialized.current = true;

    // Mark as hydrated after DOM is ready
    const timer = setTimeout(() => {
      document.body.classList.add('hydrated');
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return (
    <AuthProvider>
      <PersistentPlayerProvider>
        {children}
        <MixcloudFooter />
      </PersistentPlayerProvider>
    </AuthProvider>
  );
}
