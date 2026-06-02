import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const getSupabase = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

async function urlToBase64(url: string): Promise<string> {
  const res = await fetch(url)
  const buffer = await res.arrayBuffer()
  return Buffer.from(buffer).toString('base64')
}

export async function POST(req: Request) {
  try {
    const { userId, selfieUrl } = await req.json()
    if (!userId || !selfieUrl) {
      return NextResponse.json({ success: false, message: 'Missing fields' })
    }

    const supabase = getSupabase()

    // Get user profile photo + attempt count
    const { data: profile } = await supabase
      .from('profiles')
      .select('photo_url, selfie_attempts, selfie_status')
      .eq('id', userId)
      .single()

    if (!profile) return NextResponse.json({ success: false, message: 'Profile not found' })
    if ((profile.selfie_attempts || 0) >= 3) {
      return NextResponse.json({ success: false, message: 'Maximum attempts reached' })
    }
    if (profile.selfie_status === 'approved') {
      return NextResponse.json({ success: false, message: 'Already verified' })
    }

    // Increment attempts
    await supabase
      .from('profiles')
      .update({
        selfie_url: selfieUrl,
        selfie_status: 'pending',
        selfie_attempts: (profile.selfie_attempts || 0) + 1
      })
      .eq('id', userId)

    // If no profile photo, send to manual review
    if (!profile.photo_url) {
      return NextResponse.json({
        success: true,
        autoApproved: false,
        reason: 'No profile photo to compare against. A team member will review your selfie.'
      })
    }

    // Convert both images to base64 for Claude Vision
    let selfieBase64: string
    let profileBase64: string

    try {
      selfieBase64 = await urlToBase64(selfieUrl)
      profileBase64 = await urlToBase64(profile.photo_url)
    } catch (e) {
      // If images can't be fetched, send to manual review
      return NextResponse.json({
        success: true,
        autoApproved: false,
        reason: 'Could not process images for comparison. A team member will review manually.'
      })
    }

    // Call Claude Vision
    const response = await anthropic.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 300,
      messages: [{
        role: 'user',
        content: [
          {
            type: 'text',
            text: `You are a face verification assistant for a matrimonial website.
Image 1 is the user's profile photo.
Image 2 is a live selfie just taken during verification.

Please analyze both images and answer ONLY in this exact JSON format, nothing else:
{
  "same_person": "yes" | "no" | "uncertain",
  "liveness": "yes" | "no",
  "confidence": "high" | "medium" | "low",
  "reason": "brief explanation in one sentence"
}

Guidelines:
- same_person "yes" only if you are reasonably confident both show the same individual
- liveness "yes" if the selfie appears to be a real live photo (not a photo of a photo or screen)
- confidence "high" only if both same_person is yes AND liveness is yes AND the images are clear
- Be conservative — when in doubt, say "uncertain" or "low" confidence`
          },
          {
            type: 'image',
            source: { type: 'base64', media_type: 'image/jpeg', data: profileBase64 }
          },
          {
            type: 'image',
            source: { type: 'base64', media_type: 'image/jpeg', data: selfieBase64 }
          }
        ]
      }]
    })

    // Parse Claude's response
    const text = response.content[0].type === 'text' ? response.content[0].text : ''
    let aiResult: any = {}
    try {
      const clean = text.replace(/```json|```/g, '').trim()
      aiResult = JSON.parse(clean)
    } catch (e) {
      // Parse failed — send to manual review
      await supabase.from('profiles').update({
        selfie_status: 'pending',
        selfie_notes: 'AI parse failed — manual review needed'
      }).eq('id', userId)

      return NextResponse.json({
        success: true,
        autoApproved: false,
        reason: 'Verification sent for manual review.'
      })
    }

    const autoApprove =
      aiResult.same_person === 'yes' &&
      aiResult.liveness === 'yes' &&
      aiResult.confidence === 'high'

    if (autoApprove) {
      await supabase.from('profiles').update({
        selfie_status: 'approved',
        selfie_verified_at: new Date().toISOString(),
        selfie_notes: `Auto-approved. AI: ${JSON.stringify(aiResult)}`
      }).eq('id', userId)

      // Add notification
      await supabase.from('notifications').insert([{
        user_id: userId,
        type: 'selfie_verified',
        message: 'Your selfie verification was approved! Your profile now shows a Selfie Verified badge.',
        is_read: false
      }])

      return NextResponse.json({ success: true, autoApproved: true, aiResult })
    } else {
      // Send to manual review with AI notes
      await supabase.from('profiles').update({
        selfie_status: 'pending',
        selfie_notes: `Manual review needed. AI result: same_person=${aiResult.same_person}, liveness=${aiResult.liveness}, confidence=${aiResult.confidence}. Reason: ${aiResult.reason}`
      }).eq('id', userId)

      return NextResponse.json({
        success: true,
        autoApproved: false,
        reason: aiResult.reason || 'Could not verify automatically. A team member will review within 24 hours.'
      })
    }
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message })
  }
}
