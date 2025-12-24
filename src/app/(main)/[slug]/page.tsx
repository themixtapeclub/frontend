import { Metadata } from "next"
import { notFound } from "next/navigation"
import { getPage } from "@lib/data/pages"
import StaticPageContent from "./StaticPageContent"

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return [
    { slug: 'info' },
    { slug: 'faq' },
    { slug: 'shipping-handling' },
    { slug: 'grading' },
    { slug: 'terms-conditions' },
    { slug: 'privacy-policy' },
  ]
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const data = await getPage(slug)
  
  if (!data?.page) {
    return { title: "Page Not Found" }
  }

  return {
    title: data.page.meta_title || data.page.title,
    description: data.page.meta_description || data.page.description,
  }
}

export default async function StaticPage({ params }: Props) {
  const { slug } = await params
  
  const reservedSlugs = ["account", "cart", "categories", "collections", "order", "products", "search", "shop", "mixes", "mixtape", "mixtapes", "contributor"]
  if (reservedSlugs.includes(slug)) {
    notFound()
  }

  const data = await getPage(slug)

  if (!data?.page) {
    notFound()
  }

  return <StaticPageContent page={data.page} />
}
