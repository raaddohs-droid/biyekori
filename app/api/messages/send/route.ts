import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const getSupabase = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {
    const { senderId, receiverId, content } = await req.json()
    if (!senderId || !receiverId || !content?.trim()) {
      return NextResponse.json({ success: false, message: 'Missing fields' })
    }

    const supabase = getSupabase()

    // Check sender is premium
    const { data: sender } = await supabase
      .from('profiles')
      .select('package')
      .eq('id', senderId)
      .single()

    const isPaid = sender?.package && sender.package !== 'prottasha'

    if (!isPaid) {
      return NextResponse.json({ success: false, upgrade: true, message: 'Upgrade to send messages' })
    }

    // Insert message
    const { error } = await supabase
      .from('messages')
      .insert([{
        sender_id: senderId,
        receiver_id: receiverId,
        content: content.trim(),
        is_read: false,
        created_at: new Date().toISOString()
      }])

    if (error) return NextResponse.json({ success: false, message: error.message })

    // Create notification for receiver
    const { data: senderProfile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', senderId)
      .single()

    await supabase.from('notifications').insert([{
      user_id: receiverId,
      type: 'new_message',
      message: (senderProfile?.full_name || 'Someone') + ' sent you a message',
      profile_id: senderId,
      is_read: false
    }])

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message })
  }
}
