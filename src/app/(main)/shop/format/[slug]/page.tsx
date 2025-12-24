// src/app/(main)/shop/format/[slug]/page.tsx
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

const FORMAT_DESCRIPTIONS: Record<string, string> = {
  "12": "Shop 12\" vinyl records. New, original and reissue EPs and maxi singles.",
  "lp": "Shop LP vinyl records. New, original and reissue albums.",
  "compilation": "Shop compilations on vinyl.",
  "cassette": "Shop cassette tapes. Mixtapes, new releases and reissues on tape.",
  "cd": "Shop CDs. New, original and reissue compact discs.",
  "publication": "Shop publications. Books magazines and zines.",
  "merchandise": "Shop merchandise. Apparel accessories and collectibles.",
  "bundle": "Shop bundles. Curated collections and special packages.",
}

const FORMAT_TITLES: Record<string, string> = {
  "12": "12\" Vinyl Records",
  "lp": "LP Vinyl Records",
  "compilation": "Compilation Albums",
  "cassette": "Cassette Tapes",
  "cd": "CDs",
  "publication": "Publications",
  "merchandise": "Merchandise",
  "bundle": "Bundles",
}

export async function generateStaticParams() {
  return [
    { slug: '7' },
    { slug: '12' },
    { slug: 'lp' },
    { slug: 'compilation' },
    { slug: 'cassette' },
    { slug: 'cd' },
    { slug: 'publication' },
    { slug: 'merchandise' },
    { slug: 'bundle' },
  ]
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params
  const { filter } = await getFilteredProducts({
    type: "format",
    value: params.slug,
    page: 1,
    limit: 1
  })

  const title = FORMAT_TITLES[params.slug] || filter.display_name
  const description = FORMAT_DESCRIPTIONS[params.slug] || `Shop ${filter.display_name} at The Mixtape Club.`
  const url = `${getBaseURL()}/shop/format/${params.slug}`

  return {
    title: title,
    description: description,
    openGraph: {
      title: `${title} | The Mixtape Club`,
      description: description,
      url: url,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | The Mixtape Club`,
      description: description,
    },
    alternates: {
      canonical: url,
    },
  }
}

export default async function FormatPage(props: Props) {
  const params = await props.params
  const searchParams = await props.searchParams
  const page = searchParams.page ? parseInt(searchParams.page) : 1

  const { filter } = await getFilteredProducts({
    type: "format",
    value: params.slug,
    page: 1,
    limit: 1
  })

  return (
    <FilterPage
      type="format"
      slug={params.slug}
      displayName={filter.display_name}
      sortBy={searchParams.sortBy}
      page={page}
      countryCode={DEFAULT_COUNTRY_CODE}
    />
  )
}
