import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export const revalidate = 300 // cache 5 minutes server-side

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const gender = searchParams.get('gender') === 'Male' ? 'Male' : 'Female'

    // Active within last 30 days
    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, age, district, photo_url, gender')
      .eq('gender', gender)
      .eq('is_banned', false)
      .not('photo_url', 'is', null)
      .not('photo_url', 'eq', '')
      .gte('profile_completion', 70)
      .gte('last_active_at', since)
      .order('last_active_at', { ascending: false })
      .limit(60)

    if (error) {
      console.error('live-activity query error:', error.message)
      return NextResponse.json({ profiles: [] })
    }

    // Shuffle so each page load feels fresh
    const shuffled = (data || []).sort(() => Math.random() - 0.5)

    return NextResponse.json({ profiles: shuffled })
  } catch (err) {
    console.error('live-activity error:', err)
    return NextResponse.json({ profiles: [] })
  }
}
