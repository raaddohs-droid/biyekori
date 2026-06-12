// Run from ~/biyekori: node scripts/upload-batch8.mjs
import fs from 'fs'
import path from 'path'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Missing env vars. Run: npx vercel env pull .env.local first')
  process.exit(1)
}

const H = { 'Authorization': `Bearer ${SERVICE_KEY}`, 'apikey': SERVICE_KEY, 'Content-Type': 'application/json' }

async function fetchProfiles() {
  const profiles = []
  let offset = 0
  while (true) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/profiles?select=id,age,religion,district,nrb_country&gender=eq.female&photo_url=is.null&order=id.asc&limit=200&offset=${offset}`, { headers: H })
    const batch = await res.json()
    profiles.push(...batch)
    if (batch.length < 200) break
    offset += 200
  }
  return profiles
}

async function uploadPhoto(filePath, storageName) {
  const data = fs.readFileSync(filePath)
  const res = await fetch(`${SUPABASE_URL}/storage/v1/object/profile-photos/${storageName}`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${SERVICE_KEY}`, 'apikey': SERVICE_KEY, 'Content-Type': 'image/jpeg', 'x-upsert': 'true' },
    body: data
  })
  if (!res.ok) throw new Error(`Upload failed: ${res.status} ${await res.text()}`)
  return `${SUPABASE_URL}/storage/v1/object/public/profile-photos/${storageName}`
}

