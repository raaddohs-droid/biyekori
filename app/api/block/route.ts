import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {
    const { blockerId, blockedId } = await req.json()
    if (!blockerId || !blockedId) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    if (blockerId === blockedId) return NextResponse.json({ error: 'Cannot block yourself' }, { status: 400 })

    const { error } = await supabase.from('blocks').insert({
      blocker_id: parseInt(blockerId),
      blocked_id: parseInt(blockedId)
    })

    if (error) {
      if (error.code === '23505') return NextResponse.json({ success: true, alreadyBlocked: true })
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const { blockerId, blockedId } = await req.json()
    await supabase.from('blocks')
      .delete()
      .eq('blocker_id', parseInt(blockerId))
      .eq('blocked_id', parseInt(blockedId))
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const blockerId = searchParams.get('blockerId')
    const blockedId = searchParams.get('blockedId')
    if (!blockerId || !blockedId) return NextResponse.json({ isBlocked: false })

    const { data } = await supabase.from('blocks')
      .select('id')
      .eq('blocker_id', parseInt(blockerId))
      .eq('blocked_id', parseInt(blockedId))
      .maybeSingle()

    return NextResponse.json({ isBlocked: !!data })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
