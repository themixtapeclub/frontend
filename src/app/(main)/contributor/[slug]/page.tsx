// src/app/(main)/contributor/[slug]/page.tsx
import { Metadata } from "next"
import { cookies } from "next/headers"
import { notFound } from "next/navigation"
import Image from "next/image"
import { getContributor, getContributorMixtapes } from "@lib/data/contributors"
import MixtapeCard from "@modules/mixtapes/components/mixtape-card"
import NoiseOverlay from "@modules/common/components/noise-overlay"

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const contributor = await getContributor(slug)
  
  if (!contributor) {
    return { title: "Contributor Not Found" }
  }
  
  const title = contributor.name + ", The Mixtape Club"
  const description = "Listen to mixtapes by " + contributor.name + " on The Mixtape Club."
  
  return {
    title,
    description,
    openGraph: contributor.image_url ? {
      images: [{ url: contributor.image_url }]
    } : undefined
  }
}

export default async function ContributorPage({ params }: Props) {
  const { slug } = await params
  const contributor = await getContributor(slug)
  
  if (!contributor) {
    notFound()
  }
  
  const cookieStore = await cookies()
  const isAdmin = cookieStore.get("_tmc_admin")?.value === "authenticated"
  
  const { mixtapes } = await getContributorMixtapes(slug, { 
    limit: 100,
    includeArchived: isAdmin
  })
  
  const hasImage = !!contributor.image_url

  return (
    <div className="w-full">
      {hasImage ? (
        <ContributorHeroWithImage contributor={contributor} />
      ) : (
        <ContributorHeroNoImage contributor={contributor} />
      )}
      
      {mixtapes.length > 0 && (
        <section className="w-full pb-8">
          <div className="flex flex-wrap justify-center">
            {mixtapes.map((mixtape: any) => (
              <div key={mixtape.id} className="w-1/2 sm:w-1/3 lg:w-1/4 relative">
                <MixtapeCard mixtape={mixtape} />
                {mixtape.archived && (
                  <div className="absolute top-2 right-2 text-lg" title="Archived">👀</div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
      
      {mixtapes.length === 0 && (
        <div className="px-4 py-12 text-center">
          No mixtapes found for this contributor.
        </div>
      )}
    </div>
  )
}

function ContributorHeroNoImage({ contributor }: { contributor: any }) {
  const instagramUrl = contributor.instagram 
    ? "https://instagram.com/" + contributor.instagram.replace("@", "")
    : null
  const websiteUrl = contributor.website
    ? (contributor.website.startsWith("http") ? contributor.website : "https://" + contributor.website)
    : null

  return (
      <div className="contributor-no-image page-nav submenu w-full">
        <div className="genre relative">
        <div className="flex justify-center items-center px-4">
          <ul className="flex justify-center flex-wrap p-0 list-none">
            <li className="menu-item whitespace-nowrap">
              <span className="menu-link mx-1 px-2 bold">{contributor.name}</span>
            </li>
            {instagramUrl && (
              <li className="menu-item whitespace-nowrap flex items-center">
                <a
                  href={instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="menu-link mx-1 px-2 opacity-60 hover:opacity-100 transition-opacity"
                >
                  <InstagramIcon />
                </a>
              </li>
            )}
            {websiteUrl && (
              <li className="menu-item whitespace-nowrap flex items-center">
                <a
                  href={websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="menu-link mx-1 px-2 opacity-60 hover:opacity-100 transition-opacity"
                >
                  <WebsiteIcon />
                </a>
              </li>
            )}
          </ul>
        </div>
      </div>
      
      <div className="format relative">
        <div className="flex justify-center items-center px-4">
          <ul className="flex justify-center flex-wrap p-0 list-none">
            <li className="menu-item small whitespace-nowrap">
              <span className="menu-link mx-1 px-2">
                {contributor.mixtape_count} mixtape{contributor.mixtape_count !== 1 ? "s" : ""}
                {contributor.location && " · " + contributor.location}
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}

function ContributorHeroWithImage({ contributor }: { contributor: any }) {
  const url = contributor.image_url
  const instagramUrl = contributor.instagram 
    ? "https://instagram.com/" + contributor.instagram.replace("@", "")
    : null
  const websiteUrl = contributor.website
    ? (contributor.website.startsWith("http") ? contributor.website : "https://" + contributor.website)
    : null

  return (
    <div 
      className="relative z-10 overflow-hidden"
      style={{ marginTop: "-3.3rem" }}
    >
      <div className="absolute inset-0 z-[1] bg-black">
        <div 
          className="absolute inset-0 opacity-25"
          style={{
            backgroundImage: "url(" + url + ")",
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "blur(20px)",
            transform: "scale(1.2)",
          }}
        />
        <NoiseOverlay />
      </div>
      <div className="relative z-[2]">
        <div className="flex justify-center p-0">
          <div 
            className="flex items-center justify-center relative"
            style={{ 
              width: "300px", 
              height: "300px", 
              marginTop: "6.6rem", 
              marginBottom: "2rem" 
            }}
          >
            <Image
              src={url}
              alt={contributor.name}
              width={300}
              height={300}
              priority
              className="object-cover rounded-full"
            />
          </div>
        </div>
        
        <div className="px-4 pb-4 text-center">
          <h1 className="card-title text-white mb-2">
            {contributor.name}
          </h1>
          
          {contributor.location && (
            <p className="mono text-white mb-4">{contributor.location}</p>
          )}
          
          <div className="flex justify-center gap-4 mt-4">
            {instagramUrl && (
              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-white/70 transition-colors"
              >
                <InstagramIcon />
              </a>
            )}
            {websiteUrl && (
              <a
                href={websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-white/70 transition-colors"
              >
                <WebsiteIcon />
              </a>
            )}
          </div>
          
          {contributor.mixtape_count > 0 && (
            <p className="mono text-white mt-4">
              {contributor.mixtape_count} mixtape{contributor.mixtape_count !== 1 ? "s" : ""}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

function InstagramIcon() {
  return (
    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
    </svg>
  )
}

function WebsiteIcon() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"/>
    </svg>
  )
}