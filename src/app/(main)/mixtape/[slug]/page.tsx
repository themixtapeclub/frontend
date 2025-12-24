// src/app/(main)/mixtape/[slug]/page.tsx
import { Metadata } from "next"
import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { getMixtape, getRelatedMixtapes, getMixtapeRelatedProducts, getTracklistProducts, getVisibleContributors, formatContributorNames } from "@lib/data/mixtapes"
import { getFirstPageMixtapeSlugs } from "@lib/data/static-params"
import ProductCard from "@modules/products/components/product-card"
import MixtapeCard from "@modules/mixtapes/components/mixtape-card"
import RelatedSection from "@modules/common/components/related-section"
import MixtapeHeroClient from "./hero-client"

interface Props {
  params: Promise<{ slug: string }>
}

export const dynamic = "force-static"
export const dynamicParams = true
export const revalidate = 300

const PRIORITY_TAGS = ["Groovy", "Chill", "Global", "Healing", "Dance", "Nostalgia"]

function sortTagsByPriority(tags: string[]): string[] {
  return [...tags].sort((a, b) => {
    const aIndex = PRIORITY_TAGS.findIndex(t => t.toLowerCase() === a.toLowerCase())
    const bIndex = PRIORITY_TAGS.findIndex(t => t.toLowerCase() === b.toLowerCase())
    const aPriority = aIndex === -1 ? PRIORITY_TAGS.length : aIndex
    const bPriority = bIndex === -1 ? PRIORITY_TAGS.length : bIndex
    return aPriority - bPriority
  })
}

