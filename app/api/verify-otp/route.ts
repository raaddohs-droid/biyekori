import { NextRequest, NextResponse } from 'next/server';

// Import the shared otpStore from send-otp
// In production, use Redis or database instead
declare global {
  var otpStore: Map<string, { code: string; expires: number }>;
}

global.otpStore = global.otpStore || new Map();

export async function POST(request: NextRequest) {
  try {
    const { phone, otp } = await request.json();

    const stored = global.otpStore.get(phone);

    if (!stored) {
      return NextResponse.json(
        { success: false, error: 'OTP not found. Please request a new one.' },
        { status: 400 }
      );
    }

    if (Date.now() > stored.expires) {
      global.otpStore.delete(phone);
      return NextResponse.json(
        { success: false, error: 'OTP expired. Please request a new one.' },
        { status: 400 }
      );
    }

    if (stored.code !== otp) {
      return NextResponse.json(
        { success: false, error: 'Invalid OTP. Please try again.' },
        { status: 400 }
      );
    }

    // OTP verified successfully
    global.otpStore.delete(phone);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Phone verified successfully' 
    });

  } catch (error: any) {
    console.error('Verify OTP error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}