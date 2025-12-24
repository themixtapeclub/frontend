// src/app/(main)/mixes/page.tsx
import { Metadata } from "next"
import { getMixtapes } from "@lib/data/mixtapes"
import MixtapeCard from "@modules/mixtapes/components/mixtape-card"
import { Pagination } from "@modules/store/components/pagination"

export const metadata: Metadata = {
  title: "Mixes",
  description: "Mixtapes from music lovers around the world",
}

export const dynamic = "force-static"
export const revalidate = 300

const FIRST_PAGE_LIMIT = 50
const OTHER_PAGE_LIMIT = 48

export default async function MixesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const params = await searchParams
  const page = parseInt(params.page || "1")
  const isFirstPage = page === 1
  const limit = isFirstPage ? FIRST_PAGE_LIMIT : OTHER_PAGE_LIMIT
  const offset = isFirstPage ? 0 : FIRST_PAGE_LIMIT + (page - 2) * OTHER_PAGE_LIMIT
  
  const { mixtapes, pagination } = await getMixtapes({ limit, offset, featured: true })
  
  if (mixtapes.length === 0) {
    return (
      <div className="py-12 px-4">
        <h1 className="text-2xl font-semibold mb-4">Mixes</h1>
        <p>No mixtapes found at the moment.</p>
      </div>
    )
  }
  
  const featuredMixtapes = isFirstPage ? mixtapes.slice(0, 6) : []
  const regularMixtapes = isFirstPage ? mixtapes.slice(6) : mixtapes
  
  const totalPages = Math.ceil((pagination.total - FIRST_PAGE_LIMIT) / OTHER_PAGE_LIMIT) + 1
  
  return (
    <div className="w-full">
      {featuredMixtapes.length > 0 && (
        <div className="flex flex-wrap justify-center">
          {featuredMixtapes.map((mixtape, index) => (
            <div key={mixtape.id} className="w-1/2 md:w-1/3">
              <MixtapeCard 
                mixtape={mixtape} 
                featured={true}
                index={index}
              />
            </div>
          ))}
        </div>
      )}
      
      {regularMixtapes.length > 0 && (
        <div className="flex flex-wrap justify-center">
          {regularMixtapes.map((mixtape, index) => (
            <div key={mixtape.id} className="w-1/2 sm:w-1/3 lg:w-1/4">
              <MixtapeCard 
                mixtape={mixtape} 
                featured={false}
                index={index + featuredMixtapes.length}
              />
            </div>
          ))}
        </div>
      )}
      
      <Pagination page={page} totalPages={totalPages} />
    </div>
  )
}
