// src/modules/home/components/dynamic-sections/featured-mixtape-section.tsx
import Link from "next/link"
import { MixcloudInlinePlayer } from "@modules/mixcloud/components/mixcloud-player/persistent-player"
import NoiseOverlay from "@modules/common/components/noise-overlay"

interface Track {
  id: string
  track_number: number
  title: string
  artist?: string
  product?: {
    id: string
    title: string
    thumbnail?: string
    artist?: string[]
    handle: string
  } | null
}

interface Mixtape {
  id: string
  title: string
  slug?: string
  image_url?: string
  description?: string
  contributors?: any
  mixcloud_url?: string
  tracks?: Track[]
  all_tracks_have_products?: boolean
}

interface FeaturedMixtapeSectionProps {
  section: {
    title?: string
    mixtape?: Mixtape
  }
}

function getFilteredContributors(contributors: any[]): any[] {
  if (!Array.isArray(contributors)) return []
  return contributors.filter((c: any) => {
    const lower = (c.name || "").toLowerCase()
    return lower !== "the mixtape shop" && lower !== "the mixtape club"
  })
}

export default function FeaturedMixtapeSection({ section }: FeaturedMixtapeSectionProps) {
  const mixtape = section.mixtape

  if (!mixtape) return null

  const hasAllProducts = mixtape.all_tracks_have_products && (mixtape.tracks?.length || 0) >= 10

  if (hasAllProducts) {
    return <MixtapeProductGrid mixtape={mixtape} />
  }

  return <MixtapeHero mixtape={mixtape} />
}

function MixtapeProductGrid({ mixtape }: { mixtape: Mixtape }) {
  const tracks = (mixtape.tracks || []).slice(0, 10)

  return (
    <section className="relative w-full overflow-hidden bg-black flex-1 flex flex-col">
      {mixtape.image_url && (
        <div className="absolute inset-0 z-0 overflow-hidden">
          <img
            src={mixtape.image_url}
            alt=""
            className="absolute w-full h-full object-cover"
            style={{
              filter: "blur(20px)",
              transform: "scale(1.1)",
              opacity: 0.4,
            }}
          />
           <div className="absolute inset-0 bg-black/40" />
          <NoiseOverlay />
        </div>
      )}
      <div className="relative z-10 py-12 px-4 flex-1 flex flex-col justify-center">
        <div className="max-w-4xl mx-auto w-full">
          <div className="grid grid-cols-5 gap-4 md:gap-8">
            {tracks.map((track) => (
              <Link
                key={track.id}
                href={`/product/${track.product?.handle}`}
                className="group relative aspect-square bg-gray-900 overflow-hidden"
              >
                {track.product?.thumbnail ? (
                  <img
                    src={track.product.thumbnail}
                    alt={track.product.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white/50">
                    {track.track_number}
                  </div>
                )}

                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2 md:p-3">
                  <span className="text-white line-clamp-2">
                    {track.product?.title || track.title}
                  </span>
                  <span className="text-white/70 line-clamp-1">
                    {track.artist || track.product?.artist?.join(", ")}
                  </span>
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link
              href={`/mixtape/${mixtape.slug}`}
              className="inline-block"
            >
              <h1 className="page-title"><span className="outline yellow">{mixtape.title}</span></h1>
            </Link>

            {mixtape.mixcloud_url && (
              <div className="mt-4">
                <MixcloudInlinePlayer
                  mixcloudUrl={mixtape.mixcloud_url}
                  localUrl={`/mixtape/${mixtape.slug}`}
                  imageUrl={mixtape.image_url}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

function MixtapeHero({ mixtape }: { mixtape: Mixtape }) {
  const contributors = getFilteredContributors(mixtape.contributors || [])
  const tracks = mixtape.tracks || []
  const contributorNames = contributors.map((c: any) => (c.name || "").toLowerCase())
  
  const artistsWithLinks: { name: string; href?: string }[] = []
  const seenArtists = new Set<string>()
  
  const isContributor = (artistName: string) => {
    const lower = artistName.toLowerCase()
    return contributorNames.some(contrib => lower.includes(contrib))
  }
  
  for (const track of tracks) {
    if (!track) continue
    if (track.artist && !seenArtists.has(track.artist)) {
      seenArtists.add(track.artist)
      if (!isContributor(track.artist)) {
        artistsWithLinks.push({
          name: track.artist,
          href: track.product?.handle ? `/product/${track.product.handle}` : undefined
        })
      }
    }
  }

  return (
    <section className="relative py-20 px-4 overflow-hidden flex-1 flex flex-col justify-center bg-black">
      {mixtape.image_url && (
        <div className="absolute inset-0 z-0 overflow-hidden">
          <img
            src={mixtape.image_url}
            alt=""
            className="absolute w-full h-full object-cover"
            style={{
              filter: "blur(20px)",
              transform: "scale(1.1)",
              opacity: 0.4,
            }}
          />
           <div className="absolute inset-0 bg-black/40" />
          <div 
            className="absolute inset-0 opacity-[0.12] pointer-events-none"
            style={{
              backgroundImage: "url('https://storage.googleapis.com/themixtapeshop/2022/12/noise.jpg')",
              backgroundRepeat: "repeat",
            }}
          />
        </div>
      )}
      <div className="relative z-10 max-w-2xl mx-auto text-center">
        <Link href={`/mixtape/${mixtape.slug}`} className="group inline-block">
          {mixtape.image_url && (
            <div className="relative w-64 md:w-80 mx-auto mb-6">
              <img
                src={mixtape.image_url}
                alt={mixtape.title}
                className="w-full aspect-square object-cover shadow-2xl"
              />
            </div>
          )}

          <h1 className="page-title"><span className="outline yellow">{mixtape.title}</span></h1>
        </Link>

        {mixtape.mixcloud_url && (
          <div className="mt-4 mb-4">
            <MixcloudInlinePlayer
              mixcloudUrl={mixtape.mixcloud_url}
              localUrl={`/mixtape/${mixtape.slug}`}
              imageUrl={mixtape.image_url}
            />
          </div>
        )}

        {(contributors.length > 0 || artistsWithLinks.length > 0) && (
          <p className="text-white/70">
            {contributors.length > 0 && (
              <>
                by{" "}
                {contributors.map((c: any, i: number) => (
                  <span key={c.id || i}>
                    {c.slug ? (
                      <Link href={`/contributor/${c.slug}`} className="hover:underline">
                        {c.name}
                      </Link>
                    ) : (
                      c.name
                    )}
                    {i < contributors.length - 1 && ", "}
                  </span>
                ))}
              </>
            )}
            {contributors.length > 0 && artistsWithLinks.length > 0 && " featuring music by "}
            {contributors.length === 0 && artistsWithLinks.length > 0 && "music by "}
            {artistsWithLinks.map((artist, i) => (
              <span key={artist.name}>
                {artist.href ? (
                  <Link href={artist.href} className="hover:underline">
                    {artist.name}
                  </Link>
                ) : (
                  artist.name
                )}
                {i < artistsWithLinks.length - 1 && ", "}
              </span>
            ))}
          </p>
        )}
      </div>
    </section>
  )
}