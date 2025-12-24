// src/modules/mixcloud/components/mixcloud-player/persistent-player.tsx
"use client"

import { useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"

interface PersistentState {
  wrapper: HTMLDivElement | null
  iframe: HTMLIFrameElement | null
  iframeContainer: HTMLDivElement | null
  imageLink: HTMLAnchorElement | null
  closeBtn: HTMLButtonElement | null
  widget: any
  currentFeed: string | null
  isPlaying: boolean
  isVisible: boolean
  wasManuallyHidden: boolean
  wasManuallyLoaded: boolean
  localUrl: string | null
  imageUrl: string | null
  activePage: string | null
  listeners: Set<() => void>
  pollInterval: ReturnType<typeof setInterval> | null
}

const state: PersistentState = {
  wrapper: null,
  iframe: null,
  iframeContainer: null,
  imageLink: null,
  closeBtn: null,
  widget: null,
  currentFeed: null,
  isPlaying: false,
  isVisible: false,
  wasManuallyHidden: false,
  wasManuallyLoaded: false,
  localUrl: null,
  imageUrl: null,
  activePage: null,
  listeners: new Set(),
  pollInterval: null,
}

function notify() {
  state.listeners.forEach((l) => l())
}

function extractFeed(url: string): string {
  try {
    const path = new URL(url).pathname
    return path.endsWith("/") ? path : path + "/"
  } catch {
    const p = url.startsWith("/") ? url : "/" + url
    return p.endsWith("/") ? p : p + "/"
  }
}

function pauseMixcloudForOtherAudio() {
  if (state.isPlaying && state.widget) {
    try {
      state.widget.pause()
    } catch {}
  }
  if (state.isVisible && state.currentFeed) {
    hidePlayer()
  }
}

function pauseOtherAudio() {
  document.querySelectorAll("audio").forEach((a) => !a.paused && a.pause())
  try {
    const getter = (window as any).__getGlobalAudioState
    if (getter) {
      const s = getter()
      if (s?.audioRef && !s.audioRef.paused) {
        s.audioRef.pause()
        s.isPlaying = false
        s.listeners?.forEach((l: () => void) => l())
      }
    }
  } catch {}
}

function updateButtonStates() {
  const closeBtn = state.closeBtn
  
  if (closeBtn) {
    if (state.isVisible) {
      closeBtn.innerHTML = "×"
      closeBtn.setAttribute("aria-label", "Close player")
      closeBtn.style.display = "flex"
    } else if (state.wasManuallyHidden && state.currentFeed) {
      closeBtn.innerHTML = "^"
      closeBtn.setAttribute("aria-label", "Show player")
      closeBtn.style.display = "flex"
    } else {
      closeBtn.style.display = "none"
    }
  }
}

function updateWrapperStyle() {
  if (!state.wrapper) return

  if (state.currentFeed && state.isVisible) {
    state.wrapper.style.transform = "translateY(0)"
  } else {
    state.wrapper.style.transform = "translateY(100%)"
  }
  
  updateButtonStates()
}

function updateImageLink() {
  if (!state.imageLink) return
  
  if (state.localUrl) {
    state.imageLink.href = state.localUrl
  }
  if (state.imageUrl) {
    state.imageLink.style.backgroundImage = `url(${state.imageUrl})`
    state.imageLink.textContent = ""
  } else {
    state.imageLink.style.backgroundImage = ""
    state.imageLink.textContent = "..."
  }
}

function showPlayer() {
  state.isVisible = true
  state.wasManuallyHidden = false
  updateWrapperStyle()
  notify()
}

function hidePlayer() {
  state.isVisible = false
  state.wasManuallyHidden = true
  
  if (state.widget) {
    try {
      state.widget.pause()
    } catch {}
  }
  
  updateWrapperStyle()
  notify()
}

function autoHidePlayer() {
  state.isVisible = false
  state.currentFeed = null
  
  if (state.widget) {
    try {
      state.widget.pause()
    } catch {}
  }
  
  updateWrapperStyle()
  updateButtonStates()
  notify()
}

function handleCloseButtonClick() {
  if (state.isVisible) {
    hidePlayer()
  } else if (state.wasManuallyHidden) {
    showPlayer()
  }
}

function createWrapper(): HTMLDivElement {
  if (state.wrapper) return state.wrapper

  const wrapper = document.createElement("div")
  wrapper.id = "mixcloud-persistent-wrapper"
  wrapper.style.cssText = `
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 60px;
    z-index: 9998;
    background: #1a1a1a;
    transform: translateY(100%);
    transition: transform 0.3s ease;
    box-shadow: none;
  `

  const buttonContainer = document.createElement("div")
  buttonContainer.style.cssText = `
    position: absolute;
    bottom: 100%;
    right: 0;
    display: flex;
    flex-direction: row;
  `

  const closeBtn = document.createElement("button")
  closeBtn.innerHTML = "×"
  closeBtn.setAttribute("aria-label", "Close player")
  closeBtn.style.cssText = `
    width: 32px;
    height: 24px;
    border-radius: 0;
    background-color: #1a1a1a;
    color: #fff;
    cursor: pointer;
    display: none;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    line-height: 1;
    z-index: 10000;
    border: none;
  `
  closeBtn.onclick = handleCloseButtonClick
  buttonContainer.appendChild(closeBtn)
  state.closeBtn = closeBtn

  wrapper.appendChild(buttonContainer)

  const iframeContainer = document.createElement("div")
  iframeContainer.style.cssText = `
    position: absolute;
    top: 0;
    left: 60px;
    right: 0;
    bottom: 0;
    overflow: hidden;
  `
  state.iframeContainer = iframeContainer

  const iframe = document.createElement("iframe")
  iframe.id = "mixcloud-persistent-iframe-v2"
  iframe.allow = "autoplay; encrypted-media"
  iframe.style.cssText = `
    display: block;
    border: 0;
    width: 100%;
    height: 100%;
  `

  iframeContainer.appendChild(iframe)
  wrapper.appendChild(iframeContainer)

  const imageLink = document.createElement("a")
  imageLink.id = "mixcloud-image-link"
  imageLink.style.cssText = `
    display: flex;
    align-items: center;
    justify-content: center;
    width: 60px;
    height: 60px;
    flex-shrink: 0;
    background-color: #1a1a1a;
    background-size: cover;
    background-position: center;
    font-size: 10px;
    color: #666;
    text-align: center;
    text-decoration: none;
    position: absolute;
    top: 0;
    left: 0;
    z-index: 10;
  `
  imageLink.textContent = "..."
  imageLink.addEventListener('click', (e) => {
    const href = imageLink.getAttribute('href')
    if (href && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
      e.preventDefault()
      window.dispatchEvent(new CustomEvent('mixcloud-navigate', { detail: { href } }))
    }
  })
  wrapper.appendChild(imageLink)
  state.imageLink = imageLink
  document.body.appendChild(wrapper)

  state.wrapper = wrapper
  state.iframe = iframe

  loadWidgetApi()
  setupNavigationHandler()
  
  return wrapper
}

function setupNavigationHandler() {
  if ((window as any).__mixcloudNavHandlerSetup) return
  ;(window as any).__mixcloudNavHandlerSetup = true
  
  window.addEventListener('mixcloud-navigate', ((e: CustomEvent<{ href: string }>) => {
    const router = (window as any).__mixcloudRouter
    if (router && typeof router.push === 'function') {
      router.push(e.detail.href)
    } else {
      window.history.pushState({}, '', e.detail.href)
      window.dispatchEvent(new PopStateEvent('popstate'))
    }
  }) as EventListener)
}

function loadWidgetApi() {
  if ((window as any).Mixcloud) return
  if (document.querySelector('script[src*="widgetApi.js"]')) return
  const s = document.createElement("script")
  s.src = "https://widget.mixcloud.com/media/js/widgetApi.js"
  document.head.appendChild(s)
}

function initWidgetEvents() {
  if (!state.iframe) return
  
  state.widget = null
  if (state.pollInterval) {
    clearInterval(state.pollInterval)
    state.pollInterval = null
  }
  
  const Mixcloud = (window as any).Mixcloud
  if (!Mixcloud) {
    setTimeout(initWidgetEvents, 200)
    return
  }

  const targetIframe = state.iframe
  const widget = Mixcloud.PlayerWidget(state.iframe)
  widget.ready.then(() => {
    if (state.iframe !== targetIframe) return
    state.widget = widget
    
    widget.events.play.on(() => {
      pauseOtherAudio()
      state.isPlaying = true
      state.wasManuallyLoaded = false
      notify()
    })
    widget.events.pause.on(() => {
      state.isPlaying = false
      notify()
    })
    widget.events.ended.on(() => {
      state.isPlaying = false
      notify()
    })
    
    let lastPlaying = false
    state.pollInterval = setInterval(async () => {
      if (!state.widget || state.widget !== widget) {
        if (state.pollInterval) clearInterval(state.pollInterval)
        return
      }
      try {
        const paused = await widget.getIsPaused()
        const playing = !paused
        if (playing !== lastPlaying) {
          lastPlaying = playing
          if (playing) {
            pauseOtherAudio()
            state.isPlaying = true
            state.wasManuallyLoaded = false
          } else {
            state.isPlaying = false
          }
          notify()
        }
      } catch {}
    }, 500)
  })
}

function doLoadMix(
  mixcloudUrl: string,
  options?: { localUrl?: string; imageUrl?: string; manual?: boolean }
) {
  const feed = extractFeed(mixcloudUrl)

  createWrapper()

  if (options?.localUrl) state.localUrl = options.localUrl
  if (options?.imageUrl) state.imageUrl = options.imageUrl
  updateImageLink()

  if (state.currentFeed === feed) {
    showPlayer()
    return
  }

  state.currentFeed = feed
  state.widget = null
  state.isPlaying = false
  state.wasManuallyLoaded = options?.manual || false

  if (state.iframe) {
    const params = new URLSearchParams({
      feed,
      hide_cover: "1",
      mini: "1",
      hide_artwork: "1",
      light: "0",
    })
    state.iframe.src = `https://www.mixcloud.com/widget/iframe/?${params}`
    state.iframe.onload = () => initWidgetEvents()
  }

  showPlayer()
  notify()
}

export function loadPersistentMix(
  mixcloudUrl: string,
  options?: { localUrl?: string; imageUrl?: string }
) {
  doLoadMix(mixcloudUrl, { ...options, manual: true })
}

function autoLoadMix(
  mixcloudUrl: string,
  options?: { localUrl?: string; imageUrl?: string }
) {
  doLoadMix(mixcloudUrl, { ...options, manual: false })
}

export function setActivePage(mixcloudUrl: string | null) {
  state.activePage = mixcloudUrl
  updateWrapperStyle()
}

export function getState() {
  return {
    isPlaying: state.isPlaying,
    currentFeed: state.currentFeed,
    wasManuallyLoaded: state.wasManuallyLoaded,
    isVisible: state.isVisible,
  }
}

export function usePersistentPlayerState() {
  const [isPlaying, setIsPlaying] = useState(state.isPlaying)
  const [currentFeed, setCurrentFeed] = useState(state.currentFeed)
  const [isVisible, setIsVisible] = useState(state.isVisible)

  useEffect(() => {
    const update = () => {
      setIsPlaying(state.isPlaying)
      setCurrentFeed(state.currentFeed)
      setIsVisible(state.isVisible)
    }
    state.listeners.add(update)
    update()
    return () => { state.listeners.delete(update) }
  }, [])

  return { isPlaying, currentFeed, isVisible, hasPlayer: !!state.currentFeed }
}

export function PersistentPlayerManager() {
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    createWrapper()
    ;(window as any).__mixcloudRouter = router
    
    return () => {
      ;(window as any).__mixcloudRouter = null
    }
  }, [router])

  useEffect(() => {
    if (!pathname.startsWith("/mixtape/")) {
      state.activePage = null
      updateWrapperStyle()
    }
  }, [pathname])

  return null
}

