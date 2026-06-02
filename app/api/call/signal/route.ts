import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const getSupabase = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { type, fromId, toId, data } = body
    const supabase = getSupabase()

    // Verify mutual interest before allowing call signals
    if (type === 'call-offer') {
      const { data: interests } = await supabase
        .from('interests')
        .select('id, status')
        .or(`and(sender_id.eq.${fromId},receiver_id.eq.${toId}),and(sender_id.eq.${toId},receiver_id.eq.${fromId})`)
        .eq('status', 'accepted')

      if (!interests || interests.length === 0) {
        return NextResponse.json({ success: false, message: 'No mutual interest found' })
      }
    }

    // Store signal in call_signals table
    const { error } = await supabase.from('call_signals').insert([{
      type,
      from_id: fromId,
      to_id: toId,
      data: JSON.stringify(data),
      created_at: new Date().toISOString()
    }])

    if (error) return NextResponse.json({ success: false, message: error.message })
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message })
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId')
    const since = searchParams.get('since') || new Date(Date.now() - 30000).toISOString()
    if (!userId) return NextResponse.json({ signals: [] })

    const supabase = getSupabase()
    const { data } = await supabase
      .from('call_signals')
      .select('*')
      .eq('to_id', userId)
      .gte('created_at', since)
      .order('created_at', { ascending: true })

    return NextResponse.json({ signals: data || [] })
  } catch (err: any) {
    return NextResponse.json({ signals: [] })
  }
}
