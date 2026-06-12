// Run from ~/biyekori: node scripts/upload-male-batch4.mjs
// Uploads Male Batch 3 new photos (folders m1-m40, M9, male22 + new loose files)
// Skips old male_batch3_N.jpg files (already uploaded)

import fs from 'fs'
import path from 'path'
import { createRequire } from 'module'

const require = createRequire(import.meta.url)

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY

if (!SUPABASE_URL || !SERVICE_KEY || !ANTHROPIC_KEY) {
  console.error('Missing env vars. Run: npx vercel env pull .env.local first')
  process.exit(1)
}

const H = {
  'Authorization': `Bearer ${SERVICE_KEY}`,
  'apikey': SERVICE_KEY,
  'Content-Type': 'application/json'
}

const BATCH_DIR = path.join(process.cwd(), 'Male Batch 3')
const BATCH_PREFIX = 'mb4' // storage prefix to avoid collisions

// ── Supabase helpers ──────────────────────────────────────────────────────────

async function fetchMaleProfiles() {
  const profiles = []
  let offset = 0
  while (true) {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/profiles?select=id,age,religion,district,nrb_country&gender=eq.male&photo_url=is.null&order=id.asc&limit=200&offset=${offset}`,
      { headers: H }
    )
    const batch = await res.json()
    profiles.push(...batch)
    if (batch.length < 200) break
    offset += 200
  }
  return profiles
}

async function uploadPhoto(filePath, storageName) {
  const data = fs.readFileSync(filePath)
  const ext = path.extname(filePath).toLowerCase()
  const mime = ext === '.png' ? 'image/png' : 'image/jpeg'
  const res = await fetch(
    `${SUPABASE_URL}/storage/v1/object/profile-photos/${storageName}`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'apikey': SERVICE_KEY,
        'Content-Type': mime,
        'x-upsert': 'true'
      },
      body: data
    }
  )
  if (!res.ok) throw new Error(`Upload failed: ${res.status} ${await res.text()}`)
  return `${SUPABASE_URL}/storage/v1/object/public/profile-photos/${storageName}`
}

async function patchProfile(id, data) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${id}`, {
    method: 'PATCH',
    headers: { ...H, 'Prefer': 'return=minimal' },
    body: JSON.stringify(data)
  })
  if (!res.ok) throw new Error(`Patch failed: ${res.status} ${await res.text()}`)
}

// ── Claude Vision analysis ────────────────────────────────────────────────────

async function analyzePhoto(filePath) {
  const data = fs.readFileSync(filePath)
  const ext = path.extname(filePath).toLowerCase()
  const mime = ext === '.png' ? 'image/png' : 'image/jpeg'
  const b64 = data.toString('base64')

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 200,
      messages: [{
        role: 'user',
        content: [
          {
            type: 'image',
            source: { type: 'base64', media_type: mime, data: b64 }
          },
          {
            type: 'text',
            text: `Analyze this photo of a Bangladeshi man. Reply ONLY with JSON, no markdown:
{
  "age_min": <estimated minimum age as integer>,
  "age_max": <estimated maximum age as integer>,
  "nrb": <true if strong NRB signals: western interior, foreign skyline, snow, certificates on wall, western clothing style, otherwise false>,
  "nrb_country": <"UK"|"USA"|"Canada"|"Australia"|"Middle East"|null — best guess if nrb is true>,
  "religion_hint": <"muslim"|"hindu"|"other" — hindu signals: tilak/bindi, sacred thread, temple background>,
  "notes": <one short phrase, e.g. "suit, office background" or "kurta, Dhaka street">
}`
          }
        ]
      }]
    })
  })

  if (!res.ok) throw new Error(`Vision API failed: ${res.status}`)
  const result = await res.json()
  const text = result.content?.[0]?.text || '{}'
  try {
    return JSON.parse(text.replace(/```json|```/g, '').trim())
  } catch {
    return { age_min: 22, age_max: 28, nrb: false, nrb_country: null, religion_hint: 'muslim', notes: 'parse error' }
  }
}

// ── Profile matching ──────────────────────────────────────────────────────────

function pickByAge(pool, targetAge, usedIds) {
  const avail = pool.filter(p => !usedIds.has(p.id))
  if (!avail.length) return null
  let best = avail[0]
  let bestDiff = Math.abs((best.age || 25) - targetAge)
  for (const p of avail.slice(0, 30)) {
    const diff = Math.abs((p.age || 25) - targetAge)
    if (diff < bestDiff) { best = p; bestDiff = diff }
  }
  return best
}

// ── File discovery ────────────────────────────────────────────────────────────

function isImageFile(fname) {
  return /\.(jpg|jpeg|png|webp)$/i.test(fname)
}

function isOldFile(fname) {
  // Skip already-uploaded male_batch3_N.jpg files
  return /^male_batch3_\d+\.(jpg|jpeg|png)$/i.test(fname)
}

