import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const getSupabase = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

async function urlToBase64(url: string): Promise<{ data: string, mediaType: string }> {
  const res = await fetch(url)
  const buffer = await res.arrayBuffer()
  const contentType = res.headers.get('content-type') || 'image/jpeg'
  const mediaType = contentType.includes('pdf') ? 'application/pdf' :
    contentType.includes('png') ? 'image/png' : 'image/jpeg'
  return { data: Buffer.from(buffer).toString('base64'), mediaType }
}

export async function POST(req: Request) {
  try {
    const { userId, docUrl, docType, profileName } = await req.json()
    // docType: 'education' or 'job'

    if (!userId || !docUrl || !docType || !profileName) {
      return NextResponse.json({ success: false, message: 'Missing fields' })
    }

    const supabase = getSupabase()

    // Check profile exists
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, full_name')
      .eq('id', userId)
      .single()

    if (!profile) return NextResponse.json({ success: false, message: 'Profile not found' })

    // Convert document to base64
    let docBase64: string
    let mediaType: string
    try {
      const result = await urlToBase64(docUrl)
      docBase64 = result.data
      mediaType = result.mediaType
    } catch (e) {
      return NextResponse.json({ success: false, message: 'Could not process document' })
    }

    // Build prompt based on doc type
    const prompt = docType === 'education'
      ? `You are an education certificate verification assistant.
Examine this document carefully.
The profile name is: "${profileName}"

Please answer ONLY in this exact JSON format:
{
  "name_on_document": "exact name as written on the document",
  "name_matches_profile": "yes" | "no" | "partial" | "unclear",
  "qualification": "degree/certificate name found on document",
  "institution": "institution name if visible",
  "year": "year if visible",
  "document_type": "what type of document this appears to be",
  "confidence": "high" | "medium" | "low",
  "notes": "brief explanation"
}`
      : `You are a business/employment document verification assistant.
Examine this document carefully.
The profile name is: "${profileName}"

Please answer ONLY in this exact JSON format:
{
  "name_on_document": "exact name as written on the document",
  "name_matches_profile": "yes" | "no" | "partial" | "unclear",
  "business_or_employer": "business name or employer name if visible",
  "document_type": "what type of document this appears to be (trade license, employment letter, etc)",
  "registration_number": "registration or license number if visible",
  "confidence": "high" | "medium" | "low",
  "notes": "brief explanation"
}`

    // Call Claude Vision
    const response = await anthropic.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 400,
      messages: [{
        role: 'user',
        content: [
          { type: 'text', text: prompt },
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: mediaType as any,
              data: docBase64
            }
          }
        ]
      }]
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : ''
    let aiResult: any = {}
    try {
      const clean = text.replace(/```json|```/g, '').trim()
      aiResult = JSON.parse(clean)
    } catch (e) {
      // Parse failed
      const updates: any = {}
      updates[`${docType}_doc_url`] = docUrl
      updates[`${docType}_verified_notes`] = 'AI parse failed — manual review needed'
      await supabase.from('profiles').update(updates).eq('id', userId)
      return NextResponse.json({ success: true, autoApproved: false, reason: 'Sent for manual review' })
    }

    const autoApprove =
      (aiResult.name_matches_profile === 'yes' || aiResult.name_matches_profile === 'partial') &&
      aiResult.confidence === 'high'

    const updates: any = {
      [`${docType}_doc_url`]: docUrl,
      [`${docType}_verified_notes`]: JSON.stringify(aiResult)
    }

    if (autoApprove) {
      updates[`${docType}_verified`] = true
      updates[`${docType}_verified_at`] = new Date().toISOString()

      // Notification
      const notifMsg = docType === 'education'
        ? `Your education certificate has been verified! "${aiResult.qualification}" badge added to your profile.`
        : `Your job/business document has been verified! Badge added to your profile.`

      await supabase.from('notifications').insert([{
        user_id: userId,
        type: `${docType}_verified`,
        message: notifMsg,
        is_read: false
      }])
    }

    await supabase.from('profiles').update(updates).eq('id', userId)

    return NextResponse.json({
      success: true,
      autoApproved: autoApprove,
      aiResult,
      reason: autoApprove ? null : (aiResult.notes || 'Sent for manual review within 24 hours')
    })

  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message })
  }
}
