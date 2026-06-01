import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const getSupabase = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {
    const { userId, updates } = await req.json()
    if (!userId || !updates) return NextResponse.json({ success: false, message: 'Missing fields' })

    const { error } = await getSupabase()
      .from('profiles')
      .update(updates)
      .eq('id', userId)

    if (error) return NextResponse.json({ success: false, message: error.message })

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message })
  }
}
