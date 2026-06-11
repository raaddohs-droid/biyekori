import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY

    const supabase = createClient(url!, key!)

    // No filters at all - just get any 3 profiles and show raw data
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, age, district, photo_url, gender')
      .limit(3)

    if (error) {
      return NextResponse.json({ debug: 'error', error: error.message })
    }

    return NextResponse.json({ debug: 'ok', count: data?.length, sample: data })
  } catch (err: any) {
    return NextResponse.json({ debug: 'exception', error: err.message })
  }
}
