// components/layout/navbar/search.tsx
'use client';

import { XMarkIcon } from '@heroicons/react/24/outline';
import { createUrl } from 'lib/utils/core';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

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

    router.push(createUrl('/search', newParams));
  }

  return (
    <form onSubmit={onSubmit} className="search position-relative w-full">
      <input
        key={searchParams?.get('q')}
        type="text"
        name="search"
        placeholder="Search..."
        autoComplete="off"
        defaultValue={searchParams?.get('q') || ''}
        className="w-full"
      />
      <div className="absolute right-0 top-0 mr-3 flex h-full items-center">
        <XMarkIcon className="h-4 w-4 text-gray-800" />
      </div>
    </form>
  );
}

export default function Search() {
  return (
    <Suspense
      fallback={
        <form className="search position-relative w-full">
          <input
            type="text"
            name="search"
            placeholder="Search..."
            autoComplete="off"
            className="w-full"
            disabled
          />
          <div className="absolute right-0 top-0 mr-3 flex h-full items-center">
            <XMarkIcon className="h-4 w-4 text-gray-800" />
          </div>
        </form>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
