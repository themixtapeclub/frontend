// src/modules/common/components/play-button/index.tsx
"use client"

import { loadPersistentMix } from "@modules/mixcloud/components/mixcloud-player/persistent-player"

function PlayIcon() {
  return (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" />
    </svg>
  )
}

interface MixtapePlayButtonProps {
  mixcloudUrl: string
  localUrl: string
  imageUrl?: string
}

export default function MixtapePlayButton({ 
  mixcloudUrl, 
  localUrl,
  imageUrl 
}: MixtapePlayButtonProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    loadPersistentMix(mixcloudUrl, { localUrl, imageUrl })
  }

  return (
    <button
      onClick={handleClick}
      className="flex items-center justify-center bg-white text-black rounded cursor-pointer hover:bg-gray-100 transition-colors"
      style={{ width: "40px", height: "26px" }}
      aria-label="Play Mixtape"
    >
      <PlayIcon />
    </button>
  )
}
