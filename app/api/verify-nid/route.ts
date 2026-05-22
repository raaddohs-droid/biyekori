import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { frontImage, backImage, userData } = await request.json()

    // Call OpenAI Vision to extract NID data
    const prompt = `You are analyzing a Bangladesh National ID Card (NID).

FRONT IMAGE: Extract the following:
- Full Name (in English)
- Date of Birth (format: DD-MM-YYYY)
- Gender (Male/Female)
- NID Number

BACK IMAGE: Extract:
- District name

Return ONLY a JSON object with this exact structure:
{
  "name": "extracted name",
  "dob": "DD-MM-YYYY",
  "gender": "Male or Female",
  "nid_number": "extracted number",
  "district": "extracted district"
}

If you cannot read any field clearly, use "UNCLEAR" as the value.`

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            {
              type: "image_url",
              image_url: { url: frontImage },
            },
            {
              type: "image_url",
              image_url: { url: backImage },
            },
          ],
        },
      ],
      max_tokens: 500,
    })

    const extractedText = response.choices[0].message.content || ''
    
    // Parse JSON from response
    const jsonMatch = extractedText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return NextResponse.json({ 
        success: false, 
        error: 'Could not extract NID data' 
      }, { status: 400 })
    }

    const extractedData = JSON.parse(jsonMatch[0])

    // Validate against user data
    const mismatches: string[] = []

    // Compare name (case-insensitive, ignore extra spaces)
    const extractedName = extractedData.name.toLowerCase().trim()
    const userName = userData.name.toLowerCase().trim()
    if (!extractedName.includes(userName) && !userName.includes(extractedName)) {
      mismatches.push(`Name mismatch: NID shows "${extractedData.name}" but you entered "${userData.name}"`)
    }

    // Compare DOB
    if (userData.dob && extractedData.dob !== 'UNCLEAR') {
      if (extractedData.dob !== userData.dob) {
        mismatches.push(`Date of Birth mismatch: NID shows "${extractedData.dob}" but you entered "${userData.dob}"`)
      }
    }

    // Compare gender (case-insensitive)
    if (extractedData.gender.toLowerCase() !== userData.gender.toLowerCase()) {
      mismatches.push(`Gender mismatch: NID shows "${extractedData.gender}" but you entered "${userData.gender}"`)
    }

    // Compare district (case-insensitive)
    if (userData.district && extractedData.district !== 'UNCLEAR') {
      const extractedDistrict = extractedData.district.toLowerCase().trim()
      const userDistrict = userData.district.toLowerCase().trim()
      if (!extractedDistrict.includes(userDistrict) && !userDistrict.includes(extractedDistrict)) {
        mismatches.push(`District mismatch: NID shows "${extractedData.district}" but you entered "${userData.district}"`)
      }
    }

    return NextResponse.json({
      success: mismatches.length === 0,
      extractedData,
      mismatches,
      message: mismatches.length === 0 
        ? 'All data matches! ✅' 
        : 'Please correct the mismatches in your profile'
    })

  } catch (error: any) {
    console.error('NID verification error:', error)
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Failed to verify NID' 
    }, { status: 500 })
  }
}