export async function generateStaticParams() {
  try {
    return await getFirstPageMixtapeSlugs()
  } catch (error) {
    console.error("Failed to generate static paths:", error)
    return []
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const mixtape = await getMixtape(slug)
  
  if (!mixtape) {
    return { title: "Mixtape Not Found" }
  }
  
  const contributors = getVisibleContributors(mixtape.contributors || [])
  const artistInfo = formatContributorNames(contributors)
  
  const title = mixtape.seo_title || (mixtape.title + (artistInfo ? " by " + artistInfo : ""))
  
  return {
    title,
    description: mixtape.seo_description || mixtape.description || "Listen to " + mixtape.title + " mixtape.",
    openGraph: mixtape.featured_image_url ? {
      images: [{ url: mixtape.featured_image_url }]
    } : undefined
  }
}

export default async function MixtapePage({ params }: Props) {
  const { slug } = await params
  const mixtape = await getMixtape(slug)
  
  if (!mixtape) {
    notFound()
  }
  
  const contributors = getVisibleContributors(mixtape.contributors || [])
  
  const [tracklistProducts, relatedData, relatedProductsData] = await Promise.all([
    getTracklistProducts(slug),
    getRelatedMixtapes(slug, 8, 12),
    getMixtapeRelatedProducts(slug, 12, false)
  ])
  
  const hasTracklistProducts = mixtape.tracklist?.some((t: any) => t.productId) || false
  
  const tracksWithProducts = mixtape.tracklist?.filter((t: any) => t.product && t.product.thumbnail) || []
  const showTracklistGrid = tracksWithProducts.length === 10
  
  const shownMixtapeIds = new Set<string>([mixtape.id])
  
  const byContributor = relatedData.byContributor
    .filter((m: any) => !shownMixtapeIds.has(m.id))
    .slice(0, 8)
  byContributor.forEach((m: any) => shownMixtapeIds.add(m.id))
  
  const byTags = relatedData.byTags
    .filter((m: any) => !shownMixtapeIds.has(m.id))
    .slice(0, 8)
  
  const shownProductIds = new Set<string>()
  tracklistProducts.forEach((p: any) => shownProductIds.add(p.id))
  const deduplicatedRelatedProducts = relatedProductsData.products.filter(
    (p: any) => !shownProductIds.has(p.id)
  )
  
  let sectionCount = 0
  
  return (
    <div className="w-full">
      <MixtapeHeroClient
        mixtape={mixtape}
        contributors={contributors}
      />
      
      {showTracklistGrid && (
        <TracklistProductGrid tracklist={mixtape.tracklist || []} />
      )}
      
      {mixtape.tracklist && mixtape.tracklist.length > 0 && (
        <div className={`w-full${!mixtape.tags?.length ? " border-b border-black" : ""}`}>
          {mixtape.tracklist.map((track: any, index: number) => (
            <TrackRow key={index} track={track} />
          ))}
        </div>
      )}
      
      {mixtape.tags && mixtape.tags.length > 0 && (
        <div className="w-full border-t border-t-gray-200 border-b border-b-black pb-4 pt-1">
          <div className="max-w-4xl mx-auto px-4">
            <div className="flex flex-wrap">
              {sortTagsByPriority(mixtape.tags).map((tag: string, i: number) => (
                <TagLink key={i} tag={tag} />
              ))}
            </div>
          </div>
        </div>
      )}
      
      {tracklistProducts.length > 0 && (
        <RelatedSection title="Vinyl in this mix" isFirst={sectionCount++ === 0}>
          {tracklistProducts.map((product: any) => (
            <li key={product.id} className="w-1/2 sm:w-1/3 lg:w-1/4">
              <ProductCard product={product} />
            </li>
          ))}
        </RelatedSection>
      )}
      
      {contributors.length > 0 && byContributor.length > 0 && (
        <RelatedSection 
          title={"More by " + (contributors.length === 1 ? contributors[0].name : contributors.map(c => c.name).join(" & "))}
          isFirst={sectionCount++ === 0}
        >
          {byContributor.map((m: any) => (
            <li key={m.id} className="w-1/2 sm:w-1/3 lg:w-1/4">
              <MixtapeCard mixtape={m} />
            </li>
          ))}
        </RelatedSection>
      )}
      
      {byTags.length > 0 && (
        <RelatedSection title="More Mixtapes" isFirst={sectionCount++ === 0}>
          {byTags.map((m: any) => (
            <li key={m.id} className="w-1/2 sm:w-1/3 lg:w-1/4">
              <MixtapeCard mixtape={m} />
            </li>
          ))}
        </RelatedSection>
      )}
      
      {hasTracklistProducts && deduplicatedRelatedProducts.length > 0 && (
        <RelatedSection 
          title="Related Records" 
          isFirst={sectionCount++ === 0}
        >
          {deduplicatedRelatedProducts.map((product: any) => (
            <li key={product.id} className="w-1/2 sm:w-1/3 lg:w-1/4">
              <ProductCard product={product} />
            </li>
          ))}
        </RelatedSection>
      )}
    </div>
  )
}

function TracklistProductGrid({ tracklist }: { tracklist: any[] }) {
  const products = tracklist
    .filter((t: any) => t.product && t.product.thumbnail)
    .slice(0, 10)
  
  return (
    <div className="w-full bg-black">
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="grid grid-cols-5 gap-4">
          {products.map((track: any, index: number) => {
            const productUrl = track.product?.handle ? "/product/" + track.product.handle : null
            
            const imageContent = (
              <div className="relative aspect-square overflow-hidden group">
                <Image
                  src={track.product.thumbnail}
                  alt={track.trackTitle || track.artist || "Track"}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 18vw, 150px"
                />
                <div className="absolute top-2 right-2 bg-white px-1 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity w-[33%]">
                  <div className="text-[7px] leading-tight truncate">
                    {track.artist}
                  </div>
                  <div className="text-[7px] leading-tight bold truncate">
                    {track.trackTitle}
                  </div>
                </div>
              </div>
            )
            
            if (productUrl) {
              return (
                <Link key={index} href={productUrl} className="block">
                  {imageContent}
                </Link>
              )
            }
            
            return <div key={index}>{imageContent}</div>
          })}
        </div>
      </div>
    </div>
  )
}

function TagLink({ tag }: { tag: string }) {
  const href = "/mixes/" + tag.toLowerCase().replace(/\s+/g, "-")
  return (
    <Link href={href} className="tag-link mr-4">
      {tag}
    </Link>
  )
}

function TrackRow({ track }: { track: any }) {
  const hasProduct = track.product && track.product.thumbnail
  const productUrl = track.product?.handle ? "/product/" + track.product.handle : null
  
  const content = (
    <div className="max-w-4xl mx-auto px-4">
      <div className="flex items-center gap-4 tracklist-row">
        <div className="w-16 h-16 flex-shrink-0">
          {hasProduct && track.product.thumbnail ? (
            <Image
              src={track.product.thumbnail}
              alt={track.trackTitle}
              width={64}
              height={64}
              className="object-cover w-full h-full"
            />
          ) : (
            <div className="w-full h-full" />
          )}
        </div>
        
        <div className="flex-grow min-w-0">
          <div className="tracklist-artist">{track.artist}</div>
          <div className="tracklist-title">{track.trackTitle}</div>
        </div>
      </div>
    </div>
  )
  
  if (productUrl) {
    return (
      <Link 
        href={productUrl} 
        className="block border-t border-gray-200 hover:bg-black hover:text-white transition-colors"
      >
        {content}
      </Link>
    )
  }
  
  return <div className="border-t border-gray-200">{content}</div>
}
