// scripts/sync-mixcloud-tags.mjs
import { neon } from "@neondatabase/serverless"

const RATE_LIMIT_MS = 500

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function extractMixcloudSlug(mixcloudUrl) {
  if (!mixcloudUrl) return null
  const match = mixcloudUrl.match(/mixcloud\.com\/([^\/]+)\/([^\/]+)/)
  if (match) {
    return `${match[1]}/${match[2]}`
  }
  return null
}

async function fetchMixcloudTags(mixcloudSlug) {
  try {
    const apiUrl = `https://api.mixcloud.com/${mixcloudSlug}/`
    const response = await fetch(apiUrl)
    
    if (!response.ok) {
      console.warn(`  ✗ API error for ${mixcloudSlug}: ${response.status}`)
      return null
    }
    
    const data = await response.json()
    
    if (data.tags && Array.isArray(data.tags)) {
      return data.tags.map(t => t.name)
    }
    
    return []
  } catch (error) {
    console.warn(`  ✗ Fetch error for ${mixcloudSlug}:`, error.message)
    return null
  }
}

async function syncMixcloudTags(sql, dryRun = false) {
  console.log("\n=== Fetching Mixtapes Missing Tags ===\n")
  
  const mixtapes = await sql`
    SELECT id, title, slug, mixcloud_url, tags
    FROM mixtape 
    WHERE deleted_at IS NULL
      AND mixcloud_url IS NOT NULL 
      AND mixcloud_url != ''
      AND (tags IS NULL OR tags = '[]'::jsonb OR tags = 'null'::jsonb OR jsonb_array_length(tags) = 0)
    ORDER BY title
  `
  
  console.log(`Found ${mixtapes.length} mixtapes missing tags with Mixcloud URLs\n`)
  
  if (mixtapes.length === 0) {
    console.log("Nothing to sync!")
    return
  }
  
  let updatedCount = 0
  let skippedCount = 0
  let errorCount = 0
  
  for (const mixtape of mixtapes) {
    const mixcloudSlug = extractMixcloudSlug(mixtape.mixcloud_url)
    
    if (!mixcloudSlug) {
      console.log(`  ✗ Invalid Mixcloud URL: ${mixtape.title}`)
      errorCount++
      continue
    }
    
    console.log(`Processing: ${mixtape.title}`)
    console.log(`  Mixcloud: ${mixcloudSlug}`)
    
    const tags = await fetchMixcloudTags(mixcloudSlug)
    
    if (tags === null) {
      errorCount++
      continue
    }
    
    if (tags.length === 0) {
      console.log(`  ⚠ No tags on Mixcloud`)
      skippedCount++
      await sleep(RATE_LIMIT_MS)
      continue
    }
    
    console.log(`  Tags: ${tags.join(", ")}`)
    
    if (!dryRun) {
      await sql`
        UPDATE mixtape 
        SET tags = ${JSON.stringify(tags)}::jsonb,
            updated_at = NOW()
        WHERE id = ${mixtape.id}
      `
      console.log(`  ✓ Updated`)
    } else {
      console.log(`  [DRY RUN] Would update`)
    }
    
    updatedCount++
    await sleep(RATE_LIMIT_MS)
  }
  
  console.log(`\n=== Summary ===`)
  console.log(`Updated: ${updatedCount}`)
  console.log(`Skipped (no tags on Mixcloud): ${skippedCount}`)
  console.log(`Errors: ${errorCount}`)
}

async function main() {
  const databaseUrl = process.env.DATABASE_URL
  
  if (!databaseUrl) {
    console.error("DATABASE_URL environment variable is required")
    process.exit(1)
  }
  
  const dryRun = process.argv.includes("--dry-run")
  
  if (dryRun) {
    console.log("=== DRY RUN MODE - No changes will be made ===\n")
  }

  const sql = neon(databaseUrl)

  console.log("=== Mixcloud Tags Sync Script ===")

  try {
    await syncMixcloudTags(sql, dryRun)
    console.log("\n=== Sync Complete ===")
  } catch (error) {
    console.error("Sync failed:", error)
    process.exit(1)
  }
}

main()
