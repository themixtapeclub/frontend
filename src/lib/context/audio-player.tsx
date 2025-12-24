// src/lib/context/audio-player.tsx
"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from "react"

interface Track {
  title: string
  artist?: string
  duration?: string
  url?: string
  audioUrl?: string
  productSlug?: string
  productUrl?: string
  productName?: string
  productImage?: string
  album?: string
  _key?: string
  number?: string
}

interface AudioState {
  currentTrack: Track | null
  isPlaying: boolean
  currentTime: number
  duration: number
}

interface AudioContextType {
  state: AudioState
  analyser: AnalyserNode | null
  playTrack: (track: Track) => void
  playTracklist: (tracks: Track[], startIndex?: number) => void
  pauseTrack: () => void
  resumeTrack: () => void
  stopPlayback: () => void
  seekTo: (time: number) => void
  isTrackPlaying: (track: Track) => boolean
  getCurrentTrack: () => Track | null
  updateQueueTrackTitles: (updatedTracks: Track[]) => void
}

const AudioContext = createContext<AudioContextType | undefined>(undefined)

const globalAudioState = {
  currentTrack: null as Track | null,
  lastTrack: null as Track | null,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  audioRef: null as HTMLAudioElement | null,
  listeners: new Set<() => void>(),
  playHistory: [] as Track[],
  currentTrackIndex: 0,
  currentAlbumTracks: [] as Track[],
  currentAlbumStartIndex: 0,
  stopTimeout: null as NodeJS.Timeout | null,
  audioContext: null as AudioContext | null,
  analyser: null as AnalyserNode | null,
  sourceNode: null as MediaElementAudioSourceNode | null,
}

if (typeof window !== "undefined") {
  ;(window as any).globalAudioState = globalAudioState
  ;(window as any).__getGlobalAudioState = () => globalAudioState
}

const notifyListeners = () => {
  globalAudioState.listeners.forEach((listener) => listener())
}

const pauseMixcloudPlayer = () => {
  try {
    const pauseForOther = (window as any).__pauseMixcloudForOtherAudio
    if (pauseForOther) {
      pauseForOther()
    }
  } catch {}
}

const matchTrackByUrl = (track: Track, candidate: Track): boolean => {
  const trackUrl = track.audioUrl || track.url
  const candidateUrl = candidate.audioUrl || candidate.url
  return !!(trackUrl && candidateUrl && trackUrl === candidateUrl)
}

const updateTrackMetadata = (tracks: Track[], updatedTracks: Track[]): Track[] => {
  return tracks.map(track => {
    const match = updatedTracks.find(updated => matchTrackByUrl(track, updated))
    if (match) {
      return { ...track, title: match.title, artist: match.artist }
    }
    return track
  })
}

const initAudioContext = () => {
  if (!globalAudioState.audioContext) {
    globalAudioState.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    globalAudioState.analyser = globalAudioState.audioContext.createAnalyser()
    globalAudioState.analyser.fftSize = 128
    globalAudioState.analyser.smoothingTimeConstant = 0.98
    globalAudioState.analyser.connect(globalAudioState.audioContext.destination)
  }
  if (globalAudioState.audioContext.state === "suspended") {
    globalAudioState.audioContext.resume()
  }
  return globalAudioState.audioContext
}

