import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const getSupabase = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId')
    if (!userId) return NextResponse.json({ notifications: [] })

    const supabase = getSupabase()

    const { data: notifs } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20)

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)

    const { count: viewsToday } = await supabase
      .from('profile_views')
      .select('*', { count: 'exact', head: true })
      .eq('viewed_profile_id', userId)
      .gte('created_at', today.toISOString())

    const { count: viewsWeek } = await supabase
      .from('profile_views')
      .select('*', { count: 'exact', head: true })
      .eq('viewed_profile_id', userId)
      .gte('created_at', weekAgo.toISOString())

    const viewNotifs = []
    if ((viewsToday || 0) > 0) {
      viewNotifs.push({
        id: 'views-today',
        type: 'profile_view',
        message: `${viewsToday} ${viewsToday === 1 ? 'person' : 'people'} viewed your profile today`,
        is_read: false,
        created_at: new Date().toISOString()
      })
    } else if ((viewsWeek || 0) > 0) {
      viewNotifs.push({
        id: 'views-week',
        type: 'profile_view',
        message: `${viewsWeek} ${viewsWeek === 1 ? 'person' : 'people'} viewed your profile this week`,
        is_read: true,
        created_at: new Date().toISOString()
      })
    }

    const all = [...viewNotifs, ...(notifs || [])]
    const unreadCount = all.filter((n: any) => !n.is_read).length

    return NextResponse.json({ notifications: all, unreadCount })
  } catch (err: any) {
    return NextResponse.json({ notifications: [], unreadCount: 0 })
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = await req.json()
    if (!userId) return NextResponse.json({ success: false })
    await getSupabase()
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false)
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ success: false })
  }
}
