// components/layout/header/menu.tsx - Empty menu component or delete this file
'use client';

import { useEffect, useState } from 'react';
import { useSearch } from './search-provider';

export default function Menu() {
  const { isSearchVisible } = useSearch();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  // If you don't need this menu, return null or delete this component entirely
  return null;
}
