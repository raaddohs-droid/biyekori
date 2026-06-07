// app/api/cron/monthly-refresh/route.ts
// Call this from Vercel Cron on 1st of each month at 9am BD time (3am UTC)
// Vercel cron config in vercel.json: { "crons": [{ "path": "/api/cron/monthly-refresh", "schedule": "0 3 1 * *" }] }

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: Request) {
  // Security: only Vercel cron or admin can call this
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Fetch all active profiles with phone numbers
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name, phone, package, city, gender, created_at')
      .not('phone', 'is', null)
      .neq('phone', '')
      .eq('is_banned', false)
      .limit(500)

    if (!profiles || profiles.length === 0) {
      return NextResponse.json({ message: 'No profiles found' })
    }

    let sent = 0
    let failed = 0

    for (const p of profiles) {
      // Skip NRB profiles (no BD number)
      if (!p.phone?.startsWith('880')) continue

      const firstName = p.full_name?.split(' ')[0] || 'সদস্য'
      const pkg = p.package || 'prottasha'

      // Tailor message by package
      let message = ''
      if (pkg === 'prottasha') {
        message = `বিয়েকরি: ${firstName}, নতুন মাস শুরু! আপনার ৩টি বিনামূল্যে interest রিফ্রেশ হয়েছে। এই মাসে নতুন ম্যাচ আসছে। biyekori.com`
      } else if (pkg === 'silver') {
        message = `বিয়েকরি: ${firstName}, আপনার Silver মাসিক ১০টি interest রিফ্রেশ হয়েছে। নতুন প্রোফাইল দেখুন। biyekori.com`
      } else {
        message = `বিয়েকরি: ${firstName}, নতুন মাস শুরু! আপনার Premium সুবিধা চালু আছে। নতুন ম্যাচ দেখুন। biyekori.com`
      }

      try {
        const res = await fetch('https://api.bulksmsbd.net/api/smsapi', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            api_key: process.env.BULKSMS_API_KEY,
            senderid: process.env.BULKSMS_SENDER_ID,
            number: p.phone,
            message
          })
        })
        if (res.ok) sent++
        else failed++
      } catch(e) { failed++ }

      // Small delay to avoid rate limiting
      await new Promise(r => setTimeout(r, 100))
    }

    return NextResponse.json({
      success: true,
      message: `Monthly refresh SMS sent: ${sent} success, ${failed} failed`,
      sent, failed
    })
  } catch(err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
