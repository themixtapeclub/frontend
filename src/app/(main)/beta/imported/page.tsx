// frontend/src/app/(main)/beta/imported/page.tsx

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import Link from "next/link"
import MixtapeCard from "@modules/mixtapes/components/mixtape-card"

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:9000"

async function getImportedMixtapes(page: number) {
  const res = await fetch(BACKEND_URL + "/mixtapes/imported?page=" + page + "&limit=72", {
    next: { revalidate: 60 }
  })
  if (!res.ok) return { mixtapes: [], pagination: { page: 1, limit: 72, total: 0, totalPages: 0 } }
  return res.json()
}

export default async function ImportedMixtapesPage({
  searchParams
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const cookieStore = await cookies()
  const isAdmin = cookieStore.get("_tmc_admin")?.value === "authenticated"
  
  if (!isAdmin) {
    redirect("/")
  }
  
  const params = await searchParams
  const page = parseInt(params.page || "1")
  const { mixtapes, pagination } = await getImportedMixtapes(page)
  
  return (
    <div className="w-full px-4 py-8">
      <h1 className="text-2xl font-bold mb-2">Recently Imported Mixtapes</h1>
      <p className="text-gray-400 mb-2">{pagination.total} mixtapes imported from Mixcloud CSV</p>
      <p className="text-gray-500 text-sm mb-6">
        <Link href="/beta/visible" className="underline">View all visible</Link>
        {" | "}
        <Link href="/beta/hidden" className="underline">View hidden</Link>
        {" | "}
        <Link href="/beta/no-tags" className="underline">View no-tags</Link>
      </p>
      
      {mixtapes.length > 0 ? (
        <div className="flex flex-wrap justify-center">
          {mixtapes.map((mixtape: any) => (
            <div key={mixtape.id} className="w-1/2 sm:w-1/3 lg:w-1/4 relative">
              {mixtape.archived && (
                <div className="absolute top-2 left-2 z-10 bg-red-600 text-white text-xs px-2 py-1 rounded">
                  HIDDEN
                </div>
              )}
              <MixtapeCard mixtape={{
                ...mixtape,
                contributors: mixtape.contributors || mixtape.contributor || []
              }} />
            </div>
          ))}
        </div>
      ) : (
        <p>No imported mixtapes found.</p>
      )}
      
      {pagination.totalPages > 1 && (
        <div className="flex justify-center gap-4 mt-8">
          {page > 1 && (
            <Link 
              href={"/beta/imported?page=" + (page - 1)}
              className="px-4 py-2 bg-white text-black rounded"
            >
              Previous
            </Link>
          )}
          <span className="px-4 py-2">
            Page {page} of {pagination.totalPages}
          </span>
          {page < pagination.totalPages && (
            <Link 
              href={"/beta/imported?page=" + (page + 1)}
              className="px-4 py-2 bg-white text-black rounded"
            >
              Next
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