async function patchProfile(id, data) {
  await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${id}`, {
    method: 'PATCH',
    headers: { ...H, 'Prefer': 'return=minimal' },
    body: JSON.stringify(data)
  })
}

function pickByAge(pool, targetAge, usedIds) {
  const avail = pool.filter(p => !usedIds.has(p.id))
  if (!avail.length) return null
  let best = avail[0], bestDiff = Math.abs((best.age || 25) - targetAge)
  for (const p of avail.slice(0, 30)) {
    const diff = Math.abs((p.age || 25) - targetAge)
    if (diff < bestDiff) { best = p; bestDiff = diff }
  }
  return best
}

// Photo characteristics (from Vision analysis)
const photoMeta = {
  // [photoId]: { age_min, age_max, hijab, religion_hint, nrb, district_hint }
  L001:{age_min:21,age_max:23,hijab:false,religion_hint:'muslim',nrb:false},
  L002:{age_min:20,age_max:22,hijab:false,religion_hint:'muslim',nrb:true},
  L003:{age_min:28,age_max:32,hijab:false,religion_hint:'muslim',nrb:false},
  L004:{age_min:26,age_max:30,hijab:true,religion_hint:'muslim',nrb:false},
  L005:{age_min:18,age_max:21,hijab:false,religion_hint:'muslim',nrb:false},
  L006:{age_min:19,age_max:22,hijab:false,religion_hint:'muslim',nrb:false},
  L007:{age_min:20,age_max:23,hijab:false,religion_hint:'hindu',nrb:false},
  L008:{age_min:22,age_max:26,hijab:false,religion_hint:'muslim',nrb:false},
  L009:{age_min:18,age_max:21,hijab:false,religion_hint:'muslim',nrb:false},
  L010:{age_min:20,age_max:24,hijab:false,religion_hint:'muslim',nrb:false},
  L011:{age_min:20,age_max:24,hijab:true,religion_hint:'muslim',nrb:false},
  L012:{age_min:19,age_max:22,hijab:false,religion_hint:'muslim',nrb:false},
  L013:{age_min:24,age_max:28,hijab:true,religion_hint:'muslim',nrb:false},
  L014:{age_min:26,age_max:30,hijab:true,religion_hint:'muslim',nrb:false},
  L015:{age_min:21,age_max:25,hijab:true,religion_hint:'muslim',nrb:false},
  L016:{age_min:19,age_max:23,hijab:false,religion_hint:'muslim',nrb:false},
  L017:{age_min:23,age_max:27,hijab:false,religion_hint:'muslim',nrb:false},
  L018:{age_min:20,age_max:24,hijab:false,religion_hint:'muslim',nrb:false},
  L019:{age_min:28,age_max:33,hijab:false,religion_hint:'muslim',nrb:false},
  L020:{age_min:26,age_max:30,hijab:false,religion_hint:'muslim',nrb:false},
  L021:{age_min:20,age_max:23,hijab:false,religion_hint:'muslim',nrb:false},
  L022:{age_min:22,age_max:26,hijab:true,religion_hint:'muslim',nrb:false},
  L023:{age_min:26,age_max:30,hijab:true,religion_hint:'muslim',nrb:false},
  L024:{age_min:28,age_max:33,hijab:true,religion_hint:'muslim',nrb:false},
  L025:{age_min:30,age_max:35,hijab:false,religion_hint:'muslim',nrb:false},
  L026:{age_min:24,age_max:28,hijab:true,religion_hint:'muslim',nrb:false},
  L027:{age_min:23,age_max:27,hijab:true,religion_hint:'muslim',nrb:true},
  L028:{age_min:18,age_max:21,hijab:false,religion_hint:'muslim',nrb:false},
  L029:{age_min:24,age_max:28,hijab:true,religion_hint:'muslim',nrb:false},
  L030:{age_min:20,age_max:24,hijab:false,religion_hint:'hindu',nrb:false},
  L031:{age_min:20,age_max:24,hijab:false,religion_hint:'muslim',nrb:false},
  L032:{age_min:22,age_max:26,hijab:true,religion_hint:'muslim',nrb:false},
  L033:{age_min:22,age_max:25,hijab:false,religion_hint:'muslim',nrb:false},
  L034:{age_min:28,age_max:33,hijab:false,religion_hint:'muslim',nrb:false},
  L035:{age_min:20,age_max:23,hijab:false,religion_hint:'muslim',nrb:false},
  L036:{age_min:24,age_max:28,hijab:true,religion_hint:'muslim',nrb:false},
  L037:{age_min:22,age_max:26,hijab:true,religion_hint:'muslim',nrb:false},
  L038:{age_min:22,age_max:26,hijab:false,religion_hint:'hindu',nrb:false},
  L039:{age_min:24,age_max:28,hijab:false,religion_hint:'hindu',nrb:false},
  L040:{age_min:26,age_max:30,hijab:true,religion_hint:'muslim',nrb:false},
  L041:{age_min:22,age_max:28,hijab:true,religion_hint:'muslim',nrb:false},
  L042:{age_min:26,age_max:30,hijab:true,religion_hint:'muslim',nrb:false},
  L043:{age_min:22,age_max:26,hijab:true,religion_hint:'muslim',nrb:false},
  L044:{age_min:22,age_max:26,hijab:true,religion_hint:'muslim',nrb:false},
  L045:{age_min:24,age_max:28,hijab:false,religion_hint:'muslim',nrb:false},
  L046:{age_min:28,age_max:33,hijab:false,religion_hint:'muslim',nrb:false},
  L047:{age_min:18,age_max:21,hijab:false,religion_hint:'muslim',nrb:false},
  L048:{age_min:20,age_max:24,hijab:true,religion_hint:'muslim',nrb:false},
  L049:{age_min:26,age_max:30,hijab:false,religion_hint:'muslim',nrb:false},
  L050:{age_min:18,age_max:21,hijab:false,religion_hint:'muslim',nrb:false},
  L051:{age_min:19,age_max:22,hijab:false,religion_hint:'muslim',nrb:false},
  L052:{age_min:32,age_max:38,hijab:true,religion_hint:'muslim',nrb:false},
  L053:{age_min:30,age_max:35,hijab:true,religion_hint:'muslim',nrb:true},
  L054:{age_min:20,age_max:23,hijab:false,religion_hint:'hindu',nrb:false},
  L055:{age_min:28,age_max:33,hijab:true,religion_hint:'muslim',nrb:false},
  L056:{age_min:26,age_max:32,hijab:false,religion_hint:'muslim',nrb:true},
  L057:{age_min:26,age_max:30,hijab:true,religion_hint:'muslim',nrb:false},
  L058:{age_min:26,age_max:30,hijab:true,religion_hint:'muslim',nrb:false},
  L059:{age_min:20,age_max:24,hijab:true,religion_hint:'muslim',nrb:false,district_hint:'Rajshahi'},
  L060:{age_min:24,age_max:28,hijab:false,religion_hint:'muslim',nrb:false},
  L061:{age_min:22,age_max:26,hijab:true,religion_hint:'muslim',nrb:false},
  L062:{age_min:18,age_max:22,hijab:false,religion_hint:'muslim',nrb:false},
  L063:{age_min:20,age_max:24,hijab:false,religion_hint:'muslim',nrb:false},
  L064:{age_min:20,age_max:24,hijab:false,religion_hint:'muslim',nrb:false},
  L065:{age_min:19,age_max:22,hijab:false,religion_hint:'muslim',nrb:false},
  L066:{age_min:18,age_max:22,hijab:true,religion_hint:'muslim',nrb:false},
  L067:{age_min:22,age_max:26,hijab:false,religion_hint:'muslim',nrb:false},
  L068:{age_min:20,age_max:24,hijab:false,religion_hint:'muslim',nrb:false},
  L069:{age_min:20,age_max:25,hijab:true,religion_hint:'muslim',nrb:false},
  L070:{age_min:26,age_max:30,hijab:true,religion_hint:'muslim',nrb:false},
  L071:{age_min:22,age_max:26,hijab:false,religion_hint:'muslim',nrb:false},
  L072:{age_min:28,age_max:33,hijab:false,religion_hint:'muslim',nrb:false},
  L073:{age_min:28,age_max:33,hijab:false,religion_hint:'muslim',nrb:false},
  L074:{age_min:22,age_max:26,hijab:false,religion_hint:'muslim',nrb:false},
  L075:{age_min:24,age_max:28,hijab:true,religion_hint:'muslim',nrb:true},
  L076:{age_min:22,age_max:26,hijab:true,religion_hint:'muslim',nrb:false},
  // Folders
  F1:{age_min:26,age_max:32,hijab:false,religion_hint:'muslim',nrb:false,folder:true,main:1},
  f2:{age_min:22,age_max:26,hijab:true,religion_hint:'muslim',nrb:false,folder:true,main:1},
  f3:{age_min:18,age_max:22,hijab:false,religion_hint:'muslim',nrb:false,folder:true,main:2},
  f4:{age_min:24,age_max:28,hijab:false,religion_hint:'hindu',nrb:false,folder:true,main:1},
  f5:{age_min:28,age_max:34,hijab:false,religion_hint:'muslim',nrb:false,folder:true,main:1},
  f6:{age_min:18,age_max:22,hijab:false,religion_hint:'hindu',nrb:false,folder:true,main:1},
  f7:{age_min:26,age_max:32,hijab:false,religion_hint:'muslim',nrb:false,folder:true,main:1},
  f8:{age_min:22,age_max:26,hijab:false,religion_hint:'muslim',nrb:false,folder:true,main:1},
  f9:{age_min:18,age_max:22,hijab:false,religion_hint:'muslim',nrb:false,folder:true,main:1},
  f11:{age_min:20,age_max:24,hijab:false,religion_hint:'muslim',nrb:false,folder:true,main:1},
  f12:{age_min:26,age_max:30,hijab:true,religion_hint:'muslim',nrb:false,folder:true,main:1},
  f13:{age_min:30,age_max:36,hijab:false,religion_hint:'muslim',nrb:false,folder:true,main:1},
  f14:{age_min:20,age_max:24,hijab:true,religion_hint:'muslim',nrb:false,folder:true,main:1},
}

const PHOTO_BASE = 'scripts/batch8_photos'

async function main() {
  console.log('Fetching null-photo female profiles...')
  const allProfiles = await fetchProfiles()
  console.log(`Found ${allProfiles.length} null-photo female profiles`)

  const hinduProfiles = allProfiles.filter(p => p.religion?.toLowerCase() === 'hindu')
  const nrbProfiles = allProfiles.filter(p => p.nrb_country && !['hindu','buddhist'].includes(p.religion?.toLowerCase()||''))
  const muslimProfiles = allProfiles.filter(p => !['hindu','buddhist','christian'].includes(p.religion?.toLowerCase()||'') && !p.nrb_country)

  console.log(`  Hindu: ${hinduProfiles.length}, NRB: ${nrbProfiles.length}, Muslim: ${muslimProfiles.length}`)

  const usedIds = new Set()
  let processed = 0, errors = 0

  const hinduPhotos = new Set(['L007','L030','L038','L039','f4','f6'])
  const nrbPhotos = new Set(['L002','L027','L053','L075','L056'])

  for (const [photoId, meta] of Object.entries(photoMeta)) {
    const midAge = (meta.age_min + meta.age_max) / 2
    let profile

    if (hinduPhotos.has(photoId)) {
      profile = pickByAge(hinduProfiles, midAge, usedIds)
      if (!profile) profile = pickByAge(muslimProfiles, midAge, usedIds)
    } else if (nrbPhotos.has(photoId) && meta.nrb) {
      profile = pickByAge(nrbProfiles, midAge, usedIds)
      if (!profile) profile = pickByAge(muslimProfiles, midAge, usedIds)
    } else {
      // Special: L059 prefer Rajshahi
      if (meta.district_hint) {
        const districtPool = muslimProfiles.filter(p => p.district?.includes(meta.district_hint) && !usedIds.has(p.id))
        profile = districtPool.length ? districtPool[0] : pickByAge(muslimProfiles, midAge, usedIds)
      } else {
        profile = pickByAge(muslimProfiles, midAge, usedIds)
      }
    }

    if (!profile) { console.log(`  SKIP ${photoId}: no matching profile`); continue }
    usedIds.add(profile.id)

    // Determine file path
    let mainPath, additionalPaths = []
    if (meta.folder) {
      const folderPath = path.join(PHOTO_BASE, 'folders', photoId.toLowerCase())
      const files = fs.readdirSync(folderPath).filter(f => f.endsWith('.jpg')).sort()
      const mainIdx = (meta.main || 1) - 1
      mainPath = path.join(folderPath, files[mainIdx])
      additionalPaths = files.filter((_, i) => i !== mainIdx).map(f => path.join(folderPath, f))
    } else {
      mainPath = path.join(PHOTO_BASE, 'loose', `${photoId}.jpg`)
    }

    if (!fs.existsSync(mainPath)) { console.log(`  MISSING ${mainPath}`); continue }

    try {
      const mainUrl = await uploadPhoto(mainPath, `b8_${photoId}_main.jpg`)
      const additionalUrls = []
      for (let i = 0; i < additionalPaths.length; i++) {
        const url = await uploadPhoto(additionalPaths[i], `b8_${photoId}_add${i+1}.jpg`)
        additionalUrls.push(url)
      }
      const updateData = { photo_url: mainUrl }
      if (additionalUrls.length) updateData.additional_photos = additionalUrls
      await patchProfile(profile.id, updateData)
      console.log(`  ✓ ${photoId} → profile ${profile.id} (age ${profile.age}) ${additionalUrls.length ? `+${additionalUrls.length} extra` : ''}`)
      processed++
    } catch (e) {
      console.log(`  ✗ ${photoId}: ${e.message}`)
      errors++
    }
  }

  console.log(`\nDone. Processed: ${processed}, Errors: ${errors}`)
}

main()
