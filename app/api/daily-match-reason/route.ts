import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

export async function POST(req: NextRequest) {
  try {
    const { viewerAge, viewerGender, matchName, matchAge, matchProfession, matchCity } = await req.json()
    const msg = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 80,
      messages: [{
        role: 'user',
        content: `You are a warm Bangladeshi matrimony matchmaker. Write ONE encouraging sentence (max 15 words) explaining why ${matchName?.split(' ')[0] || 'this person'} (${matchAge} yrs, ${matchProfession}, ${matchCity}) could be a great match for a ${viewerAge} year old ${viewerGender}. Be specific and warm. No quotes.`
      }]
    })
    const reason = msg.content[0].type === 'text' ? msg.content[0].text.trim() : 'A promising match based on your preferences.'
    return NextResponse.json({ reason })
  } catch (e) {
    return NextResponse.json({ reason: 'A promising match based on your preferences.' })
  }
}
