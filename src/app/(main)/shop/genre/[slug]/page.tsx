// src/app/(main)/shop/genre/[slug]/page.tsx
import { Metadata } from "next"
import FilterPage from "@modules/store/templates/filter-page"
import { DEFAULT_COUNTRY_CODE } from "@lib/data/region-cookie"
import { getFilteredProducts } from "@lib/data/filter"
import { getBaseURL } from "@lib/util/env"

type Props = {
  params: Promise<{ slug: string }>
  searchParams: Promise<{
    sortBy?: string
    page?: string
  }>
}

export const dynamic = "force-static"
export const dynamicParams = false
export const revalidate = 300

const GENRE_DESCRIPTIONS: Record<string, string> = {
  "disco": "New, original and reissue Disco vinyl records and cassettes. Boogie, Nu-Disco, Italo, Edits and more.",
  "house": "New, original and reissue House vinyl records and cassettes. Deep House, Garage, Acid, Tech House, Italo House and more.",
  "jazz": "New, original and reissue Jazz vinyl records and cassettes. Fusion, Jazz-Funk, Soul-Jazz, Hard Bop, Post Bop, Modal, Free Jazz, Spiritual Jazz and more.",
  "soul": "New, original and reissue Soul vinyl records and cassettes. Rare Groove, Neo Soul, Modern Soul, Northern Soul, Sweet Soul, Street Soul and more.",
  "ambient": "New, original and reissue Ambient vinyl records and cassettes. New Age, Drone, Field Recording, Electronic and more.",
  "brazil": "New, original and reissue Brazilian vinyl records and cassettes. MPB, Samba, Bossa Nova, Forro, Choro and more.",
  "africa": "New, original and reissue African vinyl records and cassettes. Afrobeat, Highlife, Soukous, Cape Jazz, Kwaito and more.",
  "asia": "New, original and reissue Asian vinyl records and cassettes. Japan, City Pop, Jazz Kissa, India, China and more.",
  "latin": "New, original and reissue Latin vinyl records and cassettes. Salsa, Cumbia, Latin Jazz, Afro-Cuban, Boogaloo and more.",
  "reggae": "New, original and reissue Reggae vinyl records and cassettes. Dub, Lovers Rock, Dancehall, Calypso, Soca and more.",
  "world": "New, original and reissue World vinyl records and cassettes. Folk, Zouk, Compas, Gwo Ka, Steel Band and more.",
  "gospel": "New, original and reissue Gospel vinyl records and cassettes. Spiritual music, choir recordings and more.",
  "electronic": "New, original and reissue Electronic vinyl records and cassettes. Electro, Synth, IDM, New Wave, Experimental and more.",
  "techno": "New, original and reissue Techno vinyl records and cassettes. Minimal, Acid, Deep Techno, Dub Techno, Tech House and more.",
  "experimental": "New, original and reissue Experimental vinyl records and cassettes. Avant-Garde, Noise, Abstract, Leftfield and more.",
  "library": "New, original and reissue Library vinyl records and cassettes. Soundtrack, Easy Listening, Space-Age and more.",
  "downtempo": "New, original and reissue Downtempo vinyl records and cassettes. Balearic, Trip-Hop, Beats, Lo-Fi and more.",
  "edits": "New, original and reissue Edits vinyl records and cassettes. Disco reworks, DJ Tools, Mash-ups and more.",
  "hip-hop": "New, original and reissue Hip-Hop vinyl records and cassettes. Beats, Breaks, Hip-House, Grime and more.",
  "rock": "New, original and reissue Rock vinyl records and cassettes. Psychedelic, Prog, Krautrock, Indie, Punk, New Wave and more.",
}

export async function generateStaticParams() {
  return [
    { slug: 'disco' },
    { slug: 'house' },
    { slug: 'jazz' },
    { slug: 'soul' },
    { slug: 'ambient' },
    { slug: 'brazil' },
    { slug: 'africa' },
    { slug: 'asia' },
    { slug: 'latin' },
    { slug: 'reggae' },
    { slug: 'world' },
    { slug: 'gospel' },
    { slug: 'electronic' },
    { slug: 'techno' },
    { slug: 'experimental' },
    { slug: 'library' },
    { slug: 'downtempo' },
    { slug: 'edits' },
    { slug: 'hip-hop' },
    { slug: 'rock' },
  ]
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params
  const { filter } = await getFilteredProducts({
    type: "genre",
    value: params.slug,
    page: 1,
    limit: 1
  })

  const description = GENRE_DESCRIPTIONS[params.slug]
    || `Shop ${filter.display_name} vinyl records, CDs, cassettes and more at The Mixtape Club.`

  const url = `${getBaseURL()}/shop/genre/${params.slug}`

  return {
    title: `${filter.display_name}, Vinyl Records, CDs and Cassettes`,
    description: description,
    openGraph: {
      title: `${filter.display_name}, Vinyl Records, CDs and Cassettes | The Mixtape Club`,
      description: description,
      url: url,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${filter.display_name}, Vinyl Records, CDs and Cassettes | The Mixtape Club`,
      description: description,
    },
    alternates: {
      canonical: url,
    },
  }
}

export default async function GenrePage(props: Props) {
  const params = await props.params
  const searchParams = await props.searchParams
  const page = searchParams.page ? parseInt(searchParams.page) : 1

  const { filter } = await getFilteredProducts({
    type: "genre",
    value: params.slug,
    page: 1,
    limit: 1
  })

  return (
    <FilterPage
      type="genre"
      slug={params.slug}
      displayName={filter.display_name}
      sortBy={searchParams.sortBy}
      page={page}
      countryCode={DEFAULT_COUNTRY_CODE}
    />
  )
}
