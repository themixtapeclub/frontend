// src/app/(main)/shop/artist/[slug]/page.tsx
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

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params
  const { filter } = await getFilteredProducts({
    type: "artist",
    value: params.slug,
    page: 1,
    limit: 1
  })

  const description = `Shop vinyl records, CDs and cassettes by ${filter.display_name}. Available at The Mixtape Club.`
  const url = `${getBaseURL()}/shop/artist/${params.slug}`

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

export default async function ArtistPage(props: Props) {
  const params = await props.params
  const searchParams = await props.searchParams
  const page = searchParams.page ? parseInt(searchParams.page) : 1

  const { filter } = await getFilteredProducts({
    type: "artist",
    value: params.slug,
    page: 1,
    limit: 1
  })

  return (
    <FilterPage
      type="artist"
      slug={params.slug}
      displayName={filter.display_name}
      sortBy={searchParams.sortBy}
      page={page}
      countryCode={DEFAULT_COUNTRY_CODE}
    />
  )
}