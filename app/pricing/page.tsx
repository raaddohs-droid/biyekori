"use client";
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function PricingPage() {
  const router = useRouter();

  const plans = [
    {
      id: 'prottasha',
      name: 'Prottasha',
      bangla: 'প্রত্যাশা',
      price: 0,
      priceLabel: 'Free',
      period: 'Forever',
      color: '#6b7280',
      bg: '#f9fafb',
      border: '#e5e7eb',
      popular: false,
      features: [
        { text: 'Create profile with photos', yes: true },
        { text: 'Browse up to 5 pages of profiles', yes: true },
        { text: 'Send 3 interests per month', yes: true },
        { text: 'Download PDF Biodata', yes: true },
        { text: 'AI Match Score', yes: true },
        { text: 'View contact details', yes: false },
        { text: 'Send messages', yes: false },
        { text: 'Advanced search filters', yes: false },
        { text: 'See who viewed you', yes: false },
      ],
      cta: 'Get Started Free',
      ctaAction: '/register',
    },
    {
      id: 'biswas',
      name: 'Biswas',
      bangla: 'বিশ্বাস',
      price: 499,
      priceLabel: '৳499',
      period: 'per month',
      yearly: 4999,
      yearlySaving: 'Save ৳1,000/year',
      color: '#e11d48',
      bg: '#fff1f2',
      border: '#fecdd3',
      popular: true,
      features: [
        { text: 'Everything in Prottasha', yes: true },
        { text: 'Browse unlimited profiles', yes: true },
        { text: 'Unlimited interests', yes: true },
        { text: 'View 10 contacts/month', yes: true, badge: '10/mo' },
        { text: 'Send messages (accepted only)', yes: true },
        { text: 'Advanced search filters', yes: true },
        { text: 'See who viewed you', yes: true },
        { text: 'Profile Spotlight (1x/month)', yes: true, badge: '1x' },
        { text: 'Priority in search', yes: false },
      ],
      cta: 'Upgrade to Biswas',
      ctaAction: 'mailto:support@biyekori.com?subject=Upgrade to Biswas&body=Please upgrade my account to Biswas plan. bKash: 01XXXXXXXXX',
    },
    {
      id: 'shopno',
      name: 'Shopno',
      bangla: 'স্বপ্ন',
      price: 999,
      priceLabel: '৳999',
      period: 'per month',
      yearly: 9999,
      yearlySaving: 'Save ৳2,000/year',
      color: '#7c3aed',
      bg: '#f5f3ff',
      border: '#ddd6fe',
      popular: false,
      features: [
        { text: 'Everything in Biswas', yes: true },
        { text: 'Unlimited contact viewing', yes: true },
        { text: 'Unlimited messages', yes: true },
        { text: 'Top search placement', yes: true, badge: 'Top 10' },
        { text: 'Profile Spotlight (3x/month)', yes: true, badge: '3x' },
        { text: 'Featured gold badge', yes: true },
        { text: 'AI weekly match suggestions', yes: true },
        { text: 'Priority support', yes: true },
        { text: 'Background check assistance', yes: true },
      ],
      cta: 'Upgrade to Shopno',
      ctaAction: 'mailto:support@biyekori.com?subject=Upgrade to Shopno&body=Please upgrade my account to Shopno plan. bKash: 01XXXXXXXXX',
    },
  ];

  const nrbPlan = {
    name: 'NRB Plan',
    bangla: 'প্রবাসী',
    price: '$15',
    period: 'per month (USD)',
    features: [
      'All Shopno features',
      'USD pricing — pay from anywhere',
      'English-first interface',
      'Priority matching with NRB profiles',
      'Dedicated support via WhatsApp',
      'Family account (add 1 parent)',
    ],
  };

  const addons = [
    { name: 'NID Verification', price: '৳200', desc: 'One-time · Verified badge · 5x more views' },
    { name: 'Profile Spotlight', price: '৳99', desc: '24 hours · Appear at top of browse' },
    { name: 'Contact Unlock', price: '৳99', desc: 'Single profile · View phone number' },
    { name: 'Profile Boost', price: '৳199', desc: '48 hours · Top 10 search placement' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#fff5f7,#fdf2f8,#f5f3ff)', paddingTop: '80px', paddingBottom: '60px' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 20px' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h1 style={{ margin: '0 0 12px', fontSize: '36px', fontWeight: 900, color: '#111827' }}>
            Find Your Perfect Match
          </h1>
          <p style={{ margin: '0 0 24px', fontSize: '16px', color: '#6b7280', maxWidth: '500px', marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.6 }}>
            Simple, honest pricing. No hidden fees. Cancel anytime.
          </p>
          <div style={{ display: 'inline-flex', gap: '8px', background: 'white', padding: '6px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
            <span style={{ padding: '6px 16px', background: 'linear-gradient(135deg,#e11d48,#db2777)', color: 'white', borderRadius: '8px', fontSize: '13px', fontWeight: 700 }}>Monthly</span>
            <span style={{ padding: '6px 16px', color: '#6b7280', fontSize: '13px', fontWeight: 600 }}>Yearly — Save up to 20%</span>
          </div>
        </div>

        {/* Main Plans */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '20px', marginBottom: '32px' }}>
          {plans.map((plan) => (
            <div key={plan.id} style={{
              background: 'white', borderRadius: '20px', padding: '28px 24px',
              border: `2px solid ${plan.popular ? plan.color : plan.border}`,
              boxShadow: plan.popular ? '0 8px 32px rgba(225,29,72,0.15)' : '0 2px 12px rgba(0,0,0,0.06)',
              position: 'relative', transform: plan.popular ? 'scale(1.03)' : 'none'
            }}>
              {plan.popular && (
                <div style={{ position: 'absolute', top: '-14px', left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(135deg,#e11d48,#db2777)', color: 'white', padding: '4px 16px', borderRadius: '20px', fontSize: '12px', fontWeight: 800, whiteSpace: 'nowrap' }}>
                  Most Popular
                </div>
              )}

              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <h3 style={{ margin: '0 0 2px', fontSize: '20px', fontWeight: 900, color: '#111827' }}>{plan.name}</h3>
                <p style={{ margin: '0 0 16px', fontSize: '13px', color: '#9ca3af' }}>{plan.bangla}</p>
                <div style={{ fontSize: plan.price === 0 ? '32px' : '36px', fontWeight: 900, color: plan.color }}>
                  {plan.priceLabel}
                </div>
                <div style={{ fontSize: '13px', color: '#9ca3af', marginTop: '2px' }}>{plan.period}</div>
                {plan.yearly && (
                  <div style={{ fontSize: '11px', color: '#10b981', fontWeight: 700, marginTop: '4px' }}>{plan.yearlySaving}</div>
                )}
              </div>

              <ul style={{ listStyle: 'none', margin: '0 0 24px', padding: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {plan.features.map((f, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                    <span style={{ width: '18px', height: '18px', borderRadius: '50%', background: f.yes ? '#ecfdf5' : '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '1px' }}>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={f.yes ? '#10b981' : '#d1d5db'} strokeWidth="3"><path d={f.yes ? "M20 6L9 17l-5-5" : "M18 6L6 18M6 6l12 12"}/></svg>
                    </span>
                    <span style={{ fontSize: '13px', color: f.yes ? '#374151' : '#9ca3af' }}>
                      {f.text}
                      {(f as any).badge && <span style={{ marginLeft: '6px', fontSize: '10px', background: plan.bg, color: plan.color, border: `1px solid ${plan.border}`, padding: '1px 6px', borderRadius: '10px', fontWeight: 700 }}>{(f as any).badge}</span>}
                    </span>
                  </li>
                ))}
              </ul>

              <a href={plan.ctaAction} style={{
                display: 'block', textAlign: 'center', padding: '12px',
                background: plan.popular ? `linear-gradient(135deg,${plan.color},#db2777)` : plan.price === 0 ? '#f3f4f6' : `linear-gradient(135deg,${plan.color},#9333ea)`,
                color: plan.price === 0 ? '#6b7280' : 'white',
                borderRadius: '12px', fontWeight: 700, fontSize: '14px',
                textDecoration: 'none', border: 'none'
              }}>
                {plan.cta}
              </a>
            </div>
          ))}
        </div>

        {/* NRB Plan */}
        <div style={{ background: 'linear-gradient(135deg,#0f172a,#1e1b4b)', borderRadius: '20px', padding: '32px', marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '32px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <span style={{ background: 'rgba(255,255,255,0.1)', color: 'white', padding: '3px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 700, letterSpacing: '1px' }}>NRB SPECIAL</span>
            </div>
            <h3 style={{ margin: '0 0 4px', fontSize: '22px', fontWeight: 900, color: 'white' }}>{nrbPlan.name} — {nrbPlan.bangla}</h3>
            <p style={{ margin: '0 0 16px', fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}>For Bangladeshis living abroad</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {nrbPlan.features.map((f, i) => (
                <span key={i} style={{ fontSize: '12px', color: 'rgba(255,255,255,0.8)', background: 'rgba(255,255,255,0.1)', padding: '4px 10px', borderRadius: '20px' }}>✓ {f}</span>
              ))}
            </div>
          </div>
          <div style={{ textAlign: 'center', flexShrink: 0 }}>
            <div style={{ fontSize: '40px', fontWeight: 900, color: '#fbbf24' }}>{nrbPlan.price}</div>
            <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', marginBottom: '16px' }}>{nrbPlan.period}</div>
            <a href="mailto:support@biyekori.com?subject=NRB Plan Request&body=Please activate NRB plan for my account." style={{ display: 'block', padding: '12px 28px', background: 'linear-gradient(135deg,#f59e0b,#d97706)', color: 'white', borderRadius: '12px', fontWeight: 700, fontSize: '14px', textDecoration: 'none' }}>
              Contact for NRB Plan
            </a>
          </div>
        </div>

        {/* Add-ons */}
        <div style={{ background: 'white', borderRadius: '20px', padding: '28px', marginBottom: '32px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <h2 style={{ margin: '0 0 20px', fontSize: '20px', fontWeight: 800, color: '#111827' }}>Add-ons</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px' }}>
            {addons.map((a, i) => (
              <div key={i} style={{ border: '1.5px solid #f3f4f6', borderRadius: '14px', padding: '16px', textAlign: 'center' }}>
                <div style={{ fontSize: '20px', fontWeight: 900, color: '#e11d48', marginBottom: '4px' }}>{a.price}</div>
                <p style={{ margin: '0 0 4px', fontSize: '13px', fontWeight: 700, color: '#111827' }}>{a.name}</p>
                <p style={{ margin: '0 0 12px', fontSize: '11px', color: '#9ca3af', lineHeight: 1.4 }}>{a.desc}</p>
                <a href="mailto:support@biyekori.com" style={{ display: 'block', padding: '7px', background: '#fff1f2', color: '#e11d48', borderRadius: '8px', fontSize: '12px', fontWeight: 700, textDecoration: 'none' }}>
                  Request
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* Payment info */}
        <div style={{ textAlign: 'center', padding: '20px', background: 'white', borderRadius: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <p style={{ margin: '0 0 8px', fontSize: '14px', fontWeight: 700, color: '#111827' }}>Payment via bKash</p>
          <p style={{ margin: '0 0 4px', fontSize: '13px', color: '#6b7280' }}>Send payment to <strong>01733577215</strong> (Personal) · Include your registered phone number as reference</p>
          <p style={{ margin: 0, fontSize: '12px', color: '#9ca3af' }}>After payment email us at <a href="mailto:support@biyekori.com" style={{ color: '#e11d48', fontWeight: 600 }}>support@biyekori.com</a> with screenshot · Activation within 2 hours</p>
        </div>

      </div>
    </div>
  );
}