export function AudioPlayerProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AudioState>({
    currentTrack: null,
    isPlaying: false,
    currentTime: 0,
    duration: 0,
  })
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null)

  useEffect(() => {
    const updateState = () => {
      setState({
        currentTrack: globalAudioState.currentTrack,
        isPlaying: globalAudioState.isPlaying,
        currentTime: globalAudioState.currentTime,
        duration: globalAudioState.duration,
      })
      if (globalAudioState.analyser && !analyser) {
        setAnalyser(globalAudioState.analyser)
      }
    }

    globalAudioState.listeners.add(updateState)
    updateState()

    return () => {
      globalAudioState.listeners.delete(updateState)
    }
  }, [analyser])

  const playTrackInternal = (track: Track) => {
    pauseMixcloudPlayer()

    if (globalAudioState.stopTimeout) {
      clearTimeout(globalAudioState.stopTimeout)
      globalAudioState.stopTimeout = null
    }

    if (globalAudioState.audioRef) {
      globalAudioState.audioRef.pause()
      globalAudioState.audioRef = null
    }

    if (globalAudioState.sourceNode) {
      try { globalAudioState.sourceNode.disconnect() } catch {}
      globalAudioState.sourceNode = null
    }

    const audioUrl = track.audioUrl || track.url
    if (!audioUrl) return

    try {
      globalAudioState.audioRef = new Audio()
      globalAudioState.audioRef.crossOrigin = "anonymous"
      globalAudioState.audioRef.src = audioUrl
      globalAudioState.currentTrack = track
      globalAudioState.lastTrack = track
      globalAudioState.currentTime = 0
      globalAudioState.duration = 0

      try {
        const ctx = initAudioContext()
        globalAudioState.sourceNode = ctx.createMediaElementSource(globalAudioState.audioRef)
        globalAudioState.sourceNode.connect(globalAudioState.analyser!)
      } catch {}
      
      if (!analyser && globalAudioState.analyser) {
        setAnalyser(globalAudioState.analyser)
      }

      globalAudioState.audioRef.addEventListener("canplay", () => {
        globalAudioState.isPlaying = true
        notifyListeners()
      })

      globalAudioState.audioRef.addEventListener("play", () => {
        globalAudioState.isPlaying = true
        notifyListeners()
      })

      globalAudioState.audioRef.addEventListener("pause", () => {
        globalAudioState.isPlaying = false
        notifyListeners()
      })

      globalAudioState.audioRef.addEventListener("timeupdate", () => {
        if (globalAudioState.audioRef) {
          globalAudioState.currentTime = globalAudioState.audioRef.currentTime
          notifyListeners()
        }
      })

      globalAudioState.audioRef.addEventListener("loadedmetadata", () => {
        if (globalAudioState.audioRef) {
          globalAudioState.duration = globalAudioState.audioRef.duration
          notifyListeners()
        }
      })

      globalAudioState.audioRef.addEventListener("ended", () => {
        if (
          globalAudioState.playHistory.length > 0 &&
          globalAudioState.currentTrackIndex < globalAudioState.playHistory.length - 1
        ) {
          const newIndex = globalAudioState.currentTrackIndex + 1
          globalAudioState.currentTrackIndex = newIndex
          playTrackInternal(globalAudioState.playHistory[newIndex])
          return
        }

        globalAudioState.lastTrack = globalAudioState.currentTrack
        globalAudioState.currentTrack = null
        globalAudioState.isPlaying = false
        globalAudioState.currentTime = 0

        globalAudioState.stopTimeout = setTimeout(() => {
          globalAudioState.lastTrack = null
          notifyListeners()
        }, 5000)

        notifyListeners()
      })

      globalAudioState.audioRef.addEventListener("error", () => {
        globalAudioState.lastTrack = globalAudioState.currentTrack
        globalAudioState.currentTrack = null
        globalAudioState.isPlaying = false
        notifyListeners()
      })

      globalAudioState.audioRef.play()
      notifyListeners()
    } catch {
      globalAudioState.currentTrack = null
      globalAudioState.isPlaying = false
      notifyListeners()
    }
  }

  const playTrack = (track: Track) => {
    globalAudioState.playHistory = [track]
    globalAudioState.currentTrackIndex = 0
    globalAudioState.currentAlbumTracks = [track]
    globalAudioState.currentAlbumStartIndex = 0
    playTrackInternal(track)
  }

  const playTracklist = (tracks: Track[], startIndex = 0) => {
    globalAudioState.currentAlbumTracks = tracks
    globalAudioState.currentAlbumStartIndex = globalAudioState.playHistory.length
    globalAudioState.playHistory.push(...tracks)
    globalAudioState.currentTrackIndex = globalAudioState.currentAlbumStartIndex + startIndex
    playTrackInternal(tracks[startIndex])
    notifyListeners()
  }

  const pauseTrack = () => {
    if (globalAudioState.audioRef && !globalAudioState.audioRef.paused) {
      globalAudioState.audioRef.pause()
      globalAudioState.isPlaying = false
      notifyListeners()
    }
  }

  const resumeTrack = () => {
    if (globalAudioState.audioRef && globalAudioState.audioRef.paused) {
      globalAudioState.audioRef.play()
      globalAudioState.isPlaying = true
      notifyListeners()
    }
  }

