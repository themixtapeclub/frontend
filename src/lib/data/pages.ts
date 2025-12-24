// src/lib/data/pages.ts

const ADMIN_API_URL = process.env.ADMIN_API_URL || "http://localhost:3000"

export async function getPage(slug: string) {
  try {
    const res = await fetch(`${ADMIN_API_URL}/api/store/pages/${slug}`, {
      next: { revalidate: 60 },
    })
    if (!res.ok) return null
    return res.json()
  } catch (error) {
    console.error("Error fetching page:", error)
    return null
  }
}

export async function getHomePage() {
  return getPage("home")
}
