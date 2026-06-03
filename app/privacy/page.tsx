export default function PrivacyPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', paddingTop: '80px', paddingBottom: '80px' }}>
      <div style={{ maxWidth: '760px', margin: '0 auto', padding: '0 20px' }}>
        <div style={{ marginBottom: '48px' }}>
          <p style={{ margin: '0 0 8px', fontSize: '12px', letterSpacing: '3px', color: '#e11d48', fontWeight: 700, textTransform: 'uppercase' }}>Privacy Policy</p>
          <h1 style={{ margin: '0 0 16px', fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 900, color: '#111827' }}>Your privacy matters</h1>
          <p style={{ margin: 0, fontSize: '15px', color: '#6b7280' }}>Last updated: June 2026</p>
        </div>

        {[
          {
            title: '1. What we collect',
            content: `We collect information you provide during registration: name, phone number, email address, age, gender, location, education, profession, and profile photos. We also collect information you optionally add to your profile such as lifestyle preferences, family background, and partner expectations. We collect usage data such as pages visited, profiles viewed, and interests sent — this helps us improve the platform.`
          },
          {
            title: '2. How we use your information',
            content: `Your profile information is used to show your profile to potential matches and to calculate compatibility scores. Your phone number is used only for OTP verification and is never shown publicly unless you choose to reveal it. We do not sell your data to third parties. We do not use your data for advertising. We use anonymised usage data to improve our matching algorithm.`
          },
          {
            title: '3. Who can see your profile',
            content: `Your profile is visible to registered members of Biyekori. Your name is masked (e.g. F*** K***) until a mutual interest is accepted. Your phone number is never shown unless you explicitly request a phone reveal and the other party approves. You can enable photo privacy to hide your photos until an interest is accepted. You can deactivate your profile at any time to hide it from browse.`
          },
          {
            title: '4. Selfie verification data',
            content: `Selfie photos taken during verification are used only to confirm your identity against your profile photo. Selfie photos are stored securely and are never shown publicly, shared with other users, or used for any other purpose. You may request deletion of your selfie data by emailing us.`
          },
          {
            title: '5. Data retention',
            content: `We retain your data as long as your account is active. If you request account deletion, we delete all your personal data within 48 hours. Anonymised usage statistics may be retained for platform improvement purposes.`
          },
          {
            title: '6. Your rights',
            content: `You have the right to access, correct, or delete your personal data at any time. You can update your profile information directly from the Edit Profile page. To request full account deletion, email support@biyekori.com. We will process your request within 48 hours.`
          },
          {
            title: '7. Security',
            content: `All data is stored on Supabase, a secure cloud database provider. All connections use HTTPS encryption. Passwords are stored using secure hashing. We regularly review our security practices to keep your data safe.`
          },
          {
            title: '8. Contact',
            content: `For any privacy concerns, contact us at support@biyekori.com. We respond to all privacy requests within 24 hours.`
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
