// scripts/sync-contributors.ts
import { neon } from "@neondatabase/serverless"

const WP_BASE_URL = "https://themixtapeclub.co/wp-json/wp/v2"

interface WPContributor {
  id: number
  slug: string
  title: { rendered: string }
  featured_media: number
  acf: {
    location?: string
    instagram?: string
    website_repeater?: { website: string }[] | null
  }
}

interface WPMedia {
  id: number
  source_url: string
}

interface ContributorData {
  wp_id: number
  name: string
  slug: string
  location: string | null
  image_url: string | null
  instagram: string | null
  website: string | null
}

async function fetchAllContributors(): Promise<WPContributor[]> {
  const allContributors: WPContributor[] = []
  let page = 1
  const perPage = 100

  while (true) {
    const url = `${WP_BASE_URL}/contributor?per_page=${perPage}&page=${page}`
    console.log(`Fetching contributors page ${page}...`)
    
    const response = await fetch(url)
    
    if (!response.ok) {
      if (response.status === 400) {
        break
      }
      throw new Error(`Failed to fetch contributors: ${response.status}`)
    }

    const contributors: WPContributor[] = await response.json()
    
    if (contributors.length === 0) {
      break
    }

    allContributors.push(...contributors)
    
    const totalPages = parseInt(response.headers.get("x-wp-totalpages") || "1")
    if (page >= totalPages) {
      break
    }
    
    page++
  }

  console.log(`Fetched ${allContributors.length} contributors total`)
  return allContributors
}

async function fetchMediaUrl(mediaId: number): Promise<string | null> {
  if (!mediaId || mediaId === 0) {
    return null
  }

  try {
    const response = await fetch(`${WP_BASE_URL}/media/${mediaId}`)
    if (!response.ok) {
      console.warn(`Failed to fetch media ${mediaId}: ${response.status}`)
      return null
    }
    const media: WPMedia = await response.json()
    return media.source_url || null
  } catch (error) {
    console.warn(`Error fetching media ${mediaId}:`, error)
    return null
  }
}

async function buildContributorMap(): Promise<Map<string, ContributorData>> {
  const contributors = await fetchAllContributors()
  const contributorMap = new Map<string, ContributorData>()

  console.log("\nFetching media URLs for contributors...")
  
  for (const contributor of contributors) {
    const imageUrl = await fetchMediaUrl(contributor.featured_media)
    
    const data: ContributorData = {
      wp_id: contributor.id,
      name: contributor.title.rendered.replace(/&#8217;/g, "'").replace(/&#038;/g, "&"),
      slug: contributor.slug,
      location: contributor.acf?.location || null,
      image_url: imageUrl,
      instagram: contributor.acf?.instagram || null,
      website: contributor.acf?.website_repeater?.[0]?.website || null,
    }

    contributorMap.set(contributor.slug, data)
    console.log(`  ✓ ${data.name} (${data.slug}) - ${imageUrl ? "has image" : "no image"}`)
  }

  return contributorMap
}

async function updateMixtapeContributors(
  sql: any,
  contributorMap: Map<string, ContributorData>
): Promise<void> {
  const mixtapes: any[] = await sql`
    SELECT id, slug, contributors 
    FROM mixtape 
    WHERE contributors IS NOT NULL 
      AND jsonb_array_length(contributors) > 0
  `

  console.log(`\nUpdating ${mixtapes.length} mixtapes...`)

  let updatedCount = 0
  let skippedCount = 0

  for (const mixtape of mixtapes) {
    const contributors = mixtape.contributors as any[]
    let hasChanges = false
    
    const enrichedContributors = contributors.map((c: any) => {
      const wpData = contributorMap.get(c.slug)
      
      if (wpData) {
        if (wpData.image_url || wpData.location) {
          hasChanges = true
          return {
            ...c,
            image_url: wpData.image_url || c.image_url || null,
            location: wpData.location || c.location || null,
            instagram: wpData.instagram || c.instagram || null,
            website: wpData.website || c.website || null,
            wp_id: wpData.wp_id,
          }
        }
      }
      
      return c
    })

    if (hasChanges) {
      await sql`
        UPDATE mixtape 
        SET 
          contributors = ${JSON.stringify(enrichedContributors)}::jsonb,
          updated_at = NOW()
        WHERE id = ${mixtape.id}
      `
      console.log(`  ✓ Updated: ${mixtape.slug}`)
      updatedCount++
    } else {
      skippedCount++
    }
  }

  console.log(`\nDone! Updated ${updatedCount} mixtapes, skipped ${skippedCount}`)
}

async function main() {
  const databaseUrl = process.env.DATABASE_URL
  
  if (!databaseUrl) {
    console.error("DATABASE_URL environment variable is required")
    process.exit(1)
  }

  const sql = neon(databaseUrl)

  console.log("=== Contributor Sync Script ===\n")

  try {
    const contributorMap = await buildContributorMap()
    await updateMixtapeContributors(sql, contributorMap)
    console.log("\n=== Sync Complete ===")
  } catch (error) {
    console.error("Sync failed:", error)
    process.exit(1)
  }
}

main()