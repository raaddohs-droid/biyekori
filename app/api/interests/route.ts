import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { notify } from '@/lib/push-notify'

export async function POST(request: Request) {
  try {
    const { sender_id, receiver_id } = await request.json()

    // Check if interest already sent
    const { data: existing } = await supabase
      .from('interests')
      .select('*')
      .eq('sender_id', sender_id)
      .eq('receiver_id', receiver_id)
      .single()

    if (existing) {
      return NextResponse.json(
        { error: 'Interest already sent to this profile' },
        { status: 400 }
      )
    }

    // Create new interest
    const { data, error } = await supabase
      .from('interests')
      .insert({ sender_id, receiver_id, status: 'pending' })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // Get sender name for notification
    const { data: sender } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', sender_id)
      .single()

    const senderName = sender?.full_name
      ? sender.full_name.split(' ')[0][0] + '*** ' + (sender.full_name.split(' ')[1]?.[0] || '') + '***'
      : 'কেউ'

    // Notify receiver of new interest
    await notify.newInterest(receiver_id, senderName)

    // Check if mutual match (receiver already sent interest to sender)
    const { data: reverse } = await supabase
      .from('interests')
      .select('*')
      .eq('sender_id', receiver_id)
      .eq('receiver_id', sender_id)
      .single()

    if (reverse) {
      // Mutual match! Notify both
      const { data: receiver } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', receiver_id)
        .single()

      const receiverName = receiver?.full_name
        ? receiver.full_name.split(' ')[0][0] + '*** ' + (receiver.full_name.split(' ')[1]?.[0] || '') + '***'
        : 'কেউ'

      await Promise.all([
        notify.mutualMatch(sender_id, receiverName),
        notify.mutualMatch(receiver_id, senderName),
      ])

      return NextResponse.json({ success: true, data, mutual: true })
    }

    return NextResponse.json({ success: true, data, mutual: false })

  } catch (error) {
    return NextResponse.json({ error: 'Failed to send interest' }, { status: 500 })
  }
}
