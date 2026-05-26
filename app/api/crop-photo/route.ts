import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { imageData } = await request.json();

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4-vision-preview",
        max_tokens: 500,
        messages: [{
          role: "user",
          content: [
            { 
              type: "image_url", 
              image_url: { 
                url: imageData,
                detail: "high"
              } 
            },
            {
              type: "text",
              text: `You are a professional photographer creating passport photos. Analyze this image and locate the main person's face.

CRITICAL: Return ONLY valid JSON, no markdown, no explanation, no extra text.

{
  "faceDetected": true,
  "centerX": 0.5,
  "centerY": 0.35,
  "scale": 3.0
}

Instructions:
- centerX: horizontal position of face center (0.0 = left edge, 1.0 = right edge)
- centerY: vertical position of face center (0.0 = top edge, 1.0 = bottom edge)  
- scale: zoom level (2.5 = moderate zoom, 3.5 = close headshot, 4.5 = very tight crop)
- For passport photos: face should be centered, scale should be 3.0-4.0
- If you can clearly see a human face, set faceDetected to true
- If no face visible, set faceDetected to false and use centerX: 0.5, centerY: 0.5, scale: 1.5

Return ONLY the JSON object, nothing else.`
            }
          ]
        }]
      })
    });

    const data = await response.json();
    
    console.log("OpenAI full response:", JSON.stringify(data, null, 2));
    
    if (!data.choices || !data.choices[0]) {
      console.error("Invalid OpenAI response structure");
      return NextResponse.json({ 
        faceDetected: false, 
        centerX: 0.5, 
        centerY: 0.5, 
        scale: 2.0 
      });
    }

    const aiResponse = data.choices[0].message.content;
    console.log("AI response text:", aiResponse);
    
    // Remove markdown code blocks if present
    const cleanJson = aiResponse
      .replace(/```json\s*/g, '')
      .replace(/```\s*/g, '')
      .trim();
    
    console.log("Cleaned JSON:", cleanJson);
    
    const faceData = JSON.parse(cleanJson);
    console.log("Parsed face data:", faceData);
    
    return NextResponse.json(faceData);
    
  } catch (error) {
    console.error("Crop API error:", error);
    return NextResponse.json({ 
      faceDetected: false, 
      centerX: 0.5, 
      centerY: 0.5, 
      scale: 2.0 
    });
  }
}