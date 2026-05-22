import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { phone, message } = await request.json()

    // Remove +880 and keep only the number
    const cleanPhone = phone.replace('+880', '88')

    const apiKey = process.env.BULKSMS_API_KEY
    const senderId = process.env.BULKSMS_SENDER_ID

    const url = `http://bulksmsbd.net/api/smsapi?api_key=${apiKey}&type=text&number=${cleanPhone}&senderid=${senderId}&message=${encodeURIComponent(message)}`

    const response = await fetch(url)
    const data = await response.json()

    if (data.response_code === 202) {
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json({ success: false, error: data.error_message }, { status: 400 })
    }
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to send SMS' }, { status: 500 })
  }
}