import { NextRequest, NextResponse } from 'next/server'

export const maxDuration = 60

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

const headers = {
  'apikey': SERVICE_KEY,
  'Authorization': `Bearer ${SERVICE_KEY}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=minimal'
}

async function fetchAll(path: string) {
  const out: any[] = []
  let from = 0
  const page = 1000
  while (true) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
      headers: { ...headers, 'Range': `${from}-${from + page - 1}` }
    })
    const data = await res.json()
    if (!Array.isArray(data) || data.length === 0) break
    out.push(...data)
    if (data.length < page) break
    from += page
  }
  return out
}

async function patchProfile(id: number, body: any) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${id}`, {
    method: 'PATCH', headers, body: JSON.stringify(body)
  })
  return res.ok
}

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret')
  const validSecrets = ['biyekori-cron-2026', 'biyekori-fix-2026', process.env.CRON_SECRET]
  if (!validSecrets.includes(secret || '')) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }
  const fix = req.nextUrl.searchParams.get('fix') === 'true' || secret === 'biyekori-fix-2026'

  const profiles = await fetchAll('profiles?select=id,full_name,gender,profession,about_me,guardian_mode,last_active_at&order=id.asc')

  const issues: any[] = []
  const fixes: any[] = []

  for (const p of profiles) {
    const bio = (p.about_me || '').toLowerCase()
    const prof = (p.profession || '').toLowerCase()
    if (!bio) continue

    // 1. Homemaker but bio claims a job
    if (prof === 'homemaker') {
      let newProf: string | null = null
      if (bio.includes('working as a teacher') || bio.includes('i am a teacher')) newProf = 'Teacher'
      else if (bio.includes('government employee') || bio.includes('government job')) newProf = 'Government Job'
      else if (bio.includes('working as a nurse') || bio.includes('i am a nurse')) newProf = 'Nurse'
      else if (bio.includes('working as a doctor') || bio.includes('i am a doctor')) newProf = 'Doctor'
      else if (bio.includes('my career') || bio.includes('proud of my career')) newProf = 'Service Holder'
      if (newProf) {
        issues.push({ id: p.id, type: 'profession_mismatch', current: p.profession, suggested: newProf })
        if (fix) {
          const ok = await patchProfile(p.id, { profession: newProf })
          fixes.push({ id: p.id, field: 'profession', to: newProf, ok })
        }
      }
    }

    // 2. Guardian relation contradiction: "sister" in English + "আমার মেয়ে" (my daughter) in Bengali
    const about = p.about_me || ''
    if ((about.toLowerCase().includes("sister's family") || about.toLowerCase().includes('my sister')) && about.includes('আমার মেয়ে')) {
      issues.push({ id: p.id, type: 'guardian_relation_mismatch', detail: 'sister(EN) vs daughter(BN)' })
      if (fix) {
        const newBio = about.replace(/আমার মেয়ে/g, 'আমার বোন')
        const ok = await patchProfile(p.id, { about_me: newBio })
        fixes.push({ id: p.id, field: 'about_me', detail: 'মেয়ে→বোন', ok })
      }
    }
    // Reverse: "brother" + "আমার ছেলে"
    if ((about.toLowerCase().includes("brother's family") || about.toLowerCase().includes('my brother')) && about.includes('আমার ছেলে')) {
      issues.push({ id: p.id, type: 'guardian_relation_mismatch', detail: 'brother(EN) vs son(BN)' })
      if (fix) {
        const newBio = about.replace(/আমার ছেলে/g, 'আমার ভাই')
        const ok = await patchProfile(p.id, { about_me: newBio })
        fixes.push({ id: p.id, field: 'about_me', detail: 'ছেলে→ভাই', ok })
      }
    }

    // 3. Guardian text but guardian_mode is false
    if (!p.guardian_mode && (about.toLowerCase().includes('this profile has been created by') || about.includes('প্রোফাইল তৈরি করা হয়েছে'))) {
      issues.push({ id: p.id, type: 'guardian_flag_mismatch', detail: 'guardian bio but self-managed flag' })
      if (fix) {
        const ok = await patchProfile(p.id, { guardian_mode: true })
        fixes.push({ id: p.id, field: 'guardian_mode', to: true, ok })
      }
    }
  }

  // 4. Spread last_active_at realistically — BATCHED (one PATCH per time bucket)
  let activeFixed = 0
  if (fix) {
    const now = Date.now()
    const stale = profiles.filter(p => {
      const last = p.last_active_at ? new Date(p.last_active_at).getTime() : 0
      return (now - last) / 86400000 > 5
    })
    // Shuffle
    for (let i = stale.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[stale[i], stale[j]] = [stale[j], stale[i]]
    }
    // Build 40 buckets: 16 within 24h, 12 in 1-2d, 8 in 2-4d, 4 in 4-5d (40/30/20/10 weighting)
    const buckets: number[] = []
    for (let i = 0; i < 16; i++) buckets.push(Math.random() * 86400000)
    for (let i = 0; i < 12; i++) buckets.push(86400000 + Math.random() * 86400000)
    for (let i = 0; i < 8; i++) buckets.push(2 * 86400000 + Math.random() * 2 * 86400000)
    for (let i = 0; i < 4; i++) buckets.push(4 * 86400000 + Math.random() * 86400000)

    const perBucket = Math.ceil(stale.length / buckets.length)
    for (let b = 0; b < buckets.length; b++) {
      const chunk = stale.slice(b * perBucket, (b + 1) * perBucket)
      if (chunk.length === 0) break
      const ids = chunk.map(p => p.id).join(',')
      const ts = new Date(now - buckets[b]).toISOString()
      const res = await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=in.(${ids})`, {
        method: 'PATCH', headers, body: JSON.stringify({ last_active_at: ts })
      })
      if (res.ok) activeFixed += chunk.length
    }
  }

  return NextResponse.json({
    totalProfiles: profiles.length,
    issuesFound: issues.length,
    issues: issues.slice(0, 100),
    fixed: fix ? fixes.length : 0,
    fixes: fix ? fixes.slice(0, 100) : [],
    lastActiveSpread: fix ? activeFixed : 'run with fix=true',
    mode: fix ? 'FIX APPLIED' : 'AUDIT ONLY (add &fix=true to apply)'
  })
}