function discoverPhotos(batchDir) {
  const entries = fs.readdirSync(batchDir)
  const jobs = [] // { id, mainPath, additionalPaths }

  // Loose files (new Facebook-named ones only)
  const looseFiles = entries.filter(f => {
    const full = path.join(batchDir, f)
    return fs.statSync(full).isFile() && isImageFile(f) && !isOldFile(f)
  })

  for (const f of looseFiles) {
    const id = 'L_' + path.basename(f, path.extname(f)).replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 30)
    jobs.push({ id, mainPath: path.join(batchDir, f), additionalPaths: [] })
  }

  // Folder groups
  const folderNames = entries.filter(f => {
    const full = path.join(batchDir, f)
    return fs.statSync(full).isDirectory()
  })

  for (const folderName of folderNames) {
    const folderPath = path.join(batchDir, folderName)
    const files = fs.readdirSync(folderPath)
      .filter(f => isImageFile(f))
      .sort()
    if (!files.length) continue

    const mainFile = files[0]
    const additionalFiles = files.slice(1)
    jobs.push({
      id: 'F_' + folderName.replace(/[^a-zA-Z0-9_-]/g, '_'),
      mainPath: path.join(folderPath, mainFile),
      additionalPaths: additionalFiles.map(f => path.join(folderPath, f))
    })
  }

  return jobs
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log('=== Male Batch 4 Upload ===\n')

  console.log('Fetching null-photo male profiles...')
  const allProfiles = await fetchMaleProfiles()
  console.log(`Found ${allProfiles.length} null-photo male profiles\n`)

  const nrbProfiles = allProfiles.filter(p => p.nrb_country)
  const hinduProfiles = allProfiles.filter(p => p.religion?.toLowerCase() === 'hindu')
  const muslimProfiles = allProfiles.filter(p =>
    !['hindu', 'buddhist', 'christian'].includes(p.religion?.toLowerCase() || '') &&
    !p.nrb_country
  )

  console.log(`  NRB: ${nrbProfiles.length}, Hindu: ${hinduProfiles.length}, Muslim/other: ${muslimProfiles.length}\n`)

  const jobs = discoverPhotos(BATCH_DIR)
  console.log(`Discovered ${jobs.length} photo jobs (loose + folders)\n`)

  const usedIds = new Set()
  let processed = 0, errors = 0, skipped = 0

  for (let i = 0; i < jobs.length; i++) {
    const job = jobs[i]
    process.stdout.write(`[${i + 1}/${jobs.length}] ${job.id} — analyzing... `)

    let meta
    try {
      meta = await analyzePhoto(job.mainPath)
    } catch (e) {
      console.log(`VISION ERROR: ${e.message}`)
      errors++
      continue
    }

    const midAge = ((meta.age_min || 22) + (meta.age_max || 28)) / 2
    console.log(`age ~${midAge}, nrb=${meta.nrb}, hint=${meta.religion_hint}, notes: ${meta.notes}`)

    // Pick profile
    let profile = null
    if (meta.nrb && nrbProfiles.length) {
      profile = pickByAge(nrbProfiles, midAge, usedIds)
      if (!profile) profile = pickByAge(muslimProfiles, midAge, usedIds)
    } else if (meta.religion_hint === 'hindu' && hinduProfiles.length) {
      profile = pickByAge(hinduProfiles, midAge, usedIds)
      if (!profile) profile = pickByAge(allProfiles, midAge, usedIds)
    } else {
      profile = pickByAge(muslimProfiles, midAge, usedIds) || pickByAge(allProfiles, midAge, usedIds)
    }

    if (!profile) {
      console.log(`  SKIP: no profile available`)
      skipped++
      continue
    }
    usedIds.add(profile.id)

    try {
      // Upload main photo
      const storageName = `${BATCH_PREFIX}_${job.id}_main${path.extname(job.mainPath)}`
      const mainUrl = await uploadPhoto(job.mainPath, storageName)

      // Upload additional photos
      const additionalUrls = []
      for (let j = 0; j < job.additionalPaths.length; j++) {
        const addName = `${BATCH_PREFIX}_${job.id}_add${j + 1}${path.extname(job.additionalPaths[j])}`
        const url = await uploadPhoto(job.additionalPaths[j], addName)
        additionalUrls.push(url)
      }

      // Build update payload
      const updateData = { photo_url: mainUrl }
      if (additionalUrls.length) updateData.additional_photos = additionalUrls
      if (meta.nrb && meta.nrb_country && !profile.nrb_country) {
        updateData.nrb_country = meta.nrb_country
      }
      if (meta.religion_hint === 'hindu' && profile.religion?.toLowerCase() !== 'hindu') {
        updateData.religion = 'Hindu'
      }

      await patchProfile(profile.id, updateData)

      const extra = additionalUrls.length ? ` +${additionalUrls.length} extra` : ''
      const nrbTag = meta.nrb ? ` [NRB→${meta.nrb_country}]` : ''
      console.log(`  ✓ → profile ${profile.id} (age ${profile.age})${extra}${nrbTag}`)
      processed++
    } catch (e) {
      console.log(`  ✗ UPLOAD ERROR: ${e.message}`)
      errors++
    }

    // Small delay to avoid hammering Vision API
    await new Promise(r => setTimeout(r, 300))
  }

  console.log(`\n=== Done ===`)
  console.log(`Processed: ${processed} | Errors: ${errors} | Skipped (no profile): ${skipped}`)
  console.log(`Male profiles remaining null: ${allProfiles.length - processed}`)
}

main()
