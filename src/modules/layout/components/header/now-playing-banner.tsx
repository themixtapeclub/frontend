// frontend/src/modules/layout/components/header/now-playing-banner.tsx
"use client"
import { useNowPlaying, BANNER_HEIGHT } from "./now-playing-context"
import NowPlayingBar from "./now-playing-bar"

export default function NowPlayingBanner() {
  const { isVisible, closeBanner, currentTrack, isPlaying } = useNowPlaying()
  
  return (
    <div
      style={{
        width: '100%',
        height: isVisible ? BANNER_HEIGHT + 'px' : '0px',
        overflow: 'hidden',
        transition: 'height 0.3s ease-out',
        borderBottom: isVisible ? '1px solid black' : 'none',
        pointerEvents: isVisible ? 'auto' : 'none',
      }}
    >
      {isVisible && (
        <NowPlayingBar
          variant="header"
          currentTrack={currentTrack}
          isPlaying={isPlaying}
          onClose={closeBanner}
        />
      )}
    </div>
  )
}