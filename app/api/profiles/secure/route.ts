import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Fields only logged-in members can see
const MEMBER_FIELDS = 'id,full_name,age,gender,religion,religious_level,district,city,profession,education,height,weight,complexion,blood_group,marital_status,photo_url,additional_photos,photo_privacy,package,is_verified,guardian_mode,profile_completion,created_at,last_active_at,marriage_timeline,family_type,family_values,about_me,partner_preference,total_siblings,monthly_income,income_hidden,phone,dob,nationality,languages,relocation,living_arrangement,children_preference,nrb_country,nrb_city'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const profileId = searchParams.get('id')
    const viewerId = searchParams.get('viewerId')

    if (!profileId) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 })
    }

    // Must be logged in (viewerId required)
    if (!viewerId) {
      return NextResponse.json({ error: 'Login required' }, { status: 401 })
    }

    // Verify viewer actually exists in DB
    const { data: viewer } = await supabase
      .from('profiles')
      .select('id, is_banned')
      .eq('id', viewerId)
      .single()

    if (!viewer || viewer.is_banned) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch full profile for logged-in member
    const { data: profile, error } = await supabase
      .from('profiles')
      .select(MEMBER_FIELDS)
      .eq('id', profileId)
      .single()

    if (error || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    return NextResponse.json({ profile })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
