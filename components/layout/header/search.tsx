// components/layout/header/search.tsx
'use client';

import { createUrl } from 'lib/utils/core';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useRef, useState } from 'react';
import { useSearch } from './search-provider';

interface SearchProps {
  onSearchSubmit?: () => void;
}

function SearchContent({ onSearchSubmit }: SearchProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isSearchVisible } = useSearch();
  const [mounted, setMounted] = useState(false);
  const [shouldShow, setShouldShow] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
    setInputValue(searchParams?.get('q') || '');
  }, []);

  useEffect(() => {
    if (mounted) {
      const urlValue = searchParams?.get('q') || '';
      if (urlValue && urlValue !== inputValue) {
        setInputValue(urlValue);
      }
    }
  }, [searchParams, mounted]);

  useEffect(() => {
    if (!mounted) return;

    if (isSearchVisible) {
      const timer = setTimeout(() => setShouldShow(true), 150);
      return () => clearTimeout(timer);
    } else {
      setShouldShow(false);
    }

    return undefined;
  }, [isSearchVisible, mounted]);

  useEffect(() => {
    const handleClearSearchInputs = (e: CustomEvent) => {
      if (e.detail.clearValue) {
        setInputValue('');
        if (inputRef.current) {
          inputRef.current.value = '';
        }
      }
    };

    document.addEventListener('clearSearchInputs', handleClearSearchInputs as EventListener);
    return () => {
      document.removeEventListener('clearSearchInputs', handleClearSearchInputs as EventListener);
    };
  }, []);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const val = e.target as HTMLFormElement;
    const search = val.search as HTMLInputElement;
    const newParams = new URLSearchParams(searchParams.toString());

    if (search.value) {
      newParams.set('q', search.value);
    } else {
      newParams.delete('q');
    }

    if (onSearchSubmit) {
      onSearchSubmit();
    }

    router.push(createUrl('/search', newParams));
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    setInputValue(e.target.value);
  }

  if (!mounted || !shouldShow) {
    return null;
  }

  return (
    <div
      className="header-search col d-flex justify-content-center align-items-center"
      style={{
        transition: 'opacity 0.15s ease-in',
        opacity: shouldShow ? 1 : 0,
        willChange: 'opacity'
      }}
    >
      <div className="w-100">
        <form onSubmit={onSubmit} className="search w-full">
          <input
            ref={inputRef}
            type="text"
            name="search"
            placeholder="Search..."
            autoComplete="off"
            value={inputValue}
            onChange={handleInputChange}
            className="w-full ps-2"
            autoFocus
          />
        </form>
      </div>
    </div>
  );
}

export default function Search(props: SearchProps) {
  return (
    <Suspense fallback={null}>
      <SearchContent {...props} />
    </Suspense>
  );
}
