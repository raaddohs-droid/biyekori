import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const getSupabase = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// POST: send DOB request or respond to one
export async function POST(req: Request) {
  try {
    const supabase = getSupabase()
    const body = await req.json()
    const { action, requesterId, profileId, notificationId } = body

    if (action === 'request') {
      // Check mutual interest exists
      const { data: sentInterest } = await supabase
        .from('interests').select('id').eq('sender_id', requesterId).eq('receiver_id', profileId).eq('status', 'accepted').single()
      const { data: receivedInterest } = await supabase
        .from('interests').select('id').eq('sender_id', profileId).eq('receiver_id', requesterId).eq('status', 'accepted').single()

      if (!sentInterest && !receivedInterest) {
        return NextResponse.json({ error: 'No mutual interest found' }, { status: 403 })
      }

      // Check if already requested (look for existing dob_request notification)
      const { data: existing } = await supabase
        .from('notifications')
        .select('id')
        .eq('user_id', profileId)
        .eq('type', 'dob_request')
        .ilike('message', `%[REQ:${requesterId}]%`)
        .single()

      if (existing) return NextResponse.json({ success: true, alreadySent: true })

      const { data: requester } = await supabase.from('profiles').select('full_name').eq('id', requesterId).single()

      await supabase.from('notifications').insert({
        user_id: profileId,
        type: 'dob_request',
        message: `${requester?.full_name || 'Someone'} has requested to see your date of birth. [REQ:${requesterId}]`,
        is_read: false,
      })

      return NextResponse.json({ success: true })
    }

    if (action === 'grant' || action === 'decline') {
      // Mark notification as read
      await supabase.from('notifications').update({ is_read: true }).eq('id', notificationId)

      if (action === 'grant') {
        const { data: ownerProfile } = await supabase.from('profiles').select('full_name, date_of_birth').eq('id', profileId).single()
        const dob = ownerProfile?.date_of_birth || ''

        await supabase.from('notifications').insert({
          user_id: requesterId,
          type: 'dob_granted',
          message: `${ownerProfile?.full_name || 'Your match'} shared their date of birth: ${dob ? new Date(dob).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : 'not specified'}. [GRANT:${profileId}:${dob}]`,
          is_read: false,
        })
      } else {
        const { data: ownerProfile } = await supabase.from('profiles').select('full_name').eq('id', profileId).single()
        await supabase.from('notifications').insert({
          user_id: requesterId,
          type: 'dob_declined',
          message: `${ownerProfile?.full_name || 'Your match'} did not share their date of birth at this time. [DECLINE:${profileId}]`,
          is_read: false,
        })
      }

      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// GET: check DOB request status
export async function GET(req: Request) {
  try {
    const supabase = getSupabase()
    const { searchParams } = new URL(req.url)
    const requesterId = searchParams.get('requesterId')
    const profileId = searchParams.get('profileId')

    if (!requesterId || !profileId) return NextResponse.json({ status: 'none' })

    // Check if grant notification exists for requester
    const { data: grant } = await supabase
      .from('notifications')
      .select('message')
      .eq('user_id', requesterId)
      .eq('type', 'dob_granted')
      .ilike('message', `%[GRANT:${profileId}:%`)
      .single()

    if (grant) {
      const match = grant.message.match(/\[GRANT:[^:]+:([^\]]*)\]/)
      const dob = match ? match[1] : null
      return NextResponse.json({ status: 'granted', date_of_birth: dob })
    }

    // Check if declined
    const { data: declined } = await supabase
      .from('notifications')
      .select('id')
      .eq('user_id', requesterId)
      .eq('type', 'dob_declined')
      .ilike('message', `%[DECLINE:${profileId}]%`)
      .single()

    if (declined) return NextResponse.json({ status: 'declined' })

    // Check if request was sent
    const { data: request } = await supabase
      .from('notifications')
      .select('id')
      .eq('user_id', profileId)
      .eq('type', 'dob_request')
      .ilike('message', `%[REQ:${requesterId}]%`)
      .single()

    if (request) return NextResponse.json({ status: 'pending' })

    return NextResponse.json({ status: 'none' })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
