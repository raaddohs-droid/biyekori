import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const gender = searchParams.get('gender') === 'Male' ? 'Male' : 'Female'

    // Try with photo only first - no completion or last_active filter
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, age, district, photo_url, gender')
      .eq('gender', gender)
      .not('photo_url', 'is', null)
      .not('photo_url', 'eq', '')
      .limit(60)

    if (error) {
      console.error('live-activity error:', error.message)
      return NextResponse.json({ profiles: [] }, {
        headers: { 'Access-Control-Allow-Origin': '*' }
      })
    }

    const shuffled = (data || []).sort(() => Math.random() - 0.5)

    return NextResponse.json({ profiles: shuffled }, {
      headers: { 'Access-Control-Allow-Origin': '*' }
    })
  } catch (err) {
    console.error('live-activity error:', err)
    return NextResponse.json({ profiles: [] }, {
      headers: { 'Access-Control-Allow-Origin': '*' }
    })
  }
}
