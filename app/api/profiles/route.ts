import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('is_banned', false)
      .order('id', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // NOOB BOOST: new profiles (< 7 days old) get injected near top
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    const noobs = profiles?.filter((p: any) => {
      const created = new Date(p.created_at || 0)
      return created > sevenDaysAgo && p.photo_url // only boosted if has photo
    }) || []
    const rest = profiles?.filter((p: any) => {
      const created = new Date(p.created_at || 0)
      return created <= sevenDaysAgo || !p.photo_url
    }) || []

    // Inject noobs at positions 2, 5, 9 for natural feel
    const boosted: any[] = []
    let noobIdx = 0
    const insertAt = new Set([2, 5, 9])
    for (let i = 0; i < rest.length; i++) {
      if (insertAt.has(i) && noobIdx < noobs.length) {
        boosted.push({ ...noobs[noobIdx++], _noob_boosted: true })
      }
      boosted.push(rest[i])
    }
    // Append any remaining noobs at end
    while (noobIdx < noobs.length) boosted.push({ ...noobs[noobIdx++], _noob_boosted: true })

    return NextResponse.json({ profiles: boosted })
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch profiles' }, { status: 500 })
  }
}
