import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const getSupabase = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

function calculateCompletion(u: any): number {
  const checks = [
    // Core (high value)
    { met: !!u.photo_url, points: 15 },
    { met: (u.about_me?.length || 0) > 30, points: 10 },
    { met: !!u.education && !!u.profession, points: 10 },
    { met: !!u.religion, points: 8 },
    { met: !!u.phone_verified, points: 5 },
    { met: !!u.height, points: 5 },
    // New fields
    { met: !!u.college_attended, points: 5 },
    { met: !!u.working_with || !!u.employer_name, points: 5 },
    { met: !!u.residency_status, points: 3 },
    { met: !!u.community, points: 3 },
    { met: !!u.father_profession || !!u.mother_profession, points: 8 },
    { met: u.num_sisters !== null && u.num_sisters !== undefined, points: 3 },
    { met: !!u.family_financial_status, points: 3 },
    // Lifestyle
    { met: !!u.marriage_timeline, points: 5 },
    { met: !!u.living_arrangement || !!u.family_values, points: 3 },
    { met: !!u.hobbies, points: 4 },
    // Partner prefs
    { met: !!u.expected_religion || !!u.expected_age_min, points: 4 },
  ]
  const total = checks.reduce((sum, c) => sum + c.points, 0)
  const earned = checks.filter(c => c.met).reduce((sum, c) => sum + c.points, 0)
  return Math.round((earned / total) * 100)
}

export async function POST(req: Request) {
  try {
    const { userId, updates } = await req.json()
    if (!userId || !updates) return NextResponse.json({ success: false, message: 'Missing fields' })

    const supabase = getSupabase()

    // Fetch current profile to merge for completion calculation
    const { data: current } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    const merged = { ...current, ...updates }
    const profile_completion = calculateCompletion(merged)

    const { error } = await supabase
      .from('profiles')
      .update({ ...updates, profile_completion })
      .eq('id', userId)

    if (error) return NextResponse.json({ success: false, message: error.message })

    return NextResponse.json({ success: true, profile_completion })
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message })
  }
}
