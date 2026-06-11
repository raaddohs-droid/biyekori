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

    // No filters at all - just gender, grab 60
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, age, district, photo_url, gender')
      .eq('gender', gender)
      .limit(60)

    if (error) {
      return NextResponse.json({ profiles: [], error: error.message })
    }

    const shuffled = (data || []).sort(() => Math.random() - 0.5)
    return NextResponse.json({ profiles: shuffled, count: shuffled.length })
  } catch (err: any) {
    return NextResponse.json({ profiles: [], error: err.message })
  }
}
