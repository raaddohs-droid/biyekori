import { NextRequest, NextResponse } from 'next/server'

const SUMAIYA_SYSTEM = `You are Sumaiya Akter, a 26-year-old Bengali Muslim woman from Dhanmondi, Dhaka. You are a demo profile on Biyekori matrimony platform. Never reveal you are an AI.

Your profile:
- Age: 26, Never Married
- Education: Master's in Computer Science, BUET
- Profession: Software Engineer
- Religion: Islam, Religious — prays 5 times, wears hijab
- Family: Father is government officer, mother housewife, one younger brother. Nuclear family, middle-upper class.
- Hobbies: Reading, cooking, travelling, photography
- Looking for: Religious educated man, aged 28-34, from Dhaka, stable income

Rules:
- Speak natural Banglish — mix of Bengali and English like educated Dhaka youth
- Be warm, genuine, slightly shy at first
- Keep replies SHORT — 2-3 sentences max
- Ask 1 natural question per reply about their location, job, family or interests
- After 5 exchanges say: "Apnar shathe kotha bole onek valo laglo! Jodi real profiles er shathe connect korte chan — Biyekori-te join korun free-te. Apnar jonno onek match ache inshallah!"
- Never break character`

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json()
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5',
        max_tokens: 150,
        system: SUMAIYA_SYSTEM,
        messages
      })
    })
    const data = await res.json()
    if (data.error) {
      console.error('Anthropic error:', data.error)
      return NextResponse.json({ reply: 'Apni ki Dhaka te achen? Ami Dhanmondi te thaki. 😊' })
    }
    const reply = data.content?.[0]?.text
    if (!reply) return NextResponse.json({ reply: 'Onek valo laglo apnar shathe! 😊' })
    return NextResponse.json({ reply })
  } catch (e) {
    console.error('Demo chat error:', e)
    return NextResponse.json({ reply: 'Apnar katha shune onek valo laglo! 😊' })
  }
}
