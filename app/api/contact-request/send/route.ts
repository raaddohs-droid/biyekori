import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const getSupabase = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {
    const { requesterId, targetId } = await req.json()
    if (!requesterId || !targetId) return NextResponse.json({ success: false, message: 'Missing fields' })

    const supabase = getSupabase()

    // Check requester is paid
    const { data: requester } = await supabase
      .from('profiles')
      .select('package, full_name')
      .eq('id', requesterId)
      .single()

    const isPaid = requester?.package && requester.package !== 'prottasha'
    if (!isPaid) return NextResponse.json({ success: false, upgrade: true, message: 'Upgrade to request contact details' })

    // Check if request already exists
    const { data: existing } = await supabase
      .from('contact_requests')
      .select('id, status')
      .eq('requester_id', requesterId)
      .eq('target_id', targetId)
      .single()

    if (existing) {
      if (existing.status === 'approved') return NextResponse.json({ success: false, message: 'Already approved', alreadyApproved: true })
      if (existing.status === 'pending') return NextResponse.json({ success: false, message: 'Request already sent', alreadySent: true })
    }

    // Create request
    await supabase.from('contact_requests').insert([{
      requester_id: requesterId,
      target_id: targetId,
      status: 'pending'
    }])

    // Notify target
    await supabase.from('notifications').insert([{
      user_id: targetId,
      type: 'contact_request',
      message: (requester?.full_name || 'Someone') + ' wants to exchange contact details with you',
      profile_id: requesterId,
      is_read: false
    }])

    return NextResponse.json({ success: true, message: 'Contact request sent' })
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message })
  }
}
