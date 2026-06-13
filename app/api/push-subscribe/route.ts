import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Save push subscription for a user
export async function POST(req: NextRequest) {
  try {
    const { userId, subscription } = await req.json()
    if (!userId || !subscription) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

    const { error } = await sb
      .from('push_subscriptions')
      .upsert({
        user_id: userId,
        endpoint: subscription.endpoint,
        p256dh: subscription.keys?.p256dh,
        auth: subscription.keys?.auth,
        created_at: new Date().toISOString()
      }, { onConflict: 'user_id' })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

// Delete subscription (unsubscribe)
export async function DELETE(req: NextRequest) {
  try {
    const { userId } = await req.json()
    await sb.from('push_subscriptions').delete().eq('user_id', userId)
    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
