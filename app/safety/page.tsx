import Link from 'next/link'

export default function SafetyPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', paddingTop: '80px', paddingBottom: '80px' }}>
      <div style={{ maxWidth: '760px', margin: '0 auto', padding: '0 20px' }}>

        <div style={{ marginBottom: '48px' }}>
          <p style={{ margin: '0 0 8px', fontSize: '12px', letterSpacing: '3px', color: '#e11d48', fontWeight: 700, textTransform: 'uppercase' }}>Safety</p>
          <h1 style={{ margin: '0 0 16px', fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 900, color: '#111827', lineHeight: 1.2 }}>Your safety is our priority</h1>
          <p style={{ margin: 0, fontSize: '18px', color: '#6b7280', lineHeight: 1.7 }}>Please read these guidelines before connecting with anyone on Biyekori.</p>
        </div>

        {[
          {
            icon: '🛡️', title: 'Verify before you trust',
            items: [
              'Always check for the Selfie Verified badge before sharing personal contact details.',
              'A verified profile means the person passed live face verification — the photo is real.',
              'Profiles without verification are not necessarily fake — but proceed with more caution.',
            ]
          },
          {
            icon: '📞', title: 'Protect your phone number',
            items: [
              'Do not share your personal phone number until you have exchanged several messages and feel comfortable.',
              'Use Biyekori messaging first. Your number is only shared when you choose to reveal it.',
              'If someone pressures you to share contact details quickly, be cautious.',
            ]
          },
          {
            icon: '💰', title: 'Never send money',
            items: [
              'Biyekori will never ask you to send money to another user.',
              'If someone asks for financial help, gifts, or bKash transfers — this is a scam. Report them immediately.',
              'This includes stories about emergencies, travel costs, or medical expenses.',
            ]
          },
          {
            icon: '📸', title: 'Be careful with photos',
            items: [
              'Do not share private or intimate photos with anyone you have not met in person.',
              'Screenshots can be shared without your consent. Be mindful of what you send.',
              'Report any profile that uses your photos without permission.',
            ]
          },
          {
            icon: '👨‍👩‍👧', title: 'Involve your family',
            items: [
              'We recommend involving a trusted family member before meeting anyone in person.',
              'Share the profile link and BK code with your guardian before proceeding.',
              'A first meeting should always be in a public place with a family member present.',
            ]
          },
          {
            icon: '🚨', title: 'How to report',
            items: [
              'Use the Report button on any profile page to report suspicious behavior.',
              'Email us at support@biyekori.com with the profile BK code and reason.',
              'We review all reports within 24 hours and take action when needed.',
            ]
          },
        ].map((section, i) => (
          <div key={i} style={{ background: 'white', borderRadius: '20px', padding: '28px', marginBottom: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '16px' }}>
              <span style={{ fontSize: '24px' }}>{section.icon}</span>
              <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#111827' }}>{section.title}</h2>
            </div>
            <ul style={{ margin: 0, padding: '0 0 0 20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {section.items.map((item, j) => (
                <li key={j} style={{ fontSize: '14px', color: '#374151', lineHeight: 1.7 }}>{item}</li>
              ))}
            </ul>
          </div>
        ))}

        <div style={{ background: '#fff1f2', borderRadius: '20px', padding: '28px', border: '1px solid #fecdd3' }}>
          <h2 style={{ margin: '0 0 8px', fontSize: '18px', fontWeight: 800, color: '#e11d48' }}>Emergency contact</h2>
          <p style={{ margin: '0 0 12px', fontSize: '14px', color: '#374151', lineHeight: 1.7 }}>If you feel unsafe or are being harassed, contact us immediately.</p>
          <a href="mailto:support@biyekori.com" style={{ fontSize: '15px', color: '#e11d48', fontWeight: 700, textDecoration: 'none' }}>support@biyekori.com</a>
        </div>

      </div>
    </div>
  )
}
