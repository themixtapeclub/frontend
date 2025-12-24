// src/app/(main)/backstage/page.tsx
import { isAdmin } from "@lib/util/admin"
import { BackstageForm } from "./form"

export default async function BackstagePage() {
  const adminStatus = await isAdmin()
  
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <div className="w-full max-w-sm">
        <BackstageForm initialIsAdmin={adminStatus} />
      </div>
    </div>
  )
}