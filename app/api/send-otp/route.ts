import { NextRequest, NextResponse } from 'next/server';

const BULKSMS_API_KEY = '6f00v41H31GJuGMWv4f5';
const BULKSMS_SENDER_ID = '8809617624395';

// Shared OTP store (in production, use Redis or database)
declare global {
  var otpStore: Map<string, { code: string; expires: number }>;
}

global.otpStore = global.otpStore || new Map();

export async function POST(request: NextRequest) {
  try {
    const { phone } = await request.json();

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store OTP (expires in 5 minutes)
    global.otpStore.set(phone, {
      code: otp,
      expires: Date.now() + 5 * 60 * 1000
    });

    // Send SMS via BulkSMS BD
    const message = `Your Biyekori OTP is ${otp}. Valid for 5 minutes.`;
    const url = `http://bulksmsbd.net/api/smsapi?api_key=${BULKSMS_API_KEY}&type=text&number=${phone}&senderid=${BULKSMS_SENDER_ID}&message=${encodeURIComponent(message)}`;

    const response = await fetch(url);
    const result = await response.text();

    console.log('BulkSMS Response:', result);

    return NextResponse.json({ 
      success: true, 
      message: 'OTP sent successfully' 
    });

  } catch (error: any) {
    console.error('Send OTP error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}