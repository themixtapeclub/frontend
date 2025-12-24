// frontend/src/modules/layout/components/header/use-header-offset.tsx
"use client"

import { useNowPlaying, BANNER_HEIGHT } from "./now-playing-context"

const BASE_HEADER_HEIGHT = 40

export function useHeaderOffset() {
  const { isVisible, bannerHeight } = useNowPlaying()
  
  return {
    headerHeight: BASE_HEADER_HEIGHT,
    bannerHeight,
    totalHeight: BASE_HEADER_HEIGHT + bannerHeight,
    isPlayerVisible: isVisible,
  }
}

export { BANNER_HEIGHT, BASE_HEADER_HEIGHT }