export function InlinePlayerSlot({
  mixcloudUrl,
  localUrl,
  imageUrl,
  className = "",
}: {
  mixcloudUrl: string
  localUrl?: string
  imageUrl?: string
  className?: string
}) {
  const { currentFeed, isPlaying, isVisible } = usePersistentPlayerState()
  
  const thisFeed = extractFeed(mixcloudUrl)
  const isThisMix = currentFeed === thisFeed

  useEffect(() => {
    setActivePage(mixcloudUrl)
    
    const current = getState()
    const alreadyThisMix = current.currentFeed === thisFeed
    
    if (!alreadyThisMix && !current.isPlaying) {
      autoLoadMix(mixcloudUrl, { localUrl, imageUrl })
    } else if (alreadyThisMix && !current.isVisible) {
      showPlayer()
    } else if (!current.currentFeed) {
      autoLoadMix(mixcloudUrl, { localUrl, imageUrl })
    }
    
    return () => {
      setActivePage(null)
      const s = getState()
      if (!s.wasManuallyLoaded && !s.isPlaying) {
        ;(window as any).__autoHidePersistentPlayer?.()
      }
    }
  }, [mixcloudUrl, localUrl, imageUrl, thisFeed])

  const handleLoad = () => {
    loadPersistentMix(mixcloudUrl, { localUrl, imageUrl })
  }

  if (isThisMix && isVisible) {
    return <div className={className} style={{ minHeight: "2rem" }} />
  }
  return (
    <button
      onClick={handleLoad}
      className="outline yellow inline-flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
      style={{ minHeight: "2rem" }}
      aria-label="Load Mixtape"
    >
      <span>♪</span>
      <span>Load Mixtape</span>
      <span>♪</span>
    </button>
  )
}

