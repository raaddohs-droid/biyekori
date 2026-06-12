// Run from ~/biyekori: node --env-file=.env.local scripts/fix-additional-photos.mjs
// Patches additional_photos column for all batch 8 folder profiles

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
const BASE = `${url}/storage/v1/object/public/profile-photos`

const H = {
  'Authorization': `Bearer ${key}`,
  'apikey': key,
  'Content-Type': 'application/json',
  'Prefer': 'return=minimal'
}

// From batch 8 upload logs: folder → profile_id mapping
const FOLDER_PROFILES = {
  f1:  2083,
  f2:  2160,
  f3:  1740,
  f4:  1724,
  f5:  2186,
  f6:  1766,
  f7:  1491,
  f8:  1691,
  f9:  1786,
  f11: 2089,
  f12: 2106,
  f13: 2130,
  f14: 2135,
}

// From storage listing: folder → additional file names
const FOLDER_ADDS = {
  f1:  ['b8_f1_add1.jpg',  'b8_f1_add2.jpg'],
  f2:  ['b8_f2_add1.jpg',  'b8_f2_add2.jpg', 'b8_f2_add3.jpg', 'b8_f2_add4.jpg', 'b8_f2_add5.jpg'],
  f3:  ['b8_f3_add1.jpg'],
  f4:  ['b8_f4_add1.jpg',  'b8_f4_add2.jpg'],
  f5:  ['b8_f5_add1.jpg'],
  f6:  ['b8_f6_add1.jpg',  'b8_f6_add2.jpg'],
  f7:  ['b8_f7_add1.jpg',  'b8_f7_add2.jpg', 'b8_f7_add3.jpg'],
  f8:  ['b8_f8_add1.jpg'],
  f9:  ['b8_f9_add1.jpg'],
  f11: ['b8_f11_add1.jpg', 'b8_f11_add2.jpg'],
  f12: ['b8_f12_add1.jpg', 'b8_f12_add2.jpg', 'b8_f12_add3.jpg', 'b8_f12_add4.jpg'],
  f13: ['b8_f13_add1.jpg', 'b8_f13_add2.jpg', 'b8_f13_add3.jpg', 'b8_f13_add4.jpg', 'b8_f13_add5.jpg', 'b8_f13_add6.jpg'],
  f14: ['b8_f14_add1.jpg'],
}

async function patch(profileId, additionalUrls) {
  const res = await fetch(`${url}/rest/v1/profiles?id=eq.${profileId}`, {
    method: 'PATCH',
    headers: H,
    body: JSON.stringify({ additional_photos: additionalUrls })
  })
  if (!res.ok) throw new Error(`PATCH ${profileId} failed: ${res.status} ${await res.text()}`)
}

async function main() {
  console.log('=== Fix additional_photos ===\n')
  let fixed = 0, errors = 0

  for (const [folder, profileId] of Object.entries(FOLDER_PROFILES)) {
    const files = FOLDER_ADDS[folder]
    if (!files || !files.length) {
      console.log(`${folder} → profile ${profileId}: no additional files, skipping`)
      continue
    }
    const urls = files.map(f => `${BASE}/${f}`)
    try {
      await patch(profileId, urls)
      console.log(`✓ ${folder} → profile ${profileId}: ${urls.length} photo(s) set`)
      fixed++
    } catch(e) {
      console.log(`✗ ${folder} → profile ${profileId}: ${e.message}`)
      errors++
    }
  }

  console.log(`\nDone. Fixed: ${fixed} | Errors: ${errors}`)
}

main()
