import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcrypt';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { identifier, password } = await request.json();

    if (!identifier || !password) {
      return NextResponse.json(
        { error: 'Phone/Email and password are required' },
        { status: 400 }
      );
    }

    console.log('=== LOGIN ATTEMPT ===');
    console.log('Identifier:', identifier);

    const isPhone = /^01[0-9]{9}$/.test(identifier);
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);

    if (!isPhone && !isEmail) {
      return NextResponse.json(
        { error: 'Invalid phone or email format' },
        { status: 400 }
      );
    }

    const { data: user, error: queryError } = await supabase
      .from('profiles')
      .select('id, full_name, email, phone, password, photo_url, looking_for, gender, package, is_banned, is_verified')
      .or(`phone.eq.${identifier},email.eq.${identifier}`)
      .single();

    if (queryError || !user) {
      console.error('User not found:', queryError);
      return NextResponse.json(
        { error: 'Invalid phone/email or password' },
        { status: 401 }
      );
    }

    console.log('User found:', user.email);

    if (user.is_banned) {
      return NextResponse.json(
        { error: 'Your account has been banned. Contact support.' },
        { status: 403 }
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      console.log('Invalid password');
      return NextResponse.json(
        { error: 'Invalid phone/email or password' },
        { status: 401 }
      );
    }

    console.log('Login successful!');

    await supabase
      .from('profiles')
      .update({ last_active_at: new Date().toISOString() })
      .eq('id', user.id);

    return NextResponse.json({
      success: true,
      message: 'Login successful!',
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        phone: user.phone,
        photo_url: user.photo_url,
        looking_for: user.looking_for,
        gender: user.gender,
        package: user.package,
        is_verified: user.is_verified
      }
    });

  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Server error: ' + error.message },
      { status: 500 }
    );
  }
}