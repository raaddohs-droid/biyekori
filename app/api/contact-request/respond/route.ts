import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const getSupabase = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {
    const { requestId, action, userId } = await req.json()
    if (!requestId || !action || !userId) return NextResponse.json({ success: false })

    const supabase = getSupabase()

    await supabase
      .from('contact_requests')
      .update({ status: action, responded_at: new Date().toISOString() })
      .eq('id', requestId)
      .eq('target_id', userId)

    if (action === 'approved') {
      const { data: req_ } = await supabase
        .from('contact_requests')
        .select('requester_id')
        .eq('id', requestId)
        .single()

      const { data: target } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', userId)
        .single()

      if (req_?.requester_id) {
        await supabase.from('notifications').insert([{
          user_id: req_.requester_id,
          type: 'contact_approved',
          message: (target?.full_name || 'Someone') + ' approved your contact request! You can now view their contact details.',
          profile_id: userId,
          is_read: false
        }])
      }
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message })
  }
}
