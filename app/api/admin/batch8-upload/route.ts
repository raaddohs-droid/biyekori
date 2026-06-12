import { NextRequest, NextResponse } from 'next/server'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!
const H = { 'Authorization': `Bearer ${SERVICE_KEY}`, 'apikey': SERVICE_KEY, 'Content-Type': 'application/json' }

async function supaFetch(path: string, opts: any = {}) {
  const res = await fetch(`${SUPABASE_URL}${path}`, { headers: H, ...opts })
  if (!res.ok) throw new Error(`${path} → ${res.status}: ${await res.text()}`)
  return res.json()
}

async function uploadPhoto(b64: string, name: string): Promise<string> {
  const bytes = Buffer.from(b64, 'base64')
  const res = await fetch(`${SUPABASE_URL}/storage/v1/object/profile-photos/${name}`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${SERVICE_KEY}`, 'apikey': SERVICE_KEY, 'Content-Type': 'image/jpeg', 'x-upsert': 'true' },
    body: bytes
  })
  if (!res.ok) throw new Error(`Upload ${name} failed: ${res.status}`)
  return `${SUPABASE_URL}/storage/v1/object/public/profile-photos/${name}`
}

async function patchProfile(id: number, data: any) {
  await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${id}`, {
    method: 'PATCH',
    headers: { ...H, 'Prefer': 'return=minimal' },
    body: JSON.stringify(data)
  })
}

export async function POST(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret')
  if (secret !== 'biyekori-fix-2026') return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const { photos } = await req.json()
  if (!photos) return NextResponse.json({ error: 'no photos' }, { status: 400 })

  // Fetch null-photo female profiles grouped by religion + NRB
  const allProfiles: any[] = []
  let offset = 0
  while (true) {
    const batch = await supaFetch(`/rest/v1/profiles?select=id,age,religion,district,nrb_country&gender=eq.female&photo_url=is.null&order=id.asc&limit=200&offset=${offset}`)
    allProfiles.push(...batch)
    if (batch.length < 200) break
    offset += 200
  }

  const hinduProfiles = allProfiles.filter(p => p.religion?.toLowerCase() === 'hindu')
  const nrbProfiles = allProfiles.filter(p => p.nrb_country && p.religion?.toLowerCase() !== 'hindu')
  const muslimProfiles = allProfiles.filter(p => 
    !['hindu','buddhist','christian'].includes(p.religion?.toLowerCase() || '') && !p.nrb_country
  )

  // Sort by age
  const sortByAge = (a: any, b: any) => (a.age || 25) - (b.age || 25)
  hinduProfiles.sort(sortByAge)
  nrbProfiles.sort(sortByAge)
  muslimProfiles.sort(sortByAge)

  const usedIds = new Set<number>()
  const results: any[] = []

  const pickByAge = (pool: any[], targetAge: number, used: Set<number>) => {
    const avail = pool.filter(p => !used.has(p.id))
    if (!avail.length) return null
    let best = avail[0], bestDiff = Math.abs((best.age || 25) - targetAge)
    for (const p of avail.slice(0, 30)) {
      const diff = Math.abs((p.age || 25) - targetAge)
      if (diff < bestDiff) { best = p; bestDiff = diff }
    }
    return best
  }

  // Define photo groups
  const hinduPhotos = ['L007','L030','L038','L039','f4','f6']
  const nrbPhotos = ['L002','L027','L053','L075']

  const photoEntries = Object.entries(photos) as [string, any][]

  let processed = 0
  for (const [photoId, photo] of photoEntries) {
    const midAge = ((photo.age_min || 20) + (photo.age_max || 30)) / 2
    let profile: any = null

    if (hinduPhotos.includes(photoId) && photo.religion_hint === 'hindu') {
      profile = pickByAge(hinduProfiles, midAge, usedIds)
    } else if (nrbPhotos.includes(photoId) && photo.nrb) {
      profile = pickByAge(nrbProfiles, midAge, usedIds)
    } else {
      // Muslim/general pool - also try NRB pool if exhausted
      profile = pickByAge(muslimProfiles, midAge, usedIds) || pickByAge(nrbProfiles, midAge, usedIds)
    }

    if (!profile) { results.push({ photo: photoId, error: 'no profile available' }); continue }
    usedIds.add(profile.id)

    try {
      // Upload main photo
      const mainUrl = await uploadPhoto(photo.data, `b8_${photoId}_main.jpg`)
      
      // Upload additional photos if folder
      const additionalUrls: string[] = []
      if (photo.additional?.length) {
        for (let i = 0; i < photo.additional.length; i++) {
          const url = await uploadPhoto(photo.additional[i], `b8_${photoId}_add${i+1}.jpg`)
          additionalUrls.push(url)
        }
      }

      // Update profile
      const updateData: any = { photo_url: mainUrl }
      if (additionalUrls.length) updateData.additional_photos = additionalUrls
      // Apply profile overrides (religion, nrb_country etc)
      if (photo.profile_overrides) {
        if (photo.profile_overrides.religion) updateData.religion = photo.profile_overrides.religion
        if (photo.profile_overrides.nrb_country) updateData.nrb_country = photo.profile_overrides.nrb_country
      }
      await patchProfile(profile.id, updateData)
      results.push({ photo: photoId, profile_id: profile.id, profile_age: profile.age, url: mainUrl, additional: additionalUrls.length })
      processed++
    } catch (e: any) {
      results.push({ photo: photoId, profile_id: profile.id, error: e.message })
    }
  }

  return NextResponse.json({ processed, total: photoEntries.length, results })
}
