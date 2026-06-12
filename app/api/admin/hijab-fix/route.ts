import { NextRequest, NextResponse } from 'next/server'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!
const headers = { 'apikey': SERVICE_KEY, 'Authorization': `Bearer ${SERVICE_KEY}`, 'Content-Type': 'application/json', 'Prefer': 'return=minimal' }

const HIJAB_TERMS = ['hijab', 'হিজাব', 'purdah', 'পর্দা', 'niqab', 'নিকাব', 'wear hijab', 'wears hijab', 'full purdah', 'observe purdah', 'i wear hijab', 'pardah']

function hasHijab(text: string) {
  if (!text) return false
  const l = text.toLowerCase()
  return HIJAB_TERMS.some(t => l.includes(t))
}

function removeHijabSentences(text: string) {
  if (!text) return text
  return text.split(/(?<=[।.!\n])/).filter(s => !hasHijab(s)).join('').trim() || null
}

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret')
  if (secret !== 'biyekori-fix-2026' && secret !== process.env.CRON_SECRET) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  let from = 0, fixed = 0, total = 0
  while (true) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/profiles?select=id,about_me,religious_level,partner_preference&gender=eq.female&order=id.asc`, {
      headers: { ...headers, Range: `${from}-${from + 499}` }
    })
    const profiles = await res.json()
    if (!Array.isArray(profiles) || profiles.length === 0) break
    total += profiles.length

    for (const p of profiles) {
      const changes: any = {}
      if (hasHijab(p.religious_level || '')) changes.religious_level = null
      if (hasHijab(p.about_me || '')) changes.about_me = removeHijabSentences(p.about_me)
      if (hasHijab(p.partner_preference || '')) changes.partner_preference = removeHijabSentences(p.partner_preference)
      if (Object.keys(changes).length > 0) {
        await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${p.id}`, { method: 'PATCH', headers, body: JSON.stringify(changes) })
        fixed++
      }
    }
    if (profiles.length < 500) break
    from += 500
  }
  return NextResponse.json({ total, fixed, done: true })
}