function getLabel(isPlaying: boolean, hasPlayed: boolean): string {
  if (isPlaying) return "Pause Mixtape"
  if (hasPlayed) return "Play Mixtape"
  return "Load Mixtape"
}

export function MixcloudInlinePlayer({ 
  mixcloudUrl,
  localUrl,
  imageUrl 
}: { 
  mixcloudUrl: string
  localUrl?: string
  imageUrl?: string
}) {
  const { currentFeed, isPlaying, isVisible } = usePersistentPlayerState()
  
  const thisFeed = extractFeed(mixcloudUrl)
  const isThisMix = currentFeed === thisFeed
  const hasPlayed = isThisMix && isVisible

  const handleClick = () => {
    if (isThisMix && isPlaying) {
      if (state.widget) {
        try { state.widget.pause() } catch {}
      }
    } else if (isThisMix && hasPlayed) {
      pauseOtherAudio()
      showPlayer()
      if (state.widget) {
        try { state.widget.play() } catch {}
      }
    } else {
      pauseOtherAudio()
      loadPersistentMix(mixcloudUrl, { localUrl, imageUrl })
    }
  }

  const label = getLabel(isThisMix && isPlaying, hasPlayed)

  return (
    <button
      onClick={handleClick}
      className="outline yellow inline-flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
      aria-label={label}
    >
      <span>♪</span>
      <span>{label}</span>
      <span>♪</span>
    </button>
  )
}

if (typeof window !== "undefined") {
  ;(window as any).__loadPersistentMix = loadPersistentMix
  ;(window as any).__autoLoadPersistentMix = autoLoadMix
  ;(window as any).__hidePersistentPlayer = hidePlayer
  ;(window as any).__showPersistentPlayer = showPlayer
  ;(window as any).__getPersistentState = getState
  ;(window as any).__autoHidePersistentPlayer = autoHidePlayer
  ;(window as any).__pauseMixcloudForOtherAudio = pauseMixcloudForOtherAudio
}