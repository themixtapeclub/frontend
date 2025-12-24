// src/modules/products/components/in-mixtapes/index.tsx
import Image from "next/image"
import Link from "next/link"

interface MixtapeReference {
  id: string
  title: string
  slug: string
  image?: string
  trackTitle?: string
  trackArtist?: string
  contributor?: string
}

interface InMixtapesProps {
  inMixtapes: MixtapeReference[]
}

const HIDDEN_CONTRIBUTORS = ["the mixtape shop", "the mixtape club"]
const EXCLUDED_CONTRIBUTORS = ["butter"]

function shouldShowContributor(name?: string): boolean {
  if (!name) return false
  return !HIDDEN_CONTRIBUTORS.includes(name.toLowerCase().trim())
}

function isExcludedContributor(name?: string): boolean {
  if (!name) return false
  return EXCLUDED_CONTRIBUTORS.includes(name.toLowerCase().trim())
}

async function getMixtapeImages(slugs: string[]): Promise<Record<string, { image: string; contributor?: string }>> {
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:9000"
  const data: Record<string, { image: string; contributor?: string }> = {}
  
  try {
    await Promise.all(
      slugs.map(async (slug) => {
        try {
          const res = await fetch(BACKEND_URL + "/mixtapes/" + slug, {
            next: { revalidate: 3600 }
          })
          if (res.ok) {
            const json = await res.json()
            if (json.mixtape?.featured_image_url) {
              data[slug] = {
                image: json.mixtape.featured_image_url,
                contributor: json.mixtape.contributors?.[0]?.name
              }
            }
          }
        } catch {}
      })
    )
  } catch {}
  
  return data
}

export default async function InMixtapes({ inMixtapes }: InMixtapesProps) {
  if (!inMixtapes || inMixtapes.length === 0) {
    return null
  }

  const mixtapeMap = new Map<string, {
    id: string
    title: string
    slug: string
    image?: string
    contributor?: string
    tracks: Array<{ title?: string; artist?: string }>
  }>()

  inMixtapes.forEach((ref) => {
    const key = ref.slug
    
    if (mixtapeMap.has(key)) {
      const existing = mixtapeMap.get(key)!
      if (ref.trackTitle) {
        const trackExists = existing.tracks.some(t => t.title === ref.trackTitle)
        if (!trackExists) {
          existing.tracks.push({
            title: ref.trackTitle,
            artist: ref.trackArtist
          })
        }
      }
    } else {
      mixtapeMap.set(key, {
        id: ref.id,
        title: ref.title,
        slug: ref.slug,
        image: ref.image,
        contributor: ref.contributor,
        tracks: ref.trackTitle ? [{ title: ref.trackTitle, artist: ref.trackArtist }] : []
      })
    }
  })

  const uniqueMixtapes = Array.from(mixtapeMap.values())
  
  const slugs = uniqueMixtapes.map(m => m.slug)
  const mixtapeData = await getMixtapeImages(slugs)
  
  uniqueMixtapes.forEach(m => {
    if (mixtapeData[m.slug]) {
      m.image = mixtapeData[m.slug].image
      if (mixtapeData[m.slug].contributor) {
        m.contributor = mixtapeData[m.slug].contributor
      }
    }
  })

  const filteredMixtapes = uniqueMixtapes
    .filter(m => !isExcludedContributor(m.contributor))
    .slice(0, 4)

  if (filteredMixtapes.length === 0) {
    return null
  }

  return (
    <div className="in-mixtapes border-t border-black mb-10">
      <div className="px-4 pt-4 pb-4">
        <p className="text-base mb-3">In Mixtapes</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {filteredMixtapes.map((mixtape) => (
            <Link 
              key={mixtape.slug}
              href={"/mixtape/" + mixtape.slug}
              className="block hover:opacity-80 transition-opacity large:max-w-[240px]"
            >
              {mixtape.image && (
                <div className="relative aspect-square bg-black mb-2">
                  <Image
                    src={mixtape.image}
                    alt={mixtape.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                  />
                </div>
              )}
              
              <div className="">
                {shouldShowContributor(mixtape.contributor) && (
                  <span className="text-small mono block leading-tight">{mixtape.contributor}</span>
                )}
                <span className="font-semibold text-small mono block leading-tight">{mixtape.title}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}