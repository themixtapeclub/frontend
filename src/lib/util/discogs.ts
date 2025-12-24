// frontend/src/lib/util/discogs.ts

type Track = {
  number?: string
  title: string
  artist?: string
  duration?: string
  url?: string
}

type DiscogsTrack = {
  title: string
  duration?: string
  position?: string
  type_?: string
  artists?: Array<{ name: string }>
}

type DiscogsRelease = {
  id: number
  title: string
  year?: number
  country?: string
  estimated_weight?: number
  tracklist?: DiscogsTrack[]
  artists?: Array<{ name: string }>
  labels?: Array<{ name: string; catno?: string }>
  formats?: Array<{ name: string }>
  genres?: string[]
  styles?: string[]
  images?: Array<{ type: string; uri: string; uri150?: string }>
}

/**
 * Clean Discogs artist name by removing disambiguation numbers like (3), (13), etc.
 * Discogs uses these to differentiate artists with the same name in their database
 */
function cleanDiscogsArtistName(name: string): string {
  if (!name) return ''
  // Remove trailing disambiguation numbers like " (3)" or " (13)"
  // Pattern: space followed by parentheses containing only digits
  return name.replace(/\s*\(\d+\)\s*$/, '').trim()
}

/**
 * Check if tracklist needs Discogs enrichment
 */
export function needsTracklistEnrichment(tracklist: Track[] | null | undefined): boolean {
  if (!tracklist || tracklist.length === 0) {
    return true
  }

  const defaultTitlePatterns = [
    /^track\s*\d+$/i,
    /^untitled$/i,
    /^untitled\s*\d*$/i,
    /^unknown$/i,
    /^-$/,
    /^\s*$/,
  ]

  return tracklist.some(track => {
    if (!track.title) return true
    const title = track.title.trim()
    if (!title) return true
    return defaultTitlePatterns.some(pattern => pattern.test(title))
  })
}

/**
 * Fetch release data from Discogs API via backend proxy
 */
export async function fetchDiscogsRelease(discogsReleaseId: string): Promise<DiscogsRelease | null> {
  try {
    const response = await fetch(`/api/discogs/release/${discogsReleaseId}`)
    
    if (!response.ok) {
      return null
    }

    const data = await response.json()
    return data.release || null
  } catch (error) {
    return null
  }
}

/**
 * Helper to extract artist name as string (cleaned of Discogs disambiguation)
 */
function getArtistString(artist: any): string {
  if (!artist) return ''
  if (typeof artist === 'string') return cleanDiscogsArtistName(artist)
  if (Array.isArray(artist)) {
    const firstArtist = artist[0]?.name || artist[0] || ''
    return cleanDiscogsArtistName(firstArtist)
  }
  if (typeof artist === 'object' && artist.name) {
    return cleanDiscogsArtistName(artist.name)
  }
  return cleanDiscogsArtistName(String(artist))
}

/**
 * Merge Discogs tracklist with existing tracklist
 */
export function mergeTracklists(
  existing: Track[],
  discogs: DiscogsTrack[],
  mainArtist?: any
): Track[] {
  if (!discogs || discogs.length === 0) {
    return existing
  }

  // Normalize mainArtist to string (cleaned)
  const mainArtistStr = getArtistString(mainArtist)

  const actualTracks = discogs.filter(t => t.type_ !== 'heading')

  if (!existing || existing.length === 0) {
    return actualTracks.map(dt => ({
      number: dt.position || '',
      title: dt.title || '',
      artist: getTrackArtist(dt, mainArtistStr),
      duration: dt.duration || '',
      url: '',
    }))
  }

  const merged: Track[] = []
  const maxLength = Math.max(existing.length, actualTracks.length)

  for (let i = 0; i < maxLength; i++) {
    const existingTrack = existing[i]
    const discogsTrack = actualTracks[i]

    if (existingTrack && discogsTrack) {
      merged.push({
        number: existingTrack.number || discogsTrack.position || '',
        title: isDefaultTitle(existingTrack.title) ? discogsTrack.title : existingTrack.title,
        artist: existingTrack.artist || getTrackArtist(discogsTrack, mainArtistStr),
        duration: existingTrack.duration || discogsTrack.duration || '',
        url: existingTrack.url || '',
      })
    } else if (existingTrack) {
      merged.push(existingTrack)
    } else if (discogsTrack) {
      merged.push({
        number: discogsTrack.position || '',
        title: discogsTrack.title || '',
        artist: getTrackArtist(discogsTrack, mainArtistStr),
        duration: discogsTrack.duration || '',
        url: '',
      })
    }
  }

  return merged
}

function isDefaultTitle(title: string | undefined): boolean {
  if (!title) return true
  const trimmed = title.trim()
  if (!trimmed) return true
  
  const defaultPatterns = [
    /^track\s*\d+$/i,
    /^untitled$/i,
    /^untitled\s*\d*$/i,
    /^unknown$/i,
    /^-$/,
  ]
  
  return defaultPatterns.some(p => p.test(trimmed))
}

function getTrackArtist(discogsTrack: DiscogsTrack, mainArtist?: string): string {
  if (!discogsTrack.artists || discogsTrack.artists.length === 0) {
    return ''
  }
  
  // Clean the artist name from Discogs disambiguation numbers
  const rawTrackArtist = discogsTrack.artists[0]?.name || ''
  const trackArtist = cleanDiscogsArtistName(rawTrackArtist)
  
  // Compare as strings, safely
  if (mainArtist && trackArtist && 
      typeof mainArtist === 'string' && typeof trackArtist === 'string' &&
      trackArtist.toLowerCase() === mainArtist.toLowerCase()) {
    return ''
  }
  
  return trackArtist
}

/**
 * Update product tracklist in Medusa/Neon database
 */
export async function updateProductTracklist(
  productId: string,
  tracklist: Track[]
): Promise<boolean> {
  try {
    const response = await fetch(`/api/product/${productId}/tracklist`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ tracklist }),
    })

    if (!response.ok) {
      return false
    }

    return true
  } catch (error) {
    return false
  }
}

/**
 * Fetch the current tracklist from database (bypasses Next.js cache)
 */
export async function fetchCurrentTracklist(productId: string): Promise<Track[] | null> {
  try {
    const response = await fetch(`/api/product/${productId}/tracklist`, {
      cache: 'no-store'
    })
    
    if (!response.ok) {
      return null
    }
    
    const data = await response.json()
    return data.tracklist || null
  } catch (error) {
    return null
  }
}

/**
 * Main function to enrich tracklist from Discogs and persist to database
 */
export async function enrichTracklistFromDiscogs(
  productId: string,
  discogsReleaseId: string,
  currentTracklist: Track[] | null | undefined,
  mainArtist?: any
): Promise<Track[] | null> {
  if (!needsTracklistEnrichment(currentTracklist)) {
    return null
  }

  if (!discogsReleaseId) {
    return null
  }

  const release = await fetchDiscogsRelease(discogsReleaseId)
  if (!release || !release.tracklist) {
    return null
  }

  // Use release artist if mainArtist not provided (and clean it)
  const artistToUse = mainArtist || release.artists?.[0]?.name

  const enrichedTracklist = mergeTracklists(
    currentTracklist || [],
    release.tracklist,
    artistToUse
  )

  await updateProductTracklist(productId, enrichedTracklist)

  return enrichedTracklist
}