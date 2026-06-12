import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Success Stories | Biyekori',
  description: 'Real couples who found each other on Biyekori — Bangladesh\'s privacy-first matrimony platform.',
}

const stories = [
  {
    id: 1,
    photo: '/stories/story1.png',
    names: 'Arif & Nadia',
    location: 'Dhaka & Chittagong',
    religion: 'Islam',
    married: 'February 2026',
    timeline: 'Met on Biyekori · Married 3 months later',
    quote: 'আমি বিশ্বাসই করতে পারিনি এত সহজে এবং নিরাপদে জীবনসঙ্গী খুঁজে পাওয়া যায়।',
    quoteEn: '"I never believed finding a life partner could be this easy and safe."',
    story: [
      { step: '01', label: 'First Contact', text: 'Arif found Nadia\'s profile through the AI match score. Both shared the same values, religion and family expectations. He sent her an interest.' },
      { step: '02', label: 'Family Involved', text: 'Nadia\'s mother reviewed the biodata PDF. Through Guardian Mode, both families connected on the platform — no phone numbers exchanged yet.' },
      { step: '03', label: 'First Meeting', text: 'After two weeks of on-platform conversation, both families met in Dhaka. Arif\'s parents travelled from Chittagong.' },
      { step: '04', label: 'Akad & Wedding', text: 'The nikah took place in February 2026. The entire journey from first interest to wedding took just under 3 months.' },
    ],
    disclaimer: 'Names changed on request. Story shared with full consent.',
  },
  {
    id: 2,
    photo: '/stories/story2.png',
    names: 'Raihan & Sumaiya',
    location: 'Sylhet & Dhaka',
    religion: 'Islam',
    married: 'March 2026',
    timeline: 'Met on Biyekori · Married 4 months later',
    quote: 'পরিবার সবসময় পাশে ছিল — প্রতিটি পদক্ষেপে। এটাই বিয়েকরির সবচেয়ে বড় সুবিধা।',
    quoteEn: '"Our families were involved every step of the way. That\'s what made Biyekori different."',
    story: [
      { step: '01', label: 'Profile Match', text: 'Sumaiya\'s guardian — her elder brother — was managing her profile. He shortlisted Raihan based on the AI compatibility score.' },
      { step: '02', label: 'Biodata Exchange', text: 'Both sides downloaded the biodata PDFs and shared them with their extended families via WhatsApp.' },
      { step: '03', label: 'Video Call', text: 'A supervised video call was arranged through Biyekori — Sumaiya\'s mother was present on her side, Raihan\'s father on his.' },
      { step: '04', label: 'Nikah in Sylhet', text: 'The wedding took place in Sylhet in March 2026, followed by a reception in Dhaka. Both families remain close.' },
    ],
    disclaimer: 'Names changed on request. Story shared with full consent.',
  },
  {
    id: 3,
    photo: '/stories/story3.jpg',
    names: 'Imran & Farida',
    location: 'London & Dhaka (NRB)',
    religion: 'Islam',
    married: 'April 2026',
    timeline: 'Met on Biyekori · Married 5 months later',
    quote: 'লন্ডনে থেকে দেশের মেয়ে খোঁজা কঠিন ছিল। বিয়েকরি সেই দূরত্বটা ঘুচিয়ে দিয়েছে।',
    quoteEn: '"Finding someone from home while living in London felt impossible. Biyekori bridged that distance."',
    story: [
      { step: '01', label: 'NRB Profile', text: 'Imran was based in London and had been searching for a Bangladeshi match for over a year. He joined Biyekori\'s NRB tier and found Farida\'s profile within a week.' },
      { step: '02', label: 'Long Distance Connection', text: 'They exchanged messages on-platform across different time zones. Farida\'s parents in Dhaka reviewed Imran\'s full biodata.' },
      { step: '03', label: 'Visit to Dhaka', text: 'Imran flew to Dhaka in January 2026. The families met formally. Both sides felt comfortable immediately.' },
      { step: '04', label: 'Wedding & Move', text: 'The nikah took place in April 2026. Farida joined Imran in London shortly after. They call Biyekori the reason it all worked.' },
    ],
    disclaimer: 'Names changed on request. Story shared with full consent.',
  },
]

