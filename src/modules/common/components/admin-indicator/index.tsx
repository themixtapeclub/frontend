// src/modules/common/components/admin-indicator/index.tsx
"use client"

import { useAdmin } from "@lib/context/admin-context"

export function AdminHiddenIndicator() {
  const { isAdmin } = useAdmin()
  
  if (!isAdmin) return null
  
  return (
    <div className="fixed bottom-4 right-4 z-50 text-2xl pointer-events-none">
      👀
    </div>
  )
}