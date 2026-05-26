// app/api/register/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcrypt';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const formData = await request.json();
    
    const {
      full_name,
      age,
      city,
      education,
      profession,
      phone,
      email,
      password,
      looking_for,
      gender,
      photo_url,
      package: userPackage
    } = formData;

    // Validation
    if (!full_name || !age || !city || !education || !profession || !phone || !email || !password || !looking_for || !photo_url) {
      return NextResponse.json(
        { error: 'সব তথ্য পূরণ করুন (All fields required)' },
        { status: 400 }
      );
    }

    // Validate age range
    if (age < 18 || age > 80) {
      return NextResponse.json(
        { error: 'বয়স ১৮-৮০ এর মধ্যে হতে হবে (Age must be 18-80)' },
        { status: 400 }
      );
    }

    // Validate phone format (01XXXXXXXXX)
    const phoneRegex = /^01[0-9]{9}$/;
    if (!phoneRegex.test(phone)) {
      return NextResponse.json(
        { error: 'সঠিক ফোন নম্বর দিন (01XXXXXXXXX)' },
        { status: 400 }
      );
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'সঠিক ইমেইল দিন (Valid email required)' },
        { status: 400 }
      );
    }

    // Validate password length
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষর হতে হবে (Password min 6 characters)' },
        { status: 400 }
      );
    }

    // Check if phone already exists
    const { data: existingPhone } = await supabase
      .from('profiles')
      .select('id')
      .eq('phone', phone)
      .single();

    if (existingPhone) {
      return NextResponse.json(
        { error: 'এই ফোন নম্বর দিয়ে ইতিমধ্যে একাউন্ট আছে (Phone already registered)' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const { data: existingEmail } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single();

    if (existingEmail) {
      return NextResponse.json(
        { error: 'এই ইমেইল দিয়ে ইতিমধ্যে একাউন্ট আছে (Email already registered)' },
        { status: 400 }
      );
    }

    // Hash password securely
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new profile
    const { data: newProfile, error: insertError } = await supabase
      .from('profiles')
      .insert([
        {
          full_name,
          age: parseInt(age),
          city,
          education,
          profession,
          phone,
          email,
          password: hashedPassword, // Hashed password stored
          looking_for,
          gender,
          photo_url,
          package: userPackage || 'prottasha',
          profile_completion: 30, // Basic info completed
          phone_verified: true, // Already verified via OTP
          is_verified: false,
          is_premium: false,
          is_admin: false,
          is_banned: false,
          created_at: new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (insertError) {
      console.error('Insert error:', insertError);
      return NextResponse.json(
        { error: 'রেজিস্ট্রেশন ব্যর্থ (Registration failed): ' + insertError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'রেজিস্ট্রেশন সফল! (Registration successful!)',
      profile: {
        id: newProfile.id,
        full_name: newProfile.full_name,
        email: newProfile.email,
        phone: newProfile.phone
      }
    });

  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'সার্ভার এরর (Server error): ' + error.message },
      { status: 500 }
    );
  }
}