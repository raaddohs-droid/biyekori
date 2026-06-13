import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import webpush from 'web-push'

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

webpush.setVapidDetails(
  'mailto:support@biyekori.com',
  process.env.VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const { userId, title, body, url } = await req.json()

    const { data: sub } = await sb
      .from('push_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (!sub) return NextResponse.json({ error: 'No subscription' }, { status: 404 })

    const subscription = {
      endpoint: sub.endpoint,
      keys: { p256dh: sub.p256dh, auth: sub.auth }
    }

    await webpush.sendNotification(subscription, JSON.stringify({
      title: title || 'বিয়েকরি',
      body: body || 'আপনার জন্য নতুন আপডেট',
      url: url || '/dashboard'
    }))

    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
