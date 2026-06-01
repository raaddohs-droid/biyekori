import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const getSupabase = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId')
    const profileId = searchParams.get('profileId')

    if (!userId || !profileId) return NextResponse.json({ status: null })

    const supabase = getSupabase()

    // Check if current user sent a request
    const { data: sent } = await supabase
      .from('contact_requests')
      .select('id, status')
      .eq('requester_id', userId)
      .eq('target_id', profileId)
      .single()

    // Check if current user received a request
    const { data: received } = await supabase
      .from('contact_requests')
      .select('id, status')
      .eq('requester_id', profileId)
      .eq('target_id', userId)
      .single()

    // Get profile contact if approved
    let contact = null
    if ((sent?.status === 'approved') || (received?.status === 'approved')) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('phone, email, full_name')
        .eq('id', profileId)
        .single()
      contact = profile

      // Log view
      await supabase.from('contact_requests')
        .update({ viewed_at: new Date().toISOString() })
        .eq('requester_id', userId)
        .eq('target_id', profileId)
    }

    return NextResponse.json({
      sent: sent || null,
      received: received || null,
      contact: contact
    })
  } catch (err: any) {
    return NextResponse.json({ status: null, error: err.message })
  }
}
