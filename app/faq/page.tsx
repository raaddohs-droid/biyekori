'use client'
import { useState } from 'react'
import Link from 'next/link'

const FAQS = [
  {
    q: 'Is Biyekori free to use?',
    a: 'Yes — you can create a profile, browse up to 5 pages of profiles, send 3 interests per month, and download your PDF biodata completely free. Upgrade to Standard or Premium to unlock unlimited browsing, messaging, and contact viewing.'
  },
  {
    q: 'How does the AI Match Score work?',
    a: 'The AI Match Score is calculated based on 13 compatibility factors including age, religion, religiosity, education, profession, location, marriage timeline, living arrangement, and family values. The score is personalised — it uses your partner preferences to assess how well each profile matches what you are looking for.'
  },
  {
    q: 'What is Selfie Verification?',
    a: 'Selfie Verification is a live face check that confirms the person in the profile photo is real and present. The system asks you to look left and right on camera, then compares your live selfie with your profile photo using AI. Verified profiles show a Selfie Verified badge.'
  },
  {
    q: 'Will my phone number be visible to others?',
    a: 'No. Your phone number is never shown publicly. It is only used for OTP verification at registration. If you want to share your number with a match, you can request a phone reveal after an interest is mutually accepted — and the other party must approve it.'
  },
  {
    q: 'Can my parents or guardian manage my profile?',
    a: 'Yes. You can indicate in your profile that it is family-managed or guardian-first. Many families in Bangladesh prefer this approach. You can set your contact preference to "Guardian first" in the Lifestyle tab of Edit Profile.'
  },
  {
    q: 'How do I delete my account?',
    a: 'Email us at support@biyekori.com with the subject "Account Deletion Request". We will delete all your personal data within 48 hours. You can also deactivate your profile temporarily from Edit Profile → Privacy tab.'
  },
  {
    q: 'What happens when I send an interest?',
    a: 'The other person receives a notification. If they accept, you both can see each other\'s full names and exchange messages. If they decline, no notification is sent to you — to protect dignity. If no response is received after 7 days, the interest expires automatically.'
  },
  {
    q: 'How do I pay for a premium plan?',
    a: 'Send payment via bKash to 017XXXXXXXX and email us your transaction ID at support@biyekori.com with your registered phone number. Your account will be upgraded within 2 hours.'
  },
  {
    q: 'Can I get a refund?',
    a: 'Yes. If you receive no interests within 30 days of upgrading, email us at support@biyekori.com and we will refund your full payment — no questions asked.'
  },
  {
    q: 'How do I report a fake or suspicious profile?',
    a: 'Use the Report button on the profile page, or email us at support@biyekori.com with the profile\'s BK code and reason. We review all reports within 24 hours.'
  },
  {
    q: 'Is my data shared with anyone?',
    a: 'No. We do not sell your data to third parties and do not use your information for advertising. Please read our Privacy Policy for full details.'
  },
  {
    q: 'How is Biyekori different from other matrimony sites?',
    a: 'Biyekori is built specifically for Bangladeshi families. We offer live selfie verification (unique in Bangladesh), AI match scoring based on 13 factors, name masking for privacy, guardian-friendly features, and PDF biodata generation. We do not show ads and we do not sell your data.'
  },
]

export default function FAQPage() {
  const [open, setOpen] = useState<number | null>(null)
  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', paddingTop: '80px', paddingBottom: '80px' }}>
      <div style={{ maxWidth: '760px', margin: '0 auto', padding: '0 20px' }}>

        <div style={{ marginBottom: '48px', textAlign: 'center' }}>
          <p style={{ margin: '0 0 8px', fontSize: '12px', letterSpacing: '3px', color: '#e11d48', fontWeight: 700, textTransform: 'uppercase' }}>FAQ</p>
          <h1 style={{ margin: '0 0 16px', fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 900, color: '#111827' }}>Frequently Asked Questions</h1>
          <p style={{ margin: 0, fontSize: '16px', color: '#6b7280' }}>Can't find your answer? Email us at <a href="mailto:support@biyekori.com" style={{ color: '#e11d48', fontWeight: 700 }}>support@biyekori.com</a></p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {FAQS.map((faq, i) => (
            <div key={i} style={{ background: 'white', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: open === i ? '1px solid #fecdd3' : '1px solid #f1f5f9' }}>
              <button onClick={() => setOpen(open === i ? null : i)} style={{
                width: '100%', padding: '20px 24px', background: 'none', border: 'none',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', textAlign: 'left'
              }}>
                <span style={{ fontSize: '15px', fontWeight: 700, color: '#111827', lineHeight: 1.4 }}>{faq.q}</span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={open === i ? '#e11d48' : '#9ca3af'} strokeWidth="2" style={{ flexShrink: 0, transform: open === i ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                  <path d="M6 9l6 6 6-6"/>
                </svg>
              </button>
              {open === i && (
                <div style={{ padding: '0 24px 20px' }}>
                  <p style={{ margin: 0, fontSize: '14px', color: '#374151', lineHeight: 1.8 }}>{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: '48px', background: 'white', borderRadius: '20px', padding: '36px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <h3 style={{ margin: '0 0 8px', fontSize: '20px', fontWeight: 800, color: '#111827' }}>Still have questions?</h3>
          <p style={{ margin: '0 0 20px', fontSize: '14px', color: '#6b7280' }}>We respond to all emails within 24 hours.</p>
          <a href="mailto:support@biyekori.com" style={{ display: 'inline-block', padding: '12px 28px', background: 'linear-gradient(135deg,#e11d48,#db2777)', color: 'white', borderRadius: '10px', fontSize: '14px', fontWeight: 700, textDecoration: 'none' }}>
            Email Support
          </a>
        </div>

      </div>
    </div>
  )
}
