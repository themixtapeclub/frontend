// contexts/SanityProductContext.tsx
import { getSanityProductContent } from 'lib/cms';
import { createContext, useContext, useEffect, useState } from 'react';

interface SanityProductContextType {
  content: any;
  loading: boolean;
}

const SanityProductContext = createContext<SanityProductContextType>({
  content: null,
  loading: true
});

export function SanityProductProvider({
  productId,
  sku,
  initialContent = null, // Accept initial data
  children
}: {
  productId: string;
  sku: string | null;
  initialContent?: any;
  children: React.ReactNode;
}) {
  const [content, setContent] = useState(initialContent); // Start with initial data
  const [loading, setLoading] = useState(!initialContent); // Not loading if we have initial data

  useEffect(() => {
    // Only fetch if we don't have initial content
    if (!initialContent && productId) {
      getSanityProductContent(productId)
        .then(setContent)
        .finally(() => setLoading(false));
    }
  }, [productId, initialContent]);

  return (
    <SanityProductContext.Provider value={{ content, loading }}>
      {children}
    </SanityProductContext.Provider>
  );
}

export const useSanityProduct = () => useContext(SanityProductContext);
