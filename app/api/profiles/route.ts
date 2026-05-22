import { getProfiles } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const profiles = await getProfiles()
    
    return NextResponse.json({ profiles })
    
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch profiles' }, { status: 500 })
  }
}