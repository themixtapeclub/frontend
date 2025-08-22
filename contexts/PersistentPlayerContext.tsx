// contexts/PersistentPlayerContext.tsx
'use client';

import { usePathname } from 'next/navigation';
import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';

interface MixtapeData {
  title: string;
  artist?: string;
  mixcloudUrl: string;
  embedUrl: string;
  imageUrl?: string;
  slug?: string;
}

interface PlayerState {
  isVisible: boolean;
  isPlaying: boolean;
  mixtapeData: MixtapeData | null;
}

interface PersistentPlayerContextType {
  playerState: PlayerState;
  showPlayer: (data: MixtapeData) => void;
  hidePlayer: () => void;
  setPlaying: (playing: boolean) => void;
  togglePlayer: () => void;
}

const PersistentPlayerContext = createContext<PersistentPlayerContextType | undefined>(undefined);

interface PersistentPlayerProviderProps {
  children: ReactNode;
}

export function PersistentPlayerProvider({ children }: PersistentPlayerProviderProps) {
  const [playerState, setPlayerState] = useState<PlayerState>({
    isVisible: false,
    isPlaying: false,
    mixtapeData: null
  });

  const pathname = usePathname();

  useEffect(() => {
    return;
  }, [pathname, playerState.isPlaying, playerState.mixtapeData]);

  const showPlayer = useCallback((data: MixtapeData) => {
    setPlayerState({
      isVisible: true,
      isPlaying: true,
      mixtapeData: data
    });
  }, []);

  const hidePlayer = useCallback(() => {
    setPlayerState({
      isVisible: false,
      isPlaying: false,
      mixtapeData: null
    });
  }, []);

  const setPlaying = useCallback((playing: boolean) => {
    setPlayerState((prev) => ({
      ...prev,
      isPlaying: playing
    }));
  }, []);

  const togglePlayer = useCallback(() => {
    setPlayerState((prev) => ({
      ...prev,
      isVisible: !prev.isVisible
    }));
  }, []);

  useEffect(() => {
    if (playerState.isVisible && !playerState.isPlaying) {
      const timeout = setTimeout(() => {}, 300000);

      return () => clearTimeout(timeout);
    }
    return;
  }, [playerState.isVisible, playerState.isPlaying]);

  const value: PersistentPlayerContextType = {
    playerState,
    showPlayer,
    hidePlayer,
    setPlaying,
    togglePlayer
  };

  return (
    <PersistentPlayerContext.Provider value={value}>{children}</PersistentPlayerContext.Provider>
  );
}

export function usePersistentPlayer(): PersistentPlayerContextType {
  const context = useContext(PersistentPlayerContext);
  if (context === undefined) {
    throw new Error('usePersistentPlayer must be used within a PersistentPlayerProvider');
  }
  return context;
}
