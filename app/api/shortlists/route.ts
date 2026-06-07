import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('userId')
  if (!userId) return NextResponse.json({ error: 'Missing userId' }, { status: 400 })
  const { data, error } = await supabase
    .from('shortlists')
    .select('profile_id, created_at, profile:profile_id(id, full_name, photo_url, age, city, district, profession, gender)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ shortlists: data || [] })
}

export async function POST(req: NextRequest) {
  const { userId, profileId } = await req.json()
  if (!userId || !profileId) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  const { error } = await supabase
    .from('shortlists')
    .insert({ user_id: userId, profile_id: profileId })
  if (error && error.code !== '23505') return NextResponse.json({ error: error.message }, { status: 500 })
  // Notify recipient
  await supabase.from('notifications').insert({
    user_id: profileId,
    type: 'shortlisted',
    message: 'Someone shortlisted your profile',
    is_read: false
  }).then(() => {})
  return NextResponse.json({ success: true })
}

export async function DELETE(req: NextRequest) {
  const { userId, profileId } = await req.json()
  if (!userId || !profileId) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  const { error } = await supabase
    .from('shortlists')
    .delete()
    .eq('user_id', userId)
    .eq('profile_id', profileId)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
