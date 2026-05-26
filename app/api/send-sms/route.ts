import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { phone, message } = await request.json()
    
    console.log('=== SEND SMS API DEBUG ===');
    console.log('Received phone:', phone);
    console.log('Received message:', message);
    
    // Format: +8801XXXXXXXXX -> 8801XXXXXXXXX (remove + only)
    const cleanPhone = phone.startsWith('+') ? phone.substring(1) : phone;
    
    console.log('Clean phone for BulkSMS:', cleanPhone);
    
    const apiKey = process.env.BULKSMS_API_KEY;
    const senderId = process.env.BULKSMS_SENDER_ID;
    
    console.log('Using API Key:', apiKey);
    console.log('Using Sender ID:', senderId);
    
    const url = `http://bulksmsbd.net/api/smsapi?api_key=${apiKey}&type=text&number=${cleanPhone}&senderid=${senderId}&message=${encodeURIComponent(message)}`;
    
    console.log('Calling BulkSMS URL:', url);
    
    const response = await fetch(url);
    const data = await response.json();
    
    console.log('BulkSMS Response:', data);
    
    if (data.response_code === 202) {
      return NextResponse.json({ success: true });
    } else {
      console.error('BulkSMS Error:', data);
      return NextResponse.json({ 
        success: false, 
        error: data.error_message || 'SMS sending failed' 
      }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Send SMS Exception:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Failed to send SMS' 
    }, { status: 500 });
  }
}