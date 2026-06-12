import { NextRequest, NextResponse } from 'next/server'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!
const H = { 'Authorization': `Bearer ${SERVICE_KEY}`, 'apikey': SERVICE_KEY, 'Content-Type': 'application/json' }

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret')
  if (secret !== 'biyekori-fix-2026') return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const res = await fetch(`${SUPABASE_URL}/rest/v1/profiles?select=id,religion,nrb_country&gender=eq.female&photo_url=is.null&limit=1000`, {
    headers: { ...H, 'Prefer': 'count=exact' }
  })
  const data = await res.json()
  const contentRange = res.headers.get('content-range')
  
  const total = Array.isArray(data) ? data.length : 0
  const hindu = Array.isArray(data) ? data.filter((p:any) => p.religion?.toLowerCase() === 'hindu').length : 0
  const nrb = Array.isArray(data) ? data.filter((p:any) => p.nrb_country).length : 0
  const muslim = total - hindu - nrb

  return NextResponse.json({ 
    total_null_photo_females: total,
    content_range: contentRange,
    breakdown: { muslim, hindu, nrb }
  })
}
