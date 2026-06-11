import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!url || !key) {
      return NextResponse.json({ profiles: [], debug: 'missing env vars', url: !!url, key: !!key })
    }

    const supabase = createClient(url, key)

    const { data, error, count } = await supabase
      .from('profiles')
      .select('id, full_name, age, district, photo_url, gender', { count: 'exact' })
      .eq('gender', 'Female')
      .limit(5)

    if (error) {
      return NextResponse.json({ profiles: [], debug: 'supabase error', error: error.message, code: error.code })
    }

    return NextResponse.json({ profiles: data || [], count, debug: 'ok' })
  } catch (err: any) {
    return NextResponse.json({ profiles: [], debug: 'exception', error: err.message })
  }
}
