import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const { requesterId, responderId, action } = await req.json()
    if (!requesterId || !responderId || !['approve', 'decline'].includes(action)) {
      return NextResponse.json({ error: 'Invalid params' }, { status: 400 })
    }

    const status = action === 'approve' ? 'approved' : 'declined'

    const { error } = await supabase
      .from('photo_requests')
      .update({ status, responded_at: new Date().toISOString() })
      .eq('requester_id', requesterId)
      .eq('requested_id', responderId)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // Notify requester of outcome
    const { data: responder } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', responderId)
      .single()

    const firstName = responder?.full_name?.split(' ')[0] || 'Someone'
    const message = action === 'approve'
      ? `${firstName} approved your photo request! Visit their profile to see their photo.`
      : `${firstName} has declined your photo request.`

    await supabase.from('notifications').insert({
      user_id: requesterId,
      type: action === 'approve' ? 'photo_approved' : 'photo_declined',
      message,
      link: action === 'approve' ? `/profile/${responderId}` : null
    })

    return NextResponse.json({ success: true, status })
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const requesterId = searchParams.get('requesterId')
    const requestedId = searchParams.get('requestedId')
    if (!requesterId || !requestedId) return NextResponse.json({ status: null })

    const { data } = await supabase
      .from('photo_requests')
      .select('status, created_at')
      .eq('requester_id', requesterId)
      .eq('requested_id', requestedId)
      .single()

    return NextResponse.json({ status: data?.status || null })
  } catch {
    return NextResponse.json({ status: null })
  }
}
