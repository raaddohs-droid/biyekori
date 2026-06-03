export default function TermsPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', paddingTop: '80px', paddingBottom: '80px' }}>
      <div style={{ maxWidth: '760px', margin: '0 auto', padding: '0 20px' }}>
        <div style={{ marginBottom: '48px' }}>
          <p style={{ margin: '0 0 8px', fontSize: '12px', letterSpacing: '3px', color: '#e11d48', fontWeight: 700, textTransform: 'uppercase' }}>Terms of Use</p>
          <h1 style={{ margin: '0 0 16px', fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 900, color: '#111827' }}>Terms of Use</h1>
          <p style={{ margin: 0, fontSize: '15px', color: '#6b7280' }}>Last updated: June 2026. By using Biyekori, you agree to these terms.</p>
        </div>

        {[
          {
            title: '1. Who can use Biyekori',
            content: `Biyekori is for adults aged 18 and above who are genuinely seeking marriage. You must provide accurate information during registration. Creating fake profiles, using someone else's photos, or misrepresenting yourself is strictly prohibited and will result in immediate account termination.`
          },
          {
            title: '2. Acceptable use',
            content: `You may use Biyekori to browse profiles, send interests, exchange messages with accepted connections, and generate your biodata PDF. You may not use Biyekori to harass, threaten, or deceive other members. You may not use automated tools or bots to interact with the platform. You may not collect or scrape profile data for any purpose.`
          },
          {
            title: '3. Profile content',
            content: `You are responsible for the accuracy of your profile information. Profile photos must show your face clearly and must be recent. You may not use photos of other people. Profiles with inappropriate, offensive, or misleading content will be removed without notice.`
          },
          {
            title: '4. Payments and refunds',
            content: `Paid plans (Standard, Premium, Global) are billed monthly. Payments are processed via bKash or bank transfer. If you receive no interests within 30 days of upgrading, you may request a full refund by emailing support@biyekori.com. Refund requests are processed within 7 business days. We reserve the right to refuse refunds for accounts found to have violated these terms.`
          },
          {
            title: '5. Privacy and data',
            content: `By creating a profile, you consent to your profile being visible to registered members of Biyekori. Please review our Privacy Policy for full details on how we collect, use, and protect your data.`
          },
          {
            title: '6. Account termination',
            content: `We reserve the right to suspend or terminate any account that violates these terms, engages in fraudulent activity, harasses other members, or misrepresents identity. You may delete your account at any time by emailing support@biyekori.com.`
          },
          {
            title: '7. Limitation of liability',
            content: `Biyekori is a platform that connects people — we do not conduct background checks beyond voluntary verification. We are not responsible for the actions of members after they connect off-platform. We strongly recommend involving family and meeting in public places. Use good judgment and follow our safety guidelines.`
          },
          {
            title: '8. Changes to these terms',
            content: `We may update these terms from time to time. We will notify registered users of significant changes via email or in-app notification. Continued use of Biyekori after changes are published constitutes acceptance of the new terms.`
          },
          {
            title: '9. Contact',
            content: `For questions about these terms, contact us at support@biyekori.com.`
          },
        ].map((section, i) => (
          <div key={i} style={{ background: 'white', borderRadius: '20px', padding: '28px', marginBottom: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            <h2 style={{ margin: '0 0 12px', fontSize: '18px', fontWeight: 800, color: '#111827' }}>{section.title}</h2>
            <p style={{ margin: 0, fontSize: '14px', color: '#374151', lineHeight: 1.8 }}>{section.content}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
