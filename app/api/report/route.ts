import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {
    const { reporterId, reportedId, reason, details, proofUrl } = await req.json()
    if (!reporterId || !reportedId || !reason) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const { error } = await supabase.from('reports').insert({
      reporter_id: parseInt(reporterId),
      reported_id: parseInt(reportedId),
      reason,
      details: details || null,
      proof_url: proofUrl || null,
      status: 'pending'
    })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const adminId = searchParams.get('adminId')
    if (String(adminId) !== '1241') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { data, error } = await supabase
      .from('reports')
      .select(`
        *,
        reporter:profiles!reporter_id(id, full_name, phone),
        reported:profiles!reported_id(id, full_name, phone, photo_url)
      `)
      .order('created_at', { ascending: false })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ reports: data || [] })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    const { reportId, status, adminId } = await req.json()
    if (String(adminId) !== '1241') return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

    const { error } = await supabase.from('reports')
      .update({ status })
      .eq('id', reportId)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
