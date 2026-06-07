import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const text = req.nextUrl.searchParams.get('text')
  const speed = req.nextUrl.searchParams.get('speed') || '1.0'
  if (!text) return NextResponse.json({ error: 'Missing text' }, { status: 400 })
  try {
    const url = `https://translate.googleapis.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=bn&client=gtx&ttsspeed=${speed}`
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } })
    if (!res.ok) return NextResponse.json({ error: 'TTS failed' }, { status: 502 })
    const buffer = await res.arrayBuffer()
    return new NextResponse(buffer, { headers: { 'Content-Type': 'audio/mpeg', 'Cache-Control': 'public, max-age=86400' } })
  } catch (e) {
    return NextResponse.json({ error: 'TTS error' }, { status: 500 })
  }
}