export default function SuccessStoriesPage() {
  return (
    <main style={{ background: '#FFFBF5', minHeight: '100vh', paddingTop: '100px' }}>

      {/* Hero */}
      <section style={{ padding: 'clamp(48px,6vw,80px) clamp(24px,6vw,80px) 0', maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
        <p style={{ fontSize: '11px', color: 'rgba(123,29,46,0.6)', letterSpacing: '4px', marginBottom: '16px', fontFamily: 'system-ui, sans-serif', textTransform: 'uppercase' }}>Success Stories</p>
        <h1 style={{ fontSize: 'clamp(30px,4vw,52px)', fontWeight: 700, color: '#1a0a0d', margin: '0 0 20px', lineHeight: 1.15, fontFamily: 'Georgia, serif' }}>
          They found each other<br/>
          <span style={{ color: '#7B1D2E' }}>on Biyekori</span>
        </h1>
        <p style={{ fontSize: 'clamp(15px,1.3vw,18px)', color: '#4b2020', maxWidth: '560px', margin: '0 auto 48px', lineHeight: 1.8, fontFamily: 'system-ui, sans-serif' }}>
          Real journeys. Real families. Real marriages. Every name has been changed to protect privacy, but every story is true.
        </p>
      </section>

      {/* Stories */}
      <section style={{ padding: 'clamp(32px,4vw,60px) clamp(24px,6vw,80px)', maxWidth: '1100px', margin: '0 auto' }}>
        {stories.map((story, idx) => (
          <article key={story.id} style={{
            background: 'white',
            borderRadius: '20px',
            overflow: 'hidden',
            marginBottom: '60px',
            boxShadow: '0 2px 24px rgba(123,29,46,0.07)',
            border: '1px solid rgba(123,29,46,0.08)',
          }}>
            {/* Top — photo + quote */}
            <div style={{ display: 'grid', gridTemplateColumns: idx % 2 === 0 ? '400px 1fr' : '1fr 400px', minHeight: '420px' }}>
              {/* Photo side */}
              {idx % 2 === 0 && (
                <div style={{ position: 'relative', overflow: 'hidden' }}>
                  <img
                    src={story.photo}
                    alt={story.names}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top', display: 'block' }}
                    onContextMenu={e => e.preventDefault()}
                    onDragStart={e => e.preventDefault()}
                  />
                  <div style={{ position: 'absolute', inset: 0 }} onContextMenu={e => e.preventDefault()} />
                </div>
              )}

              {/* Text side */}
              <div style={{ padding: 'clamp(32px,4vw,52px)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '12px', background: '#fff5f7', color: '#7B1D2E', padding: '4px 12px', borderRadius: '20px', fontWeight: 600, fontFamily: 'system-ui, sans-serif' }}>{story.religion}</span>
                  <span style={{ fontSize: '12px', background: '#f8f9fa', color: '#4b5563', padding: '4px 12px', borderRadius: '20px', fontFamily: 'system-ui, sans-serif' }}>📍 {story.location}</span>
                  <span style={{ fontSize: '12px', background: '#f0fdf4', color: '#16a34a', padding: '4px 12px', borderRadius: '20px', fontWeight: 600, fontFamily: 'system-ui, sans-serif' }}>💍 {story.married}</span>
                </div>

                <h2 style={{ margin: '0 0 16px', fontSize: 'clamp(24px,2vw,32px)', fontWeight: 800, color: '#1a0a0d', fontFamily: 'Georgia, serif' }}>{story.names}</h2>
                <p style={{ margin: '0 0 8px', fontSize: 'clamp(16px,1.2vw,19px)', color: '#7B1D2E', fontFamily: 'Hind Siliguri, system-ui, sans-serif', lineHeight: 1.6, fontStyle: 'italic' }}>"{story.quote}"</p>
                <p style={{ margin: '0 0 24px', fontSize: '13px', color: '#9ca3af', fontFamily: 'system-ui, sans-serif', lineHeight: 1.6 }}>{story.quoteEn}</p>
                <p style={{ margin: 0, fontSize: '12px', color: '#9ca3af', fontFamily: 'system-ui, sans-serif', letterSpacing: '1px' }}>{story.timeline}</p>
              </div>

              {/* Photo side (right) */}
              {idx % 2 !== 0 && (
                <div style={{ position: 'relative', overflow: 'hidden' }}>
                  <img
                    src={story.photo}
                    alt={story.names}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top', display: 'block' }}
                    onContextMenu={e => e.preventDefault()}
                    onDragStart={e => e.preventDefault()}
                  />
                  <div style={{ position: 'absolute', inset: 0 }} onContextMenu={e => e.preventDefault()} />
                </div>
              )}
            </div>

            {/* Journey steps */}
            <div style={{ padding: 'clamp(24px,3vw,40px)', borderTop: '1px solid rgba(123,29,46,0.08)', background: '#fdfaf9' }}>
              <p style={{ margin: '0 0 24px', fontSize: '11px', color: 'rgba(123,29,46,0.5)', letterSpacing: '3px', fontFamily: 'system-ui, sans-serif', textTransform: 'uppercase' }}>Their Journey</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                {story.story.map(({ step, label, text }) => (
                  <div key={step} style={{ display: 'flex', gap: '14px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg,#7B1D2E,#9D174D)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 800, flexShrink: 0, fontFamily: 'system-ui, sans-serif' }}>{step}</div>
                    <div>
                      <p style={{ margin: '0 0 6px', fontSize: '13px', fontWeight: 700, color: '#1a0a0d', fontFamily: 'system-ui, sans-serif' }}>{label}</p>
                      <p style={{ margin: 0, fontSize: '13px', color: '#4b5563', lineHeight: 1.65, fontFamily: 'system-ui, sans-serif' }}>{text}</p>
                    </div>
                  </div>
                ))}
              </div>
              <p style={{ margin: '24px 0 0', fontSize: '11px', color: '#d1d5db', fontFamily: 'system-ui, sans-serif', fontStyle: 'italic' }}>{story.disclaimer}</p>
            </div>
          </article>
        ))}
      </section>

      {/* Submit your story CTA */}
      <section style={{ padding: 'clamp(48px,6vw,80px) clamp(24px,6vw,80px)', background: 'linear-gradient(135deg, #7B1D2E, #9D174D)', textAlign: 'center' }}>
        <p style={{ margin: '0 0 12px', fontSize: '11px', color: 'rgba(255,255,255,0.6)', letterSpacing: '4px', fontFamily: 'system-ui, sans-serif', textTransform: 'uppercase' }}>Share Your Story</p>
        <h2 style={{ margin: '0 0 16px', fontSize: 'clamp(24px,3vw,38px)', fontWeight: 700, color: 'white', fontFamily: 'Georgia, serif', lineHeight: 1.2 }}>
          Did you find your match<br/>on Biyekori?
        </h2>
        <p style={{ margin: '0 0 32px', fontSize: 'clamp(14px,1.2vw,17px)', color: 'rgba(255,255,255,0.8)', maxWidth: '480px', marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.8, fontFamily: 'system-ui, sans-serif' }}>
          We would love to feature your story. Names are always changed. Your privacy is always protected.
        </p>
        <a href="mailto:support@biyekori.com?subject=Our Success Story" style={{ display: 'inline-block', padding: '16px 44px', background: 'white', color: '#7B1D2E', borderRadius: '4px', fontSize: '13px', fontWeight: 700, textDecoration: 'none', letterSpacing: '2px', fontFamily: 'system-ui, sans-serif', textTransform: 'uppercase' }}>
          Share Your Story →
        </a>
      </section>

      {/* Back to browse */}
      <div style={{ textAlign: 'center', padding: '40px 24px', background: '#FFFBF5' }}>
        <Link href="/profiles" style={{ fontSize: '14px', color: '#7B1D2E', fontWeight: 600, textDecoration: 'none', fontFamily: 'system-ui, sans-serif' }}>
          ← Browse Profiles
        </Link>
      </div>

    </main>
  )
}
