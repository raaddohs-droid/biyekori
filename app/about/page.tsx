import Link from 'next/link'

export default function AboutPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', paddingTop: '80px', paddingBottom: '80px' }}>
      <div style={{ maxWidth: '760px', margin: '0 auto', padding: '0 20px' }}>

        <div style={{ marginBottom: '48px' }}>
          <p style={{ margin: '0 0 8px', fontSize: '12px', letterSpacing: '3px', color: '#e11d48', fontWeight: 700, textTransform: 'uppercase' }}>About Us</p>
          <h1 style={{ margin: '0 0 16px', fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 900, color: '#111827', lineHeight: 1.2 }}>
            Bangladesh's most trusted matrimony platform
          </h1>
          <p style={{ margin: 0, fontSize: '18px', color: '#6b7280', lineHeight: 1.7 }}>
            Biyekori was built for Bangladeshi families who want a safe, serious, and modern way to find a life partner.
          </p>
        </div>

        <div style={{ background: 'white', borderRadius: '20px', padding: '36px', marginBottom: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <h2 style={{ margin: '0 0 16px', fontSize: '22px', fontWeight: 800, color: '#111827' }}>Our Story</h2>
          <p style={{ margin: '0 0 16px', fontSize: '15px', color: '#374151', lineHeight: 1.8 }}>
            Biyekori was founded with one goal: to make the process of finding a life partner safer, more transparent, and more respectful for Bangladeshi families — whether they live in Dhaka, Chittagong, or overseas.
          </p>
          <p style={{ margin: '0 0 16px', fontSize: '15px', color: '#374151', lineHeight: 1.8 }}>
            Traditional matrimony platforms are cluttered, outdated, and filled with fake profiles. Biyekori is different. We use AI-powered matching, live selfie verification, and thoughtful privacy controls to give families the confidence they need.
          </p>
          <p style={{ margin: 0, fontSize: '15px', color: '#374151', lineHeight: 1.8 }}>
            We believe finding a life partner should feel hopeful — not overwhelming. Every feature we build is designed to support that belief.
          </p>
        </div>

        <div style={{ background: 'white', borderRadius: '20px', padding: '36px', marginBottom: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <h2 style={{ margin: '0 0 20px', fontSize: '22px', fontWeight: 800, color: '#111827' }}>What makes us different</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[
              { icon: '🤖', title: 'AI Match Score', desc: 'Every profile gets a compatibility score based on 13 factors — not just age and location, but values, lifestyle, and family expectations.' },
              { icon: '🤳', title: 'Live Selfie Verification', desc: 'Our liveness detection confirms the person in the photo is real and present — not a stolen image. No other Bangladeshi platform does this.' },
              { icon: '🔒', title: 'Name Privacy', desc: 'Names are masked until you accept an interest. Your identity is protected until you choose to share it.' },
              { icon: '👨‍👩‍👧', title: 'Built for families', desc: 'Profiles can be managed by guardians. Contact preference, living arrangement, and marriage timeline are all part of the matching process.' },
              { icon: '📄', title: 'PDF Biodata', desc: 'Generate a beautifully designed biodata PDF in one click — perfect for sharing with family on WhatsApp or Messenger.' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '24px', flexShrink: 0 }}>{item.icon}</span>
                <div>
                  <p style={{ margin: '0 0 4px', fontSize: '15px', fontWeight: 700, color: '#111827' }}>{item.title}</p>
                  <p style={{ margin: 0, fontSize: '14px', color: '#6b7280', lineHeight: 1.6 }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: 'linear-gradient(135deg, #fff1f2, #fdf4ff)', borderRadius: '20px', padding: '36px', marginBottom: '24px', border: '1px solid #fce7f3' }}>
          <h2 style={{ margin: '0 0 16px', fontSize: '22px', fontWeight: 800, color: '#111827' }}>Our numbers</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
            {[
              { value: '1,200+', label: 'Profiles' },
              { value: '100%', label: 'Free to join' },
              { value: '24hr', label: 'Support response' },
            ].map((s, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '28px', fontWeight: 900, color: '#e11d48' }}>{s.value}</div>
                <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: 'white', borderRadius: '20px', padding: '36px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <h2 style={{ margin: '0 0 16px', fontSize: '22px', fontWeight: 800, color: '#111827' }}>Contact us</h2>
          <p style={{ margin: '0 0 16px', fontSize: '15px', color: '#374151', lineHeight: 1.7 }}>We are a small team passionate about getting this right. If you have questions, feedback, or concerns — we read every message.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <a href="mailto:support@biyekori.com" style={{ fontSize: '15px', color: '#e11d48', fontWeight: 700, textDecoration: 'none' }}>support@biyekori.com</a>
            <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>Response time: within 24 hours</p>
          </div>
        </div>

      </div>
    </div>
  )
}
