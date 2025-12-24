import { neon } from "@neondatabase/serverless"

const SLUG_MAPPING = {
  'asilentflute': 'a-silent-flute',
  'dmo': 'd-mo',
  'shiv': 'shiv-kalaria',
  'mad-morello': 'austin-morello',
  'alex-kassian': 'al-kassian',
  'bernado-campos': 'bernardo-campos',
  'carol-g': 'caroline-g',
  'erica-roden': 'erica',
  'gt-lovecraft': 'g-t-lovecraft',
  'gustavomm': 'gustavo-mm',
  'neisha-tweed': 'neishababee',
  'paula-dangers': 'paula',
  'tommaso': 'tommaso-gelfi',
  'head-of-a-wolf': 'coat-check',
  'irwintm': 'house-bacon',
  'facchnetti': 'facchinetti',
  'francesca': 'francesca-tallone',
  'uskeda3mm': 'uske-da-3mm',
  'sw-sprague': 's-w-sprague',
  'danny-casanova': 'daniel-casanova',
  'black-classical': 'black-classical-orsii',
  'orsii': 'black-classical-orsii',
  'aor-disco-dj-same': 'aor-disco',
  'vincenzo': 'jo-la-tengo',
}

function generateId(prefix = "mc") {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
}

async function main() {
  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) {
    console.error("DATABASE_URL required")
    process.exit(1)
  }

  const sql = neon(databaseUrl)

  console.log("=== Fixing Contributor Links ===\n")

  const contributors = await sql`SELECT id, slug FROM contributor`
  const contributorBySlug = new Map(contributors.map(c => [c.slug, c.id]))

  const unlinked = await sql`
    SELECT 
      m.id as mixtape_id,
      m.slug as mixtape_slug,
      c->>'name' as contributor_name,
      c->>'slug' as contributor_slug
    FROM mixtape m,
         jsonb_array_elements(m.contributors) as c
    WHERE NOT EXISTS (
      SELECT 1 FROM mixtape_contributor mc WHERE mc.mixtape_id = m.id
    )
  `

  let fixed = 0
  let skipped = 0

  for (const row of unlinked) {
    const mappedSlug = SLUG_MAPPING[row.contributor_slug]
    
    if (mappedSlug) {
      const contributorId = contributorBySlug.get(mappedSlug)
      
      if (contributorId) {
        const existing = await sql`
          SELECT id FROM mixtape_contributor 
          WHERE mixtape_id = ${row.mixtape_id} AND contributor_id = ${contributorId}
        `
        
        if (existing.length === 0) {
          const linkId = generateId("mc")
          await sql`
            INSERT INTO mixtape_contributor (id, mixtape_id, contributor_id, position)
            VALUES (${linkId}, ${row.mixtape_id}, ${contributorId}, 0)
          `
          console.log(`✓ Fixed: ${row.mixtape_slug} -> ${mappedSlug}`)
          fixed++
        }
      } else {
        console.log(`✗ Slug not in DB: ${mappedSlug}`)
      }
    } else {
      console.log(`⏭️ Skipped (no WP match): ${row.contributor_name} (${row.contributor_slug})`)
      skipped++
    }
  }

  console.log(`\n=== Done: Fixed ${fixed}, Skipped ${skipped} ===`)
}

main()
