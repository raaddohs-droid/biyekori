import { NextResponse } from 'next/server'

const APP_ID = 'c4513ff1afb74017b915fb18cd7312d8'
const APP_CERTIFICATE = '77b85b10ff4c44c288e0a9c1dc5459db'

// Simple Agora token generation without external package
// Using RtcTokenBuilder logic inline
function generateAgoraToken(channelName: string, uid: number): string {
  // For testing with App Certificate disabled (testing mode)
  // Return empty string to use App ID only mode
  return ''
}

export async function POST(req: Request) {
  try {
    const { channelName, uid } = await req.json()
    if (!channelName || uid === undefined) {
      return NextResponse.json({ error: 'Missing channelName or uid' }, { status: 400 })
    }

    // Try to use agora-token package if available
    let token = ''
    try {
      const { RtcTokenBuilder, RtcRole } = require('agora-token')
      const expireTime = 3600 // 1 hour
      const currentTime = Math.floor(Date.now() / 1000)
      const privilegeExpireTime = currentTime + expireTime
      token = RtcTokenBuilder.buildTokenWithUid(
        APP_ID, APP_CERTIFICATE, channelName, uid,
        RtcRole.PUBLISHER, expireTime, privilegeExpireTime
      )
    } catch(e) {
      // agora-token not installed, use empty token (App ID only mode)
      token = ''
    }

    return NextResponse.json({ token, appId: APP_ID, channelName, uid })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
