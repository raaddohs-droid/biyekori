// Run from ~/biyekori: node --env-file=.env.local scripts/fix-male-additional-photos.mjs
// Re-uploads additional photos for male batch 4 folders and patches additional_photos in DB

import fs from 'fs'
import path from 'path'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Missing env vars. Run with: node --env-file=.env.local')
  process.exit(1)
}

const H = {
  'Authorization': `Bearer ${SERVICE_KEY}`,
  'apikey': SERVICE_KEY,
  'Content-Type': 'application/json',
  'Prefer': 'return=minimal'
}

const BATCH_DIR = path.join(process.cwd(), 'Male Batch 3')
const BASE_URL = `${SUPABASE_URL}/storage/v1/object/public/profile-photos`

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
  return `${BASE_URL}/${storageName}`
}

async function patchProfile(id, additionalUrls) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${id}`, {
    method: 'PATCH',
    headers: H,
    body: JSON.stringify({ additional_photos: additionalUrls })
  })
  if (!res.ok) throw new Error(`PATCH failed: ${res.status} ${await res.text()}`)
}

// Fetch current profile to get photo_url so we know which profile matched which folder
async function getProfile(id) {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/profiles?id=eq.${id}&select=id,photo_url,additional_photos`,
    { headers: { 'Authorization': `Bearer ${SERVICE_KEY}`, 'apikey': SERVICE_KEY } }
  )
  const data = await res.json()
  return data[0]
}

function isImageFile(fname) {
  return /\.(jpg|jpeg|png|webp)$/i.test(fname)
}

async function main() {
  console.log('=== Fix Male Batch 4 Additional Photos ===\n')

  // Discover all folders
  const entries = fs.readdirSync(BATCH_DIR)
  const folders = entries.filter(f => {
    const full = path.join(BATCH_DIR, f)
    return fs.statSync(full).isDirectory()
  })

  console.log(`Found ${folders.length} folders\n`)

  // For each folder, get sorted files — first is main, rest are additional
  let fixed = 0, skipped = 0, errors = 0

  for (const folderName of folders) {
    const folderPath = path.join(BATCH_DIR, folderName)
    const files = fs.readdirSync(folderPath).filter(f => isImageFile(f)).sort()

    if (files.length < 2) {
      console.log(`${folderName}: only ${files.length} photo — skip`)
      skipped++
      continue
    }

    const additionalFiles = files.slice(1) // skip first (main)
    const folderId = 'F_' + folderName.replace(/[^a-zA-Z0-9_-]/g, '_')

    // Find the profile that has photo_url matching this folder's main photo storage name
    const mainStorageName = `mb4_${folderId}_main${path.extname(files[0])}`
    const mainUrl = `${BASE_URL}/${mainStorageName}`

    // Look up which profile has this main photo
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/profiles?photo_url=eq.${encodeURIComponent(mainUrl)}&select=id,additional_photos`,
      { headers: { 'Authorization': `Bearer ${SERVICE_KEY}`, 'apikey': SERVICE_KEY } }
    )
    const matches = await res.json()

    if (!matches || !matches.length) {
      console.log(`${folderName}: no profile found with main photo URL — skip`)
      skipped++
      continue
    }

    const profile = matches[0]
    process.stdout.write(`${folderName} → profile ${profile.id}: uploading ${additionalFiles.length} additional... `)

    try {
      const additionalUrls = []
      for (let j = 0; j < additionalFiles.length; j++) {
        const addName = `mb4_${folderId}_add${j + 1}${path.extname(additionalFiles[j])}`
        const url = await uploadPhoto(path.join(folderPath, additionalFiles[j]), addName)
        additionalUrls.push(url)
      }

      await patchProfile(profile.id, additionalUrls)
      console.log(`✓ ${additionalUrls.length} photos set`)
      fixed++
    } catch(e) {
      console.log(`✗ ERROR: ${e.message}`)
      errors++
    }

    await new Promise(r => setTimeout(r, 200))
  }

  console.log(`\n=== Done ===`)
  console.log(`Fixed: ${fixed} | Skipped: ${skipped} | Errors: ${errors}`)
}

main()
