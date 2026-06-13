'use client'

import Link from 'next/link'
import { useEffect } from 'react'

const stories = [
  {
    id: 1,
    photo: '/stories/story1.png',
    names: 'Arif & Nadia',
    location: 'Dhaka & Chittagong',
    religion: 'Islam',
    married: 'February 2026',
    timeline: 'Met on Biyekori · Married 3 months later',
    opening: 'Arif had tried two other platforms before Biyekori. Both times, the conversation went nowhere — no family involvement, no structure, no sense of seriousness. He almost stopped looking. Then his younger sister suggested Biyekori.',
    quote: 'আমি বিশ্বাসই করতে পারিনি এত সহজে এবং নিরাপদে জীবনসঙ্গী খুঁজে পাওয়া যায়।',
    quoteEn: '"I never believed finding a life partner could be this easy and this safe."',
    story: [
      { step: '01', label: 'The Match', text: 'Arif noticed Nadia\'s profile had an AI match score of 91%. She had listed family values and deen as her top priorities — exactly what he was looking for. He sent an interest that evening.' },
      { step: '02', label: 'Families Connect', text: 'Nadia\'s mother reviewed the biodata PDF her daughter shared on WhatsApp. She called it "the most organized proposal" she had seen. Through Guardian Mode, both families started talking on the platform.' },
      { step: '03', label: 'First Meeting', text: 'After two weeks of on-platform conversation, Arif\'s parents travelled from Chittagong to Dhaka. Both families met over lunch. The conversation lasted three hours.' },
      { step: '04', label: 'Nikah', text: 'The nikah took place in February 2026 — less than three months after Arif first sent that interest. Today they live in Dhaka. Nadia says the Guardian Mode feature made her family feel safe from day one.' },
    ],
    disclaimer: 'Names changed on request. Story shared with full consent of both families.',
  },
  {
    id: 2,
    photo: '/stories/story2.png',
    names: 'Raihan & Sumaiya',
    location: 'Sylhet & Dhaka',
    religion: 'Islam',
    married: 'March 2026',
    timeline: 'Met on Biyekori · Married 4 months later',
    opening: 'Sumaiya\'s elder brother was managing her profile. She had asked him to — she felt safer that way. He shortlisted seven profiles after two weeks. Raihan was the first one the family agreed to contact.',
    quote: 'পরিবার সবসময় পাশে ছিল — প্রতিটি পদক্ষেপে। এটাই বিয়েকরির সবচেয়ে বড় সুবিধা।',
    quoteEn: '"Our families were with us at every step. That is what made Biyekori different from everything else."',
    story: [
      { step: '01', label: 'Guardian Shortlist', text: 'Sumaiya\'s brother shortlisted Raihan based on the compatibility score and his verified profession. He sent an interest on her behalf through Guardian Mode.' },
      { step: '02', label: 'Biodata to Family', text: 'Both families downloaded the biodata PDFs and shared them with aunts and uncles over WhatsApp. The feedback from both sides was positive within days.' },
      { step: '03', label: 'Supervised Video Call', text: 'A video call was arranged through Biyekori. Sumaiya\'s mother sat beside her. Raihan\'s father joined from his side. Both families spoke directly for the first time.' },
      { step: '04', label: 'Nikah in Sylhet', text: 'The wedding took place in Sylhet in March 2026. A reception followed in Dhaka the next week. Both families say they still talk regularly.' },
    ],
    disclaimer: 'Names changed on request. Story shared with full consent of both families.',
  },
  {
    id: 3,
    photo: '/stories/story3.jpg',
    names: 'Imran & Farida',
    location: 'London & Dhaka',
    religion: 'Islam',
    married: 'April 2026',
    timeline: 'Met on Biyekori · Married 5 months later',
    opening: 'Imran had been in London for six years. He wanted to marry someone from Bangladesh — someone who shared his roots, his religion, his idea of family. Every platform he tried felt either too casual or too India-focused. A friend from Sylhet sent him a Biyekori link.',
    quote: 'লন্ডনে থেকে দেশের মেয়ে খোঁজা কঠিন ছিল। বিয়েকরি সেই দূরত্বটা ঘুচিয়ে দিয়েছে।',
    quoteEn: '"Finding someone from home while living in London felt impossible. Biyekori made it real."',
    story: [
      { step: '01', label: 'NRB Match', text: 'Imran joined on Biyekori\'s NRB tier. Within a week he found Farida\'s profile. She was 26, from Dhaka, working as a teacher — and her match score with Imran was 88%. He sent an interest the same night.' },
      { step: '02', label: 'Across Time Zones', text: 'They exchanged messages on the platform across a five-hour time difference. Farida\'s parents in Dhaka reviewed Imran\'s full biodata and spoke to his parents in Sylhet by phone.' },
      { step: '03', label: 'Imran Flies to Dhaka', text: 'In January 2026, Imran flew home. Both families met in Dhaka over two days. Farida\'s father said: "We felt like we already knew him."' },
      { step: '04', label: 'Wedding & New Beginning', text: 'The nikah was in April 2026. Farida joined Imran in London two months later. Imran says: "Biyekori understood what NRB families actually need."' },
    ],
    disclaimer: 'Names changed on request. Story shared with full consent of both families.',
  },
]

