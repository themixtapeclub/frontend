"use client"

import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/solid'

interface SearchToggleProps {
  isVisible: boolean
  onToggle: () => void
}

export default function SearchToggle({ isVisible, onToggle }: SearchToggleProps) {
  return (
    <button
      onClick={onToggle}
      className="outline outline-button"
      aria-label={isVisible ? 'Close search' : 'Open search'}
    >
      {isVisible ? (
        <XMarkIcon className="outline-icon h-4 w-4" />
      ) : (
        <MagnifyingGlassIcon className="outline-icon h-4 w-4" />
      )}
    </button>
  )
}