const stopPlayback = () => {
    if (globalAudioState.audioRef) {
      const audio = globalAudioState.audioRef
      const startVolume = audio.volume
      const fadeDuration = 400
      const fadeSteps = 20
      const fadeInterval = fadeDuration / fadeSteps
      const volumeStep = startVolume / fadeSteps
      let step = 0

      const fadeOut = setInterval(() => {
        step++
        audio.volume = Math.max(0, startVolume - (volumeStep * step))
        if (step >= fadeSteps) {
          clearInterval(fadeOut)
          audio.pause()
          audio.currentTime = 0
          audio.volume = startVolume
          globalAudioState.lastTrack = globalAudioState.currentTrack
          globalAudioState.currentTrack = null
          globalAudioState.isPlaying = false
          globalAudioState.currentTime = 0

          globalAudioState.stopTimeout = setTimeout(() => {
            globalAudioState.lastTrack = null
            notifyListeners()
          }, 5000)

          notifyListeners()
        }
      }, fadeInterval)
    }
  }

  const seekTo = (time: number) => {
    if (globalAudioState.audioRef) {
      globalAudioState.audioRef.currentTime = time
      globalAudioState.currentTime = time
      notifyListeners()
    }
  }

  const isTrackPlaying = (track: Track) => {
    const audioUrl = track.audioUrl || track.url
    return (
      globalAudioState.currentTrack !== null &&
      (globalAudioState.currentTrack.audioUrl || globalAudioState.currentTrack.url) === audioUrl &&
      globalAudioState.isPlaying
    )
  }

  const getCurrentTrack = () => {
    return globalAudioState.currentTrack || globalAudioState.lastTrack
  }

  const updateQueueTrackTitles = (updatedTracks: Track[]) => {
    globalAudioState.playHistory = updateTrackMetadata(globalAudioState.playHistory, updatedTracks)
    globalAudioState.currentAlbumTracks = updateTrackMetadata(globalAudioState.currentAlbumTracks, updatedTracks)
    
    if (globalAudioState.currentTrack) {
      const match = updatedTracks.find(t => matchTrackByUrl(globalAudioState.currentTrack!, t))
      if (match) {
        globalAudioState.currentTrack = { 
          ...globalAudioState.currentTrack, 
          title: match.title, 
          artist: match.artist 
        }
      }
    }
    
    if (globalAudioState.lastTrack) {
      const match = updatedTracks.find(t => matchTrackByUrl(globalAudioState.lastTrack!, t))
      if (match) {
        globalAudioState.lastTrack = { 
          ...globalAudioState.lastTrack, 
          title: match.title, 
          artist: match.artist 
        }
      }
    }
    
    notifyListeners()
  }

  const value: AudioContextType = {
    state,
    analyser,
    playTrack,
    playTracklist,
    pauseTrack,
    resumeTrack,
    stopPlayback,
    seekTo,
    isTrackPlaying,
    getCurrentTrack,
    updateQueueTrackTitles,
  }

  return <AudioContext.Provider value={value}>{children}</AudioContext.Provider>
}

export function useAudioPlayer() {
  const context = useContext(AudioContext)
  if (context === undefined) {
    throw new Error("useAudioPlayer must be used within an AudioPlayerProvider")
  }
  return context
}

export const getGlobalAudioState = () => globalAudioState