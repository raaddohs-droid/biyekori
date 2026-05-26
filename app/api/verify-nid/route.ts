import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { frontImage, backImage, userData } = await request.json()

    const prompt = `You are analyzing a Bangladesh National ID Card (NID).

FRONT IMAGE: Extract the following:
- Full Name (in English)
- Date of Birth (format: DD-MM-YYYY)
- NID Number
- Blood Group (A+, A-, B+, B-, O+, O-, AB+, AB-)

BACK IMAGE: Extract:
- District name

Return ONLY a JSON object with this exact structure:
{
  "name": "extracted name",
  "dob": "DD-MM-YYYY",
  "nid_number": "extracted number",
  "blood_group": "extracted blood group or UNCLEAR",
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
    
    const jsonMatch = extractedText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return NextResponse.json({ 
        success: false, 
        error: 'Could not extract NID data' 
      }, { status: 400 })
    }

    const extractedData = JSON.parse(jsonMatch[0])

    const mismatches: string[] = []

    // Compare name
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

    // Compare district
    if (userData.district && extractedData.district !== 'UNCLEAR') {
      const extractedDistrict = extractedData.district.toLowerCase().trim()
      const userDistrict = userData.district.toLowerCase().trim()
      if (!extractedDistrict.includes(userDistrict) && !userDistrict.includes(extractedDistrict)) {
        mismatches.push(`District mismatch: NID shows "${extractedData.district}" but you entered "${userData.district}"`)
      }
    }

    // Blood Group - if user has it, compare; if not, we'll auto-fill
    if (userData.blood_group && extractedData.blood_group !== 'UNCLEAR') {
      if (extractedData.blood_group !== userData.blood_group) {
        mismatches.push(`Blood Group mismatch: NID shows "${extractedData.blood_group}" but you entered "${userData.blood_group}"`)
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