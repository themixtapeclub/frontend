// frontend/src/lib/data/wantlist.ts
"use server"
import { sdk } from "@lib/config"
import { getAuthHeaders } from "./cookies"

interface WantlistItem {
  product_id: string
  variant_id?: string
  product_title: string
  variant_title?: string
  product_handle: string
  product_image?: string
  artist?: string
  added_at: string
  in_stock?: boolean
}

export async function getWantlist(): Promise<WantlistItem[]> {
  const authHeaders = await getAuthHeaders()
  if (!authHeaders || !("authorization" in authHeaders)) return []

  try {
    const response = await sdk.client.fetch<{ wantlist: WantlistItem[] }>(
      `/store/wantlist`,
      {
        method: "GET",
        headers: authHeaders,
      }
    )
    return response.wantlist || []
  } catch (error) {
    console.error("Failed to fetch wantlist:", error)
    return []
  }
}

export async function addToWantlist(data: {
  product_id: string
  variant_id?: string
  product_title: string
  variant_title?: string
  product_handle: string
  product_image?: string
  artist?: string
}): Promise<{ success: boolean; error?: string }> {
  const authHeaders = await getAuthHeaders()
  if (!authHeaders || !("authorization" in authHeaders)) {
    return { success: false, error: "Not logged in" }
  }

  try {
    await sdk.client.fetch(`/store/wantlist`, {
      method: "POST",
      headers: authHeaders,
      body: data,
    })
    return { success: true }
  } catch (error) {
    console.error("Failed to add to wantlist:", error)
    return { success: false, error: "Failed to add to wantlist" }
  }
}

export async function removeFromWantlist(data: {
  product_id: string
  variant_id?: string
}): Promise<{ success: boolean; error?: string }> {
  const authHeaders = await getAuthHeaders()
  if (!authHeaders || !("authorization" in authHeaders)) {
    return { success: false, error: "Not logged in" }
  }

  try {
    await sdk.client.fetch(`/store/wantlist`, {
      method: "DELETE",
      headers: authHeaders,
      body: data,
    })
    return { success: true }
  } catch (error) {
    console.error("Failed to remove from wantlist:", error)
    return { success: false, error: "Failed to remove from wantlist" }
  }
}

export async function isOnWantlist(
  productId: string,
  variantId?: string
): Promise<boolean> {
  const wantlist = await getWantlist()
  const key = variantId ? `${productId}:${variantId}` : productId

  return wantlist.some((item) => {
    const itemKey = item.variant_id
      ? `${item.product_id}:${item.variant_id}`
      : item.product_id
    return itemKey === key
  })
}
