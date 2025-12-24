// scripts/sync-contributors.mjs
import { neon } from "@neondatabase/serverless"

const WP_BASE_URL = "https://themixtapeclub.co/wp-json/wp/v2"

async function fetchAllContributors() {
  const allContributors = []
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

    const contributors = await response.json()
    
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

async function fetchMediaUrl(mediaId) {
  if (!mediaId || mediaId === 0) {
    return null
  }

  try {
    const response = await fetch(`${WP_BASE_URL}/media/${mediaId}`)
    if (!response.ok) {
      console.warn(`Failed to fetch media ${mediaId}: ${response.status}`)
      return null
    }
    const media = await response.json()
    return media.source_url || null
  } catch (error) {
    console.warn(`Error fetching media ${mediaId}:`, error)
    return null
  }
}

function generateId(prefix = "contrib") {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
}

async function syncContributors(sql) {
  const wpContributors = await fetchAllContributors()
  
  console.log("\n=== Syncing Contributors to Database ===\n")
  
  const contributorsByName = new Map()
  const contributorsBySlug = new Map()
  
  for (const wpContrib of wpContributors) {
    const imageUrl = await fetchMediaUrl(wpContrib.featured_media)
    const name = wpContrib.title.rendered
      .replace(/&#8217;/g, "'")
      .replace(/&#038;/g, "&")
      .replace(/&#8211;/g, "–")
    
    const existing = await sql`
      SELECT id FROM contributor WHERE wp_id = ${wpContrib.id}
    `
    
    let contributorId
    
    if (existing.length > 0) {
      contributorId = existing[0].id
      await sql`
        UPDATE contributor SET
          name = ${name},
          slug = ${wpContrib.slug},
          location = ${wpContrib.acf?.location || null},
          image_url = ${imageUrl},
          instagram = ${wpContrib.acf?.instagram || null},
          website = ${wpContrib.acf?.website_repeater?.[0]?.website || null},
          updated_at = NOW()
        WHERE id = ${contributorId}
      `
      console.log(`  ✓ Updated: ${name}`)
    } else {
      contributorId = generateId("contrib")
      await sql`
        INSERT INTO contributor (id, wp_id, name, slug, location, image_url, instagram, website)
        VALUES (
          ${contributorId},
          ${wpContrib.id},
          ${name},
          ${wpContrib.slug},
          ${wpContrib.acf?.location || null},
          ${imageUrl},
          ${wpContrib.acf?.instagram || null},
          ${wpContrib.acf?.website_repeater?.[0]?.website || null}
        )
      `
      console.log(`  ✓ Inserted: ${name}`)
    }
    
    contributorsByName.set(name.toLowerCase(), contributorId)
    contributorsBySlug.set(wpContrib.slug, contributorId)
  }
  
  console.log(`\nSynced ${wpContributors.length} contributors`)
  
  return { byName: contributorsByName, bySlug: contributorsBySlug }
}

async function linkMixtapesToContributors(sql, contributorMaps) {
  const { byName, bySlug } = contributorMaps
  
  console.log("\n=== Linking Mixtapes to Contributors ===\n")
  
  const mixtapes = await sql`
    SELECT id, slug, contributors 
    FROM mixtape 
    WHERE contributors IS NOT NULL 
      AND jsonb_array_length(contributors) > 0
  `
  
  let linkedCount = 0
  let skippedCount = 0
  let notFoundCount = 0
  
  for (const mixtape of mixtapes) {
    const contributors = mixtape.contributors || []
    
    for (let i = 0; i < contributors.length; i++) {
      const c = contributors[i]
      
      let contributorId = bySlug.get(c.slug)
      if (!contributorId && c.name) {
        contributorId = byName.get(c.name.toLowerCase())
      }
      
      if (contributorId) {
        const existingLink = await sql`
          SELECT id FROM mixtape_contributor 
          WHERE mixtape_id = ${mixtape.id} AND contributor_id = ${contributorId}
        `
        
        if (existingLink.length === 0) {
          const linkId = generateId("mc")
          await sql`
            INSERT INTO mixtape_contributor (id, mixtape_id, contributor_id, position)
            VALUES (${linkId}, ${mixtape.id}, ${contributorId}, ${i})
          `
          console.log(`  ✓ Linked: ${mixtape.slug} -> ${c.name}`)
          linkedCount++
        } else {
          skippedCount++
        }
      } else {
        console.log(`  ✗ Not found: ${c.name} (${c.slug}) for mixtape ${mixtape.slug}`)
        notFoundCount++
      }
    }
  }
  
  console.log(`\nLinked ${linkedCount} new connections, skipped ${skippedCount} existing, ${notFoundCount} not found`)
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
    const contributorMaps = await syncContributors(sql)
    await linkMixtapesToContributors(sql, contributorMaps)
    console.log("\n=== Sync Complete ===")
  } catch (error) {
    console.error("Sync failed:", error)
    process.exit(1)
  }
}

main()
