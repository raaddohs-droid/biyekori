import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const res = await fetch(
      `https://biyekori.metered.live/api/v1/turn/credentials?apiKey=heZZD34NOwl3f39h38gzi0XpTgeaWtHEUijM8xQs2Dpe8GaK`
    )
    const iceServers = await res.json()
    return NextResponse.json({ iceServers })
  } catch (err: any) {
    // Fallback to public STUN if Metered fails
    return NextResponse.json({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
      ]
    })
  }
}
