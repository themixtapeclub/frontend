// src/app/(main)/mixes/[tag]/page.tsx
import { Metadata } from "next"
import { getMixtapes } from "@lib/data/mixtapes"
import MixtapeCard from "@modules/mixtapes/components/mixtape-card"
import { Pagination } from "@modules/store/components/pagination"
import Link from "next/link"
import { getBaseURL } from "@lib/util/env"

const FEATURED_MIN_COUNT = 6
const FEATURED_COUNT = 6
const REGULAR_PER_PAGE = 20

interface Props {
  params: Promise<{ tag: string }>
  searchParams: Promise<{ page?: string }>
}

function slugToDisplayName(slug: string): string {
  return slug
    .split("-")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

const TAG_DESCRIPTIONS: Record<string, string> = {
  "groovy": "Listen to groovy mixtapes from music lovers around the world.",
  "chill": "Listen to chill mixtapes from music lovers around the world.",
  "global": "Listen to global mixtapes from music lovers around the world.",
  "healing": "Listen to healing mixtapes from music lovers around the world.",
  "dance": "Listen to dance mixtapes from music lovers around the world.",
  "nostalgia": "Listen to nostalgia mixtapes from music lovers around the world.",
  "record-club": "Listen to record-club mixtapes from music lovers around the world.",
  "favorites": "Listen to favorites mixtapes from music lovers around the world.",
  "disco": "Listen to disco mixtapes from music lovers around the world.",
  "jazz": "Listen to jazz mixtapes from music lovers around the world.",
  "house": "Listen to house mixtapes from music lovers around the world.",
  "ambient": "Listen to ambient mixtapes from music lovers around the world.",
  "soul": "Listen to soul mixtapes from music lovers around the world.",
  "downtempo": "Listen to downtempo mixtapes from music lovers around the world.",
  "funk": "Listen to funk mixtapes from music lovers around the world.",
  "boogie": "Listen to boogie mixtapes from music lovers around the world.",
  "world": "Listen to world music mixtapes from music lovers around the world.",
  "rare-groove": "Listen to rare groove mixtapes from music lovers around the world.",
  "folk": "Listen to folk mixtapes from music lovers around the world.",
}

export async function generateStaticParams() {
  return [
    { tag: 'groovy' },
    { tag: 'chill' },
    { tag: 'global' },
    { tag: 'healing' },
    { tag: 'dance' },
    { tag: 'nostalgia' },
    { tag: 'record-club' },
    { tag: 'favorites' },
    { tag: 'disco' },
    { tag: 'jazz' },
    { tag: 'house' },
    { tag: 'ambient' },
    { tag: 'soul' },
    { tag: 'downtempo' },
    { tag: 'funk' },
    { tag: 'boogie' },
    { tag: 'world' },
    { tag: 'rare-groove' },
    { tag: 'folk' },
  ]
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tag } = await params
  const displayName = slugToDisplayName(tag)
  const description = TAG_DESCRIPTIONS[tag]
    || `Discover ${displayName.toLowerCase()} mixtapes. Curated music collections at The Mixtape Club.`
  const url = `${getBaseURL()}/mixes/${tag}`

  return {
    title: `${displayName} mixes by The Mixtape Club`,
    description: description,
    openGraph: {
      title: `${displayName} Mixes | The Mixtape Club`,
      description: description,
      url: url,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${displayName} Mixes | The Mixtape Club`,
      description: description,
    },
    alternates: {
      canonical: url,
    },
  }
}

export default async function MixesTagPage({ params, searchParams }: Props) {
  const { tag } = await params
  const { page: pageParam } = await searchParams
  const displayName = slugToDisplayName(tag)
  const page = pageParam ? parseInt(pageParam) : 1

  const isFavorites = tag === "favorites"

  if (isFavorites) {
    const { mixtapes } = await getMixtapes({ featured: true, page: 1, limit: 200 })
    
    return (
      <section className="w-full" aria-labelledby="mixes-heading">
        <h1 id="mixes-heading" className="sr-only">{displayName} Mixtapes</h1>
        <div className="flex flex-wrap justify-center" role="list" aria-label="Favorite mixtapes">
          {mixtapes.map((mixtape, index) => (
            <div key={mixtape.id} className="w-1/2 md:w-1/3" role="listitem">
              <MixtapeCard mixtape={mixtape} featured={true} index={index} />
            </div>
          ))}
        </div>
      </section>
    )
  }

  const { mixtapes } = await getMixtapes({ tag: displayName, page: 1, limit: 200 })

  if (mixtapes.length === 0) {
    return (
      <section className="py-12 px-4" aria-labelledby="mixes-heading">
        <h1 id="mixes-heading" className="text-2xl font-semibold mb-4">{displayName} Mixes</h1>
        <p className="mb-4">No {displayName.toLowerCase()} mixtapes found.</p>
        <Link href="/mixes" className="text-blue-600 hover:underline focus:outline-none focus:ring-2 focus:ring-teal-400">
          Browse all mixes
        </Link>
      </section>
    )
  }

  const isFirstPage = page === 1
  const allFeatured = mixtapes.filter((m) => m.featured)
  const allNonFeatured = mixtapes.filter((m) => !m.featured)
  const hasFeaturedSection = allFeatured.length >= FEATURED_MIN_COUNT

  const featuredForDisplay = (isFirstPage && hasFeaturedSection) ? allFeatured.slice(0, FEATURED_COUNT) : []
  const regularMixtapes = hasFeaturedSection
    ? [...allFeatured.slice(FEATURED_COUNT), ...allNonFeatured]
    : mixtapes

  const totalRegular = regularMixtapes.length
  const totalPages = Math.max(1, Math.ceil(totalRegular / REGULAR_PER_PAGE))

  const startIndex = (page - 1) * REGULAR_PER_PAGE
  const paginatedRegular = regularMixtapes.slice(startIndex, startIndex + REGULAR_PER_PAGE)

  return (
    <section className="w-full" aria-labelledby="mixes-heading">
      <h1 id="mixes-heading" className="sr-only">{displayName} Mixtapes</h1>

      <div className="flex flex-wrap justify-center" role="list" aria-label="Mixtapes">
        {featuredForDisplay.map((mixtape, index) => (
          <div key={mixtape.id} className="w-1/2 md:w-1/3" role="listitem">
            <MixtapeCard mixtape={mixtape} featured={true} index={index} />
          </div>
        ))}

        {paginatedRegular.map((mixtape, index) => (
          <div key={mixtape.id} className="w-1/2 sm:w-1/3 lg:w-1/4" role="listitem">
            <MixtapeCard mixtape={mixtape} featured={false} index={featuredForDisplay.length > 0 ? index + featuredForDisplay.length : index} />
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <nav aria-label="Mixtape pagination">
          <Pagination page={page} totalPages={totalPages} />
        </nav>
      )}
    </section>
  )
}
