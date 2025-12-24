"use client"

import { useEffect } from "react"
import { removeFromWantlist, getWantlist } from "@lib/data/wantlist"

interface WantlistCleanupProps {
  orderItems: Array<{
    product_id: string
    variant_id: string
  }>
}

export default function WantlistCleanup({ orderItems }: WantlistCleanupProps) {
  useEffect(() => {
    async function cleanupWantlist() {
      if (!orderItems.length) return
      
      const wantlist = await getWantlist()
      if (!wantlist.length) return
      
      for (const item of orderItems) {
        const isInWantlist = wantlist.some(w => 
          w.product_id === item.product_id && 
          (!w.variant_id || !item.variant_id || w.variant_id === item.variant_id)
        )
        
        if (isInWantlist) {
          await removeFromWantlist({
            product_id: item.product_id,
            variant_id: item.variant_id,
          })
        }
      }
    }
    
    cleanupWantlist()
  }, [orderItems])
  
  return null
}
