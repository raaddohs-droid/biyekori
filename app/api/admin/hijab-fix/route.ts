import { NextRequest, NextResponse } from 'next/server'

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
  while (true) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
      headers: { ...headers, 'Range': `${from}-${from + 999}` }
    })
    const data = await res.json()
    if (!Array.isArray(data) || data.length === 0) break
    out.push(...data)
    if (data.length < 1000) break
    from += 1000
  }
  return out
}

async function patch(id: number, body: any) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${id}`, {
    method: 'PATCH', headers, body: JSON.stringify(body)
  })
  return res.ok
}

const HIJAB_TERMS = [
  'hijab', 'হিজাব', 'purdah', 'পর্দা', 'niqab', 'নিকাব',
  'wear hijab', 'wears hijab', 'wearing hijab',
  'hijab পরি', 'hijab পরেন', 'always wear', 'i wear hijab',
  'full purdah', 'observe purdah', 'pardah'
]

function containsHijabTerm(text: string): boolean {
  if (!text) return false
  const lower = text.toLowerCase()
  return HIJAB_TERMS.some(t => lower.includes(t.toLowerCase()))
}

function removeHijabFromText(text: string): string {
  if (!text) return text
  let result = text
  // Remove sentences containing hijab terms
  const sentences = result.split(/(?<=[।.!?\n])/)
  const cleaned = sentences.filter(s => !containsHijabTerm(s))
  result = cleaned.join('').trim()
  // If whole text was about hijab, just empty it
  return result
}

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret')
  if (secret !== 'biyekori-fix-2026' && secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }
  const fix = req.nextUrl.searchParams.get('fix') === 'true' || secret === 'biyekori-fix-2026'

  // Fetch all female profiles
  const profiles = await fetchAll('profiles?select=id,full_name,gender,religious_level,about_me,partner_preference&gender=eq.female&order=id.asc')

  const issues: any[] = []
  const fixes: any[] = []

  for (const p of profiles) {
    const changes: any = {}
    const reasons: string[] = []

    // Check religious_level field
    if (containsHijabTerm(p.religious_level || '')) {
      changes.religious_level = null
      reasons.push(`religious_level: "${p.religious_level}"`)
    }

    // Check about_me field
    if (containsHijabTerm(p.about_me || '')) {
      const cleaned = removeHijabFromText(p.about_me)
      changes.about_me = cleaned || null
      reasons.push(`about_me contained hijab reference`)
    }

    // Check partner_preference field
    if (containsHijabTerm(p.partner_preference || '')) {
      const cleaned = removeHijabFromText(p.partner_preference)
      changes.partner_preference = cleaned || null
      reasons.push(`partner_preference contained hijab reference`)
    }

    if (Object.keys(changes).length > 0) {
      issues.push({ id: p.id, name: p.full_name, reasons })
      if (fix) {
        const ok = await patch(p.id, changes)
        fixes.push({ id: p.id, changes, ok })
      }
    }
  }

  return NextResponse.json({
    totalFemales: profiles.length,
    issuesFound: issues.length,
    issues: issues.slice(0, 200),
    fixed: fix ? fixes.length : 0,
    mode: fix ? 'FIX APPLIED' : 'AUDIT ONLY'
  })
}
