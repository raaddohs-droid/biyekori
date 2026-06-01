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
    const withUserId = searchParams.get('withUserId')

    if (!userId || !withUserId) {
      return NextResponse.json({ messages: [] })
    }

    const supabase = getSupabase()

    const { data: messages } = await supabase
      .from('messages')
      .select('*')
      .or(`and(sender_id.eq.${userId},receiver_id.eq.${withUserId}),and(sender_id.eq.${withUserId},receiver_id.eq.${userId})`)
      .order('created_at', { ascending: true })

    // Mark received messages as read
    await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('sender_id', withUserId)
      .eq('receiver_id', userId)
      .eq('is_read', false)

    return NextResponse.json({ messages: messages || [] })
  } catch (err: any) {
    return NextResponse.json({ messages: [] })
  }
}
