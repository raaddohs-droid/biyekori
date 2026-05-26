import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcrypt'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { identifier, password } = await request.json()

    // Find user by phone or email
    const { data: users, error } = await supabase
      .from('profiles')
      .select('*')
      .or(`phone.eq.${identifier},email.eq.${identifier}`)
      .limit(1)

    if (error || !users || users.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid credentials' 
      }, { status: 401 })
    }

    const user = users[0]

    // Verify password
    const isValid = await bcrypt.compare(password, user.password)

    if (!isValid) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid credentials' 
      }, { status: 401 })
    }

    // Update last_active_at
    await supabase
      .from('profiles')
      .update({ last_active_at: new Date().toISOString() })
      .eq('id', user.id)

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        phone: user.phone,
        package: user.package,
        is_verified: user.is_verified,
        photo_url: user.photo_url
      }
    })

  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Login failed' 
    }, { status: 500 })
  }
}