export default function SuccessStoriesPage() {
  useEffect(() => {
    document.title = 'Success Stories | Biyekori'
  }, [])

  return (
    <main style={{ background: '#FFFBF5', minHeight: '100vh', paddingTop: '100px' }}>

      {/* Hero */}
      <section style={{ padding: 'clamp(48px,6vw,80px) clamp(24px,6vw,80px) 0', maxWidth: '860px', margin: '0 auto', textAlign: 'center' }}>
        <p style={{ fontSize: '11px', color: 'rgba(123,29,46,0.6)', letterSpacing: '4px', marginBottom: '16px', fontFamily: 'system-ui, sans-serif', textTransform: 'uppercase' }}>Success Stories</p>
        <h1 style={{ fontSize: 'clamp(30px,4vw,52px)', fontWeight: 700, color: '#1a0a0d', margin: '0 0 20px', lineHeight: 1.15, fontFamily: 'Georgia, serif' }}>
          They found each other<br/>
          <span style={{ color: '#7B1D2E' }}>on Biyekori</span>
        </h1>
        <p style={{ fontSize: 'clamp(15px,1.3vw,18px)', color: '#4b2020', maxWidth: '560px', margin: '0 auto 60px', lineHeight: 1.8, fontFamily: 'system-ui, sans-serif' }}>
          Real journeys. Real families. Real marriages.<br/>Every name has been changed to protect privacy, but every story is true.
        </p>
      </section>

      {/* Stories */}
      <section style={{ padding: 'clamp(0px,2vw,20px) clamp(24px,6vw,80px) 60px', maxWidth: '1100px', margin: '0 auto' }}>
        {stories.map((story, idx) => (
          <article key={story.id} style={{
            background: 'white',
            borderRadius: '20px',
            overflow: 'hidden',
            marginBottom: '64px',
            boxShadow: '0 2px 32px rgba(123,29,46,0.08)',
            border: '1px solid rgba(123,29,46,0.08)',
          }}>

            {/* Photo + Quote — responsive grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0,1fr)',
            }}>
              {/* Photo */}
              <div style={{ position: 'relative', height: 'clamp(240px,50vw,340px)', overflow: 'hidden' }}>
                <img
                  src={story.photo}
                  alt={story.names}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 40%', display: 'block' }}
                  onContextMenu={e => e.preventDefault()}
                  onDragStart={e => e.preventDefault()}
                />
                {/* Gradient overlay */}
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 40%, rgba(26,10,13,0.7) 100%)' }} onContextMenu={e => e.preventDefault()} />
                {/* Names overlay on photo */}
                <div style={{ position: 'absolute', bottom: '24px', left: '28px', right: '28px' }}>
                  <h2 style={{ margin: '0 0 6px', fontSize: 'clamp(24px,3vw,34px)', fontWeight: 800, color: 'white', fontFamily: 'Georgia, serif', textShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>{story.names}</h2>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '12px', background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)', color: 'white', padding: '3px 10px', borderRadius: '20px', fontFamily: 'system-ui, sans-serif' }}>{story.religion}</span>
                    <span style={{ fontSize: '12px', background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)', color: 'white', padding: '3px 10px', borderRadius: '20px', fontFamily: 'system-ui, sans-serif' }}>📍 {story.location}</span>
                    <span style={{ fontSize: '12px', background: 'rgba(240,192,64,0.9)', color: '#1a0a0d', padding: '3px 10px', borderRadius: '20px', fontWeight: 700, fontFamily: 'system-ui, sans-serif' }}>💍 {story.married}</span>
                  </div>
                </div>
              </div>

              {/* Quote + opening */}
              <div style={{ padding: 'clamp(28px,4vw,44px)' }}>
                <p style={{ margin: '0 0 6px', fontSize: '11px', color: 'rgba(123,29,46,0.5)', letterSpacing: '3px', fontFamily: 'system-ui, sans-serif', textTransform: 'uppercase' }}>{story.timeline}</p>
                <p style={{ margin: '0 0 10px', fontSize: 'clamp(17px,1.4vw,21px)', color: '#7B1D2E', fontFamily: 'Hind Siliguri, Georgia, serif', lineHeight: 1.65, fontStyle: 'italic', fontWeight: 600 }}>"{story.quote}"</p>
                <p style={{ margin: '0 0 20px', fontSize: '13px', color: '#9ca3af', fontFamily: 'system-ui, sans-serif', lineHeight: 1.6 }}>{story.quoteEn}</p>
                <p style={{ margin: 0, fontSize: '15px', color: '#374151', fontFamily: 'system-ui, sans-serif', lineHeight: 1.85, borderLeft: '3px solid #F0C040', paddingLeft: '16px' }}>{story.opening}</p>
              </div>
            </div>

            {/* Journey steps */}
            <div style={{ padding: 'clamp(24px,3vw,40px)', borderTop: '1px solid rgba(123,29,46,0.07)', background: '#fdfaf9' }}>
              <p style={{ margin: '0 0 24px', fontSize: '11px', color: 'rgba(123,29,46,0.45)', letterSpacing: '3px', fontFamily: 'system-ui, sans-serif', textTransform: 'uppercase' }}>Their Journey</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px' }}>
                {story.story.map(({ step, label, text }) => (
                  <div key={step} style={{ display: 'flex', gap: '14px' }}>
                    <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'linear-gradient(135deg,#7B1D2E,#9D174D)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 800, flexShrink: 0, fontFamily: 'system-ui, sans-serif' }}>{step}</div>
                    <div>
                      <p style={{ margin: '0 0 6px', fontSize: '13px', fontWeight: 700, color: '#1a0a0d', fontFamily: 'system-ui, sans-serif' }}>{label}</p>
                      <p style={{ margin: 0, fontSize: '13px', color: '#4b5563', lineHeight: 1.7, fontFamily: 'system-ui, sans-serif' }}>{text}</p>
                    </div>
                  </div>
                ))}
              </div>
              <p style={{ margin: '28px 0 0', fontSize: '11px', color: '#d1d5db', fontFamily: 'system-ui, sans-serif', fontStyle: 'italic' }}>{story.disclaimer}</p>
            </div>
          </article>
        ))}
      </section>

      {/* Submit story CTA */}
      <section style={{ padding: 'clamp(48px,6vw,80px) clamp(24px,6vw,80px)', background: 'linear-gradient(135deg, #7B1D2E, #9D174D)', textAlign: 'center' }}>
        <p style={{ margin: '0 0 12px', fontSize: '11px', color: 'rgba(255,255,255,0.55)', letterSpacing: '4px', fontFamily: 'system-ui, sans-serif', textTransform: 'uppercase' }}>Share Your Story</p>
        <h2 style={{ margin: '0 0 16px', fontSize: 'clamp(24px,3vw,38px)', fontWeight: 700, color: 'white', fontFamily: 'Georgia, serif', lineHeight: 1.2 }}>
          Did you find your match<br/>on Biyekori?
        </h2>
        <p style={{ margin: '0 auto 32px', fontSize: 'clamp(14px,1.2vw,17px)', color: 'rgba(255,255,255,0.8)', maxWidth: '480px', lineHeight: 1.8, fontFamily: 'system-ui, sans-serif' }}>
          We would love to share your story. Names are always changed. Your privacy is always protected. Your story could give hope to someone still searching.
        </p>
        <a href="mailto:support@biyekori.com?subject=Our Success Story on Biyekori" style={{ display: 'inline-block', padding: '16px 44px', background: 'white', color: '#7B1D2E', borderRadius: '4px', fontSize: '13px', fontWeight: 700, textDecoration: 'none', letterSpacing: '2px', fontFamily: 'system-ui, sans-serif', textTransform: 'uppercase' }}>
          Share Your Story →
        </a>
      </section>

      {/* Footer nav */}
      <div style={{ textAlign: 'center', padding: '40px 24px', background: '#FFFBF5', display: 'flex', justifyContent: 'center', gap: '32px', flexWrap: 'wrap' }}>
        <Link href="/profiles" style={{ fontSize: '14px', color: '#7B1D2E', fontWeight: 600, textDecoration: 'none', fontFamily: 'system-ui, sans-serif' }}>← Browse Profiles</Link>
        <Link href="/register" style={{ fontSize: '14px', color: '#7B1D2E', fontWeight: 600, textDecoration: 'none', fontFamily: 'system-ui, sans-serif' }}>Create Your Profile →</Link>
      </div>

    </main>
  )
}

