"use client";
import Link from 'next/link';

export default function PricingPage() {

  const plans = [
    {
      id: 'prottasha',
      name: 'Free',
      price: '৳0',
      period: 'Forever',
      color: '#6b7280',
      borderColor: '#e5e7eb',
      popular: false,
      features: [
        'Create profile with photos',
        'Browse up to 5 pages of profiles',
        'Send 3 interests per month',
        'AI Match Score on every profile',
        'Download PDF Biodata',
      ],
      missing: [
        'View contact details',
        'Send messages',
        'See who viewed you',
      ],
      cta: 'Get Started Free',
      ctaHref: '/register',
      ctaBg: 'white',
      ctaColor: '#6b7280',
      ctaBorder: '2px solid #e5e7eb',
    },
    {
      id: 'biswas',
      name: 'Standard',
      price: '৳499',
      period: 'per month',
      yearly: '৳4,999/year',
      yearlySave: 'Save ৳1,000',
      color: '#e11d48',
      borderColor: '#e11d48',
      popular: true,
      features: [
        'Everything in Free',
        'Browse unlimited profiles',
        'Unlimited interests',
        'View 10 contact numbers/month',
        'Message after interest accepted',
        'See who viewed your profile',
        '1 Profile Spotlight per month',
      ],
      missing: [],
      cta: 'Upgrade to Standard',
      ctaHref: 'mailto:support@biyekori.com?subject=Upgrade to Standard',
      ctaBg: '#e11d48',
      ctaColor: 'white',
      ctaBorder: 'none',
    },
    {
      id: 'shopno',
      name: 'Premium',
      price: '৳999',
      period: 'per month',
      yearly: '৳9,999/year',
      yearlySave: 'Save ৳2,000',
      color: '#7c3aed',
      borderColor: '#7c3aed',
      popular: false,
      features: [
        'Everything in Standard',
        'View 30 contact numbers/month',
        'Unlimited messages',
        'Top search placement',
        '3 Profile Spotlights per month',
        'Featured gold badge',
        'Weekly AI match suggestions',
        'Priority support',
      ],
      missing: [],
      cta: 'Upgrade to Premium',
      ctaHref: 'mailto:support@biyekori.com?subject=Upgrade to Premium',
      ctaBg: 'linear-gradient(135deg, #7c3aed, #e11d48)',
      ctaColor: 'white',
      ctaBorder: 'none',
    },
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#f3f4f6', paddingTop: '80px', paddingBottom: '80px' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 20px' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '16px' }}>
          <h1 style={{ margin: '0 0 12px', fontSize: 'clamp(26px, 4vw, 42px)', fontWeight: 900, color: '#111827' }}>
            The <strong>safest, smartest</strong> and most trusted<br/>matrimony platform in Bangladesh
          </h1>
          <p style={{ margin: 0, fontSize: '16px', color: '#6b7280' }}>
            Start free. Upgrade when you find someone worth contacting.
          </p>
        </div>

        {/* Money Back Guarantee Badge */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '48px' }}>
          <div style={{ background: 'white', borderRadius: '16px', padding: '24px 40px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid #e5e7eb', maxWidth: '320px', width: '100%' }}>
            {/* Badge SVG */}
            <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
              <circle cx="40" cy="40" r="38" stroke="#9ca3af" strokeWidth="2" fill="none" strokeDasharray="4 2"/>
              <circle cx="40" cy="40" r="28" fill="#6b7280"/>
              <circle cx="40" cy="40" r="24" fill="#4b5563"/>
              <text x="40" y="36" textAnchor="middle" fill="white" fontSize="18" fontWeight="900" fontFamily="Georgia, serif">30</text>
              <text x="40" y="48" textAnchor="middle" fill="white" fontSize="8" fontWeight="700" fontFamily="Arial, sans-serif" letterSpacing="1">DAY</text>
              {/* Ribbon */}
              <path d="M20 58 L40 52 L60 58 L56 68 L40 63 L24 68 Z" fill="#9ca3af"/>
              <text x="40" y="63" textAnchor="middle" fill="white" fontSize="7" fontWeight="800" fontFamily="Arial, sans-serif" letterSpacing="1.5">GUARANTEE</text>
              {/* Stars */}
              <text x="24" y="60" textAnchor="middle" fill="white" fontSize="8">★</text>
              <text x="56" y="60" textAnchor="middle" fill="white" fontSize="8">★</text>
              {/* Top arc text */}
              <path id="topArc" d="M 12 40 A 28 28 0 0 1 68 40" fill="none"/>
              <text fontSize="7" fontWeight="700" fill="#6b7280" letterSpacing="2" fontFamily="Arial, sans-serif">
                <textPath href="#topArc" startOffset="10%">MONEY BACK</textPath>
              </text>
            </svg>
            <p style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#374151' }}>Money Back Guarantee</p>
            <p style={{ margin: 0, fontSize: '13px', color: '#6b7280', textAlign: 'center', lineHeight: 1.5 }}>
              If you receive no interests within 30 days of upgrading, we refund your full payment — no questions asked.
            </p>
          </div>
        </div>

        {/* Plans grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0', marginBottom: '40px', alignItems: 'stretch' }}>
          {plans.map((plan, idx) => (
            <div key={plan.id} style={{
              background: 'white',
              borderTop: `4px solid ${plan.borderColor}`,
              borderRight: idx < 2 ? '1px solid #e5e7eb' : 'none',
              borderBottom: '1px solid #e5e7eb',
              borderLeft: idx === 0 ? '1px solid #e5e7eb' : 'none',
              borderRadius: idx === 0 ? '16px 0 0 16px' : idx === 2 ? '0 16px 16px 0' : '0',
              overflow: 'hidden',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: plan.popular ? '0 8px 32px rgba(225,29,72,0.15)' : 'none',
              zIndex: plan.popular ? 1 : 0,
            }}>

              {/* Popular badge */}
              {plan.popular && (
                <div style={{ background: '#e11d48', color: 'white', textAlign: 'center', padding: '7px', fontSize: '11px', fontWeight: 800, letterSpacing: '2px', textTransform: 'uppercase' }}>
                  MOST POPULAR
                </div>
              )}

              <div style={{ padding: '28px 24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                {/* Plan name */}
                <h2 style={{ margin: '0 0 16px', fontSize: '22px', fontWeight: 900, color: '#111827' }}>{plan.name}</h2>

                {/* Price */}
                <div style={{ marginBottom: '4px' }}>
                  <span style={{ fontSize: '40px', fontWeight: 900, color: '#111827', lineHeight: 1 }}>{plan.price}</span>
                  <span style={{ fontSize: '14px', color: '#9ca3af', marginLeft: '6px' }}>{plan.period}</span>
                </div>

                {(plan as any).yearly && (
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ fontSize: '13px', color: '#9ca3af' }}>{(plan as any).yearly}</span>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#10b981', background: '#f0fdf4', padding: '2px 8px', borderRadius: '20px' }}>
                      {(plan as any).yearlySave}
                    </span>
                  </div>
                )}

                {/* CTA */}
                <Link href={plan.ctaHref} style={{
                  display: 'block', width: '100%', padding: '13px',
                  borderRadius: '10px', fontSize: '14px', fontWeight: 800,
                  textAlign: 'center', textDecoration: 'none', marginTop: '20px', marginBottom: '24px',
                  background: plan.ctaBg,
                  color: plan.ctaColor,
                  border: plan.ctaBorder,
                  boxSizing: 'border-box',
                }}>
                  {plan.cta}
                </Link>

                {/* Divider */}
                <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: '20px', flex: 1 }}>
                  <p style={{ margin: '0 0 14px', fontSize: '11px', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                    What's included
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '11px' }}>
                    {plan.features.map((f, i) => (
                      <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, marginTop: '1px' }}>
                          <circle cx="8" cy="8" r="8" fill={plan.color} opacity="0.15"/>
                          <path d="M5 8l2 2 4-4" stroke={plan.color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <span style={{ fontSize: '13px', color: '#374151', lineHeight: 1.4 }}>{f}</span>
                      </div>
                    ))}
                    {plan.missing.map((f, i) => (
                      <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', opacity: 0.35 }}>
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, marginTop: '1px' }}>
                          <circle cx="8" cy="8" r="8" fill="#9ca3af" opacity="0.2"/>
                          <path d="M5 8h6" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round"/>
                        </svg>
                        <span style={{ fontSize: '13px', color: '#9ca3af', lineHeight: 1.4 }}>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* NRB Plan */}
        <div style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)', borderRadius: '16px', padding: '32px 36px', display: 'grid', gridTemplateColumns: '1fr auto', gap: '32px', alignItems: 'center', marginBottom: '48px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 900, color: 'white' }}>Global</h3>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#fbbf24', background: 'rgba(251,191,36,0.15)', padding: '2px 8px', borderRadius: '20px' }}>Overseas Bangladeshi</span>
            </div>
            <p style={{ margin: '0 0 14px', fontSize: '26px', fontWeight: 900, color: 'white' }}>
              $15 <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', fontWeight: 400 }}>per month (USD)</span>
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {['All Premium features', 'USD pricing', 'Priority NRB matching', 'WhatsApp support'].map((f, i) => (
                <span key={i} style={{ fontSize: '12px', color: 'rgba(255,255,255,0.8)', background: 'rgba(255,255,255,0.1)', padding: '4px 12px', borderRadius: '20px' }}>{f}</span>
              ))}
            </div>
          </div>
          <Link href="mailto:support@biyekori.com?subject=Global NRB Plan" style={{ flexShrink: 0, padding: '13px 28px', background: 'linear-gradient(135deg, #F0C040, #C07800)', color: '#080604', borderRadius: '10px', fontSize: '14px', fontWeight: 800, textDecoration: 'none', whiteSpace: 'nowrap' }}>
            Contact Us
          </Link>
        </div>

        {/* Trust row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '48px' }}>
          {[
            { icon: '🔒', title: 'No hidden charges', desc: 'Cancel anytime via email.' },
            { icon: '📱', title: 'Pay via bKash', desc: '01733577215 — send payment ID.' },
            { icon: '⚡', title: 'Instant activation', desc: 'Within 2 hours of payment.' },
            { icon: '🤝', title: '30-day refund', desc: 'No interests? Full refund.' },
          ].map((item, i) => (
            <div key={i} style={{ background: 'white', borderRadius: '12px', padding: '18px', border: '1px solid #e5e7eb', textAlign: 'center' }}>
              <span style={{ fontSize: '22px', display: 'block', marginBottom: '8px' }}>{item.icon}</span>
              <p style={{ margin: '0 0 4px', fontSize: '13px', fontWeight: 700, color: '#111827' }}>{item.title}</p>
              <p style={{ margin: 0, fontSize: '12px', color: '#9ca3af', lineHeight: 1.4 }}>{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div style={{ textAlign: 'center', background: 'white', borderRadius: '16px', padding: '40px 32px', border: '1px solid #e5e7eb' }}>
          <h3 style={{ margin: '0 0 10px', fontSize: '22px', fontWeight: 800, color: '#111827' }}>Still not sure? Start free.</h3>
          <p style={{ margin: '0 0 20px', fontSize: '14px', color: '#6b7280' }}>No credit card needed. Upgrade only when you find someone worth contacting.</p>
          <Link href="/register" style={{ display: 'inline-block', padding: '13px 36px', background: 'linear-gradient(135deg, #e11d48, #db2777)', color: 'white', borderRadius: '10px', fontSize: '14px', fontWeight: 800, textDecoration: 'none' }}>
            Create Free Profile
          </Link>
        </div>

      </div>
    </div>
  )
}
