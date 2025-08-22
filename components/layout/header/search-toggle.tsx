'use client';

import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/solid';

interface SearchToggleProps {
  isVisible: boolean;
  onToggle: () => void;
}

export default function SearchToggle({ isVisible, onToggle }: SearchToggleProps) {
  return (
    <button
      onClick={onToggle}
      className="mx-1 border-0 bg-transparent px-1 outline"
      aria-label={isVisible ? 'Close search' : 'Open search'}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0
      }}
    >
      {isVisible ? (
        <XMarkIcon className="outline-icon h-4 w-4" />
      ) : (
        <MagnifyingGlassIcon className="outline-icon h-4 w-4" />
      )}
    </button>
  );
}
