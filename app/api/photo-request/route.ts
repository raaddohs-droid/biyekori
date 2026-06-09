import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const { requesterId, requestedId } = await req.json()
    if (!requesterId || !requestedId) return NextResponse.json({ error: 'Missing IDs' }, { status: 400 })

    // Insert photo request (ignore if already exists)
    const { error } = await supabase
      .from('photo_requests')
      .upsert({ requester_id: requesterId, requested_id: requestedId }, { onConflict: 'requester_id,requested_id' })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // Get requester name
    const { data: requester } = await supabase
      .from('profiles')
      .select('full_name, age, city')
      .eq('id', requesterId)
      .single()

    // Get requested profile email
    const { data: requested } = await supabase
      .from('profiles')
      .select('email, full_name')
      .eq('id', requestedId)
      .single()

    // Send in-app notification
    await supabase.from('notifications').insert({
      user_id: requestedId,
      type: 'photo_request',
      message: `${requester?.full_name?.split(' ')[0] || 'Someone'} (${requester?.age} yrs, ${requester?.city}) has requested your photo.`,
      link: `/profile/${requesterId}`
    })

    // Send email if real email exists
    if (requested?.email && !requested.email.includes('biyekori.test')) {
      try {
        const resend = new Resend(process.env.RESEND_API_KEY!)
        await resend.emails.send({
          from: 'Biyekori <noreply@biyekori.com>',
          to: requested.email,
          subject: 'Someone wants to see your photo on Biyekori',
          html: `
            <div style="font-family:Georgia,serif;max-width:500px;margin:0 auto;padding:24px;">
              <h2 style="color:#DB2777;">Photo Request</h2>
              <p>Hi ${requested.full_name?.split(' ')[0] || 'there'},</p>
              <p><strong>${requester?.full_name?.split(' ')[0] || 'Someone'}</strong> 
              (${requester?.age} yrs, ${requester?.city}) has requested to see your photo on Biyekori.</p>
              <p>Log in to your account to upload or share your photo.</p>
              <a href="https://biyekori.com/edit-profile" 
                style="display:inline-block;padding:12px 24px;background:#DB2777;color:white;text-decoration:none;border-radius:8px;margin-top:16px;">
                Upload Photo
              </a>
              <p style="color:#9ca3af;font-size:12px;margin-top:24px;">Biyekori — Bangladesh AI Matrimony</p>
            </div>
          `
        })
      } catch(e) {
        // Email failed — not critical
      }
    }

    return NextResponse.json({ success: true })
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
