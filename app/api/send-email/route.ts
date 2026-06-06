import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!
const RESEND_API_KEY = process.env.RESEND_API_KEY!
const EMAIL_FROM = process.env.EMAIL_FROM || 'noreply@biyekori.com'

export async function POST(req: Request) {
  try {
    const { target, subject, body } = await req.json()
    if (!subject || !body) return NextResponse.json({ error: 'Subject and body required' }, { status: 400 })
    if (!RESEND_API_KEY) return NextResponse.json({ error: 'RESEND_API_KEY not configured' }, { status: 500 })

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

    let query = supabase.from('profiles').select('id, full_name, email').not('email', 'is', null).neq('email', '')

    if (target === 'premium') query = query.neq('package', 'prottasha')
    if (target === 'free') query = query.eq('package', 'prottasha')
    if (target === 'inactive') {
      const cutoff = new Date(Date.now() - 7 * 86400000).toISOString()
      query = query.lt('last_active_at', cutoff)
    }

    const { data: profiles, error } = await query.limit(500)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    if (!profiles || profiles.length === 0) return NextResponse.json({ message: 'No users with email found', count: 0 })

    let sent = 0
    let failed = 0

    // Send in batches of 10 to avoid rate limits
    for (let i = 0; i < profiles.length; i += 10) {
      const batch = profiles.slice(i, i + 10)
      await Promise.all(batch.map(async (p: any) => {
        const personalBody = body.replace(/{name}/g, p.full_name || 'সদস্য')
        try {
          const res = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
              from: `Biyekori <${EMAIL_FROM}>`,
              to: p.email,
              subject,
              html: `
                <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:24px">
                  <div style="text-align:center;margin-bottom:24px">
                    <h1 style="color:#e11d48;margin:0;font-size:28px">Biye Kori</h1>
                    <p style="color:#9ca3af;margin:4px 0 0;font-size:13px">বিয়ে করি — AI Matrimony</p>
                  </div>
                  <div style="background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:24px;color:#111827;font-size:15px;line-height:1.7">
                    ${personalBody}
                  </div>
                  <p style="text-align:center;margin-top:20px;font-size:12px;color:#9ca3af">
                    Biyekori · <a href="https://biyekori.com" style="color:#e11d48">biyekori.com</a><br>
                    <a href="https://biyekori.com/unsubscribe?email=${encodeURIComponent(p.email)}" style="color:#9ca3af">Unsubscribe</a>
                  </p>
                </div>
              `
            })
          })
          if (res.ok) sent++
          else failed++
        } catch(e) { failed++ }
      }))
      // Small delay between batches
      if (i + 10 < profiles.length) await new Promise(r => setTimeout(r, 200))
    }

    return NextResponse.json({ message: `Sent to ${sent} users. Failed: ${failed}.`, count: sent })
  } catch(e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
