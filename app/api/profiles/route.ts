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
      .order('id', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ profiles })
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch profiles' }, { status: 500 })
  }
}