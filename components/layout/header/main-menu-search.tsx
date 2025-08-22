// components/layout/header/main-menu-search.tsx - Updated to use controlled state and listen for clear events
'use client';

import { MagnifyingGlassIcon } from '@heroicons/react/24/solid';
import { createUrl } from 'lib/utils/core';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useRef, useState } from 'react';

interface SearchProps {
  onSearchSubmit?: () => void;
}

function SearchContent({ onSearchSubmit }: SearchProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize input value from URL params
  useEffect(() => {
    setInputValue(searchParams?.get('q') || '');
  }, []);

  // Update input value when URL params change (but only on mount or actual URL changes)
  useEffect(() => {
    const urlValue = searchParams?.get('q') || '';
    // Only update if the value actually changed and it's not empty
    // (this prevents clearing from being overridden)
    if (urlValue && urlValue !== inputValue) {
      setInputValue(urlValue);
    }
  }, [searchParams]);

  // Listen for clear search inputs event
  useEffect(() => {
    const handleClearSearchInputs = (e: CustomEvent) => {
      console.log('🧹 [DEBUG] Main menu search received clear inputs event');
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

    // Close search before navigation
    if (onSearchSubmit) {
      onSearchSubmit();
    }

    router.push(createUrl('/search', newParams));
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    setInputValue(e.target.value);
  }

  return (
    <form onSubmit={onSubmit} className="search fs-4 mono relative w-full">
      <div className="relative">
        <MagnifyingGlassIcon
          className="outline-icon h-5 w-5"
          style={{
            position: 'absolute',
            top: '.75rem',
            left: '.75rem'
          }}
        />

        <input
          ref={inputRef}
          type="text"
          name="search"
          placeholder="Search..."
          autoComplete="off"
          value={inputValue}
          onChange={handleInputChange}
          className="w-full border-t border-t-transparent py-1 pl-10 pr-3 transition-all duration-200 focus:border-t-black focus:bg-black focus:text-white focus:outline-none focus-visible:shadow-none"
        />
      </div>
    </form>
  );
}

export default function Search(props: SearchProps) {
  return (
    <Suspense
      fallback={
        <form className="search fs-4 mono relative w-full">
          <div className="relative">
            <MagnifyingGlassIcon
              className="outline-icon h-5 w-5"
              style={{
                position: 'absolute',
                top: '.75rem',
                left: '.75rem'
              }}
            />
            <input
              type="text"
              name="search"
              placeholder="Search..."
              autoComplete="off"
              className="w-full border-t border-t-transparent py-1 pl-10 pr-3 transition-all duration-200 focus:border-t-black focus:bg-black focus:text-white focus:outline-none focus-visible:shadow-none"
              disabled
            />
          </div>
        </form>
      }
    >
      <SearchContent {...props} />
    </Suspense>
  );
}
