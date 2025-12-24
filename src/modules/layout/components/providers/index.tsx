// frontend/src/modules/layout/components/providers/index.tsx
"use client"

import { AudioPlayerProvider } from "@lib/context/audio-player"
import { AdminProvider } from "@lib/context/admin-context"
import { SearchProvider } from "@modules/layout/components/header/search-provider"
import { NowPlayingProvider } from "@modules/layout/components/header/now-playing-context"
import { PersistentPlayerManager } from "@modules/mixcloud/components/mixcloud-player/persistent-player"
import { ReactNode } from "react"

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <AdminProvider>
      <AudioPlayerProvider>
        <SearchProvider>
          <NowPlayingProvider>
            {children}
            <PersistentPlayerManager />
          </NowPlayingProvider>
        </SearchProvider>
      </AudioPlayerProvider>
    </AdminProvider>
  )
}