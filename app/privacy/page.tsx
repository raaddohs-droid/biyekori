export const metadata = { title: "Privacy Policy — Biyekori" }

export default function PrivacyPage() {
  const S = { h2: { fontSize: '20px', fontWeight: 700, color: '#1a0a0d', margin: '40px 0 12px', borderBottom: '2px solid #f0c040', paddingBottom: '8px' } as any, p: { fontSize: '15px', color: '#374151', lineHeight: 1.8, margin: '0 0 14px' } as any, li: { fontSize: '15px', color: '#374151', lineHeight: 1.8, margin: '0 0 8px' } as any }
  return (
    <div style={{ minHeight: '100vh', background: '#FDF6EE', paddingTop: '80px', paddingBottom: '80px' }}>
      <div style={{ maxWidth: '820px', margin: '0 auto', padding: '0 clamp(16px,4vw,40px)' }}>
        <div style={{ background: '#7B1D2E', color: 'white', borderRadius: '16px', padding: '32px', marginBottom: '40px', textAlign: 'center' }}>
          <h1 style={{ margin: '0 0 8px', fontSize: 'clamp(24px,4vw,36px)', fontWeight: 800 }}>Privacy Policy</h1>
          <p style={{ margin: 0, opacity: 0.8, fontSize: '14px' }}>Effective Date: 1 January 2025 | Last Updated: 13 June 2026</p>
        </div>

        <h2 style={S.h2}>1. What Data We Collect</h2>
        <p style={S.p}>When you use Biyekori, we collect:</p>
        <ul>
          <li style={S.li}><strong>Profile information:</strong> Name, age, gender, religion, education, profession, district, height, marital status, and other matrimonial details you choose to provide</li>
          <li style={S.li}><strong>Contact information:</strong> Phone number (for OTP verification only)</li>
          <li style={S.li}><strong>Photos:</strong> Profile photos you upload</li>
          <li style={S.li}><strong>Usage data:</strong> Pages visited, features used, interests sent, messages sent</li>
          <li style={S.li}><strong>Device data:</strong> IP address, browser type, device type (for security purposes)</li>
          <li style={S.li}><strong>Verification data:</strong> Selfie for liveness check, document images for name verification (not stored permanently after verification)</li>
        </ul>
        <p style={S.p}>We do <strong>not</strong> collect National ID numbers, passport numbers, bank account details, or any financial credentials.</p>

        <h2 style={S.h2}>2. How We Use Your Data</h2>
        <p style={S.p}>We use your data to:</p>
        <ul>
          <li style={S.li}>Display your profile to other users seeking matrimonial matches</li>
          <li style={S.li}>Calculate AI match compatibility scores</li>
          <li style={S.li}>Send OTP verification messages</li>
          <li style={S.li}>Send notifications about matches, interests, and messages</li>
          <li style={S.li}>Improve platform features and user experience</li>
          <li style={S.li}>Detect and prevent fraud, fake profiles, and misuse</li>
          <li style={S.li}>Comply with legal obligations under applicable Bangladeshi law</li>
        </ul>

        <h2 style={S.h2}>3. Phone Number Privacy</h2>
        <p style={S.p}>Your phone number is used <strong>only</strong> for OTP verification and critical security alerts. It is <strong>never</strong> shown to other users without your explicit consent. Contact sharing requires mutual acceptance of interest and explicit consent from both parties.</p>

        <h2 style={S.h2}>4. Photo Privacy</h2>
        <p style={S.p}>Your photos are visible to registered users browsing the platform. You may enable a "Photo on Request" setting where your photos are blurred and only revealed to users you approve. Profile photos are stored securely on Supabase cloud storage.</p>

        <h2 style={S.h2}>5. Data Sharing</h2>
        <p style={S.p}>We do <strong>not</strong> sell your personal data to any third party. We may share limited data with:</p>
        <ul>
          <li style={S.li}><strong>Service providers:</strong> Supabase (database/storage), BulkSMS (OTP delivery), Resend (email), Agora (voice calls), Anthropic (AI matching) — all under strict data processing agreements</li>
          <li style={S.li}><strong>Law enforcement:</strong> Where required by a valid court order or legal obligation under Bangladeshi law</li>
          <li style={S.li}><strong>Other users:</strong> Only the profile information you choose to make public</li>
        </ul>

        <h2 style={S.h2}>6. Data Security</h2>
        <p style={S.p}>We implement industry-standard security measures including:</p>
        <ul>
          <li style={S.li}>HTTPS encryption for all data in transit</li>
          <li style={S.li}>Secure cloud storage with access controls</li>
          <li style={S.li}>Phone OTP verification for all accounts</li>
          <li style={S.li}>AI-powered duplicate and fake profile detection</li>
          <li style={S.li}>Selfie liveness verification for premium accounts</li>
        </ul>
        <p style={S.p}>No system is 100% secure. We cannot guarantee absolute security and are not liable for any unauthorised access outside our reasonable control.</p>

        <h2 style={S.h2}>7. Data Retention</h2>
        <p style={S.p}>We retain your data for as long as your account is active. Upon account deletion, your profile data is removed within 30 days. Message history may be retained for up to 90 days for safety purposes. Anonymised, aggregated data may be retained indefinitely for platform improvement.</p>

        <h2 style={S.h2}>8. Your Rights</h2>
        <p style={S.p}>You have the right to:</p>
        <ul>
          <li style={S.li}>Access and download a copy of your personal data</li>
          <li style={S.li}>Correct inaccurate data</li>
          <li style={S.li}>Delete your account and associated data</li>
          <li style={S.li}>Withdraw consent for data processing</li>
          <li style={S.li}>Object to processing of your data for certain purposes</li>
        </ul>
        <p style={S.p}>To exercise any of these rights, contact us at support@biyekori.com.</p>

        <h2 style={S.h2}>9. Children's Privacy</h2>
        <p style={S.p}>Biyekori is strictly for adults. We do not knowingly collect data from anyone below the legal minimum marriageable age (18 for females, 21 for males under Bangladeshi law). If we discover that a minor has registered, we will immediately delete their account and data.</p>

        <h2 style={S.h2}>10. Cookies</h2>
        <p style={S.p}>We use essential cookies for authentication and security. We do not use tracking cookies for advertising purposes. You may disable cookies in your browser, but this may affect platform functionality.</p>

        <h2 style={S.h2}>11. Governing Law</h2>
        <p style={S.p}>This Privacy Policy is governed by the laws of Bangladesh, including the ICT Act 2006 (as amended), the Cyber Security Ordinance 2025, and any data protection regulations enacted thereafter.</p>

        <h2 style={S.h2}>12. Contact</h2>
        <p style={S.p}>For privacy-related questions or to exercise your rights: <strong>support@biyekori.com</strong></p>
      </div>
    </div>
  )
}
