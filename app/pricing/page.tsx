"use client";
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function PricingPage() {
  const router = useRouter();

  const plans = [
    {
      id: 'prottasha',
      name: 'Free',
      bangla: 'বিনামূল্যে',
      price: 0,
      priceLabel: '৳0',
      period: 'Forever',
      color: '#6b7280',
      accent: '#f3f4f6',
      border: '#e5e7eb',
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
      ctaAction: '/register',
      ctaStyle: 'outline',
    },
    {
      id: 'biswas',
      name: 'Standard',
      bangla: 'স্ট্যান্ডার্ড',
      price: 499,
      priceLabel: '৳499',
      period: 'per month',
      yearly: '৳4,999/year',
      yearlySave: 'Save ৳1,000',
      color: '#e11d48',
      accent: '#fff1f2',
      border: '#fecdd3',
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
      ctaAction: 'mailto:support@biyekori.com?subject=Upgrade to Standard&body=Please upgrade my account to Standard plan.',
      ctaStyle: 'solid',
    },
    {
      id: 'shopno',
      name: 'Premium',
      bangla: 'প্রিমিয়াম',
      price: 999,
      priceLabel: '৳999',
      period: 'per month',
      yearly: '৳9,999/year',
      yearlySave: 'Save ৳2,000',
      color: '#7c3aed',
      accent: '#f5f3ff',
      border: '#ddd6fe',
      popular: false,
      features: [
        'Everything in Standard',
        'Unlimited contact viewing',
        'Unlimited messages',
        'Top search placement',
        '3 Profile Spotlights per month',
        'Featured gold badge',
        'Weekly AI match suggestions',
        'Priority support',
      ],
      missing: [],
      cta: 'Upgrade to Premium',
      ctaAction: 'mailto:support@biyekori.com?subject=Upgrade to Premium&body=Please upgrade my account to Premium plan.',
      ctaStyle: 'gradient',
    },
  ]

  const nrbPlan = {
    name: 'Global',
    bangla: 'প্রবাসী',
    price: '$15',
    period: 'per month (USD)',
    features: [
      'All Premium features',
      'USD pricing — pay from anywhere',
      'Priority matching with NRB profiles',
      'Dedicated WhatsApp support',
      'English-first interface',
    ],
    cta: 'Contact for Global Plan',
    ctaAction: 'mailto:support@biyekori.com?subject=Global NRB Plan',
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', paddingTop: '80px', paddingBottom: '80px' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 20px' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <p style={{ margin: '0 0 12px', fontSize: '12px', letterSpacing: '3px', color: '#e11d48', fontWeight: 700, textTransform: 'uppercase' }}>PRICING</p>
          <h1 style={{ margin: '0 0 16px', fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 900, color: '#111827', lineHeight: 1.2 }}>
            Simple, transparent pricing
          </h1>
          <p style={{ margin: '0 0 8px', fontSize: '18px', color: '#6b7280', lineHeight: 1.6 }}>
            Start free. Upgrade when you're ready.
          </p>
          <p style={{ margin: 0, fontSize: '15px', color: '#9ca3af' }}>
            সহজ মূল্য, কোনো লুকানো চার্জ নেই
          </p>
        </div>

        {/* Plans grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '40px' }}>
          {plans.map((plan) => (
            <div key={plan.id} style={{
              background: 'white',
              borderRadius: '20px',
              border: plan.popular ? `2px solid ${plan.color}` : '1px solid #e5e7eb',
              overflow: 'hidden',
              boxShadow: plan.popular ? `0 8px 32px ${plan.color}20` : '0 2px 12px rgba(0,0,0,0.06)',
              position: 'relative',
              transition: 'transform 0.2s',
            }}>

              {/* Popular badge */}
              {plan.popular && (
                <div style={{
                  background: `linear-gradient(135deg, ${plan.color}, #db2777)`,
                  color: 'white', textAlign: 'center',
                  padding: '8px', fontSize: '12px', fontWeight: 800,
                  letterSpacing: '1px', textTransform: 'uppercase'
                }}>
                  Most Popular
                </div>
              )}

              <div style={{ padding: '32px 28px' }}>
                {/* Plan name */}
                <div style={{ marginBottom: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                    <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 900, color: '#111827' }}>{plan.name}</h2>
                    <span style={{ fontSize: '13px', color: plan.color, fontWeight: 700, background: plan.accent, padding: '2px 10px', borderRadius: '20px' }}>
                      {plan.bangla}
                    </span>
                  </div>

                  {/* Price */}
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', margin: '16px 0 4px' }}>
                    <span style={{ fontSize: '42px', fontWeight: 900, color: '#111827', lineHeight: 1 }}>{plan.priceLabel}</span>
                    <span style={{ fontSize: '14px', color: '#9ca3af' }}>{plan.period}</span>
                  </div>

                  {(plan as any).yearly && (
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <span style={{ fontSize: '13px', color: '#6b7280' }}>{(plan as any).yearly}</span>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: '#10b981', background: '#f0fdf4', padding: '2px 8px', borderRadius: '20px' }}>
                        {(plan as any).yearlySave}
                      </span>
                    </div>
                  )}
                </div>

                {/* CTA Button */}
                <Link href={plan.ctaAction} style={{
                  display: 'block', width: '100%', padding: '14px',
                  borderRadius: '12px', fontSize: '14px', fontWeight: 800,
                  textAlign: 'center', textDecoration: 'none', marginBottom: '28px',
                  background: plan.ctaStyle === 'gradient'
                    ? `linear-gradient(135deg, ${plan.color}, #e11d48)`
                    : plan.ctaStyle === 'solid'
                    ? plan.color
                    : 'white',
                  color: plan.ctaStyle === 'outline' ? plan.color : 'white',
                  border: plan.ctaStyle === 'outline' ? `2px solid ${plan.color}` : 'none',
                  boxSizing: 'border-box',
                }}>
                  {plan.cta}
                </Link>

                {/* Divider */}
                <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: '20px' }}>
                  <p style={{ margin: '0 0 12px', fontSize: '12px', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    What's included
                  </p>

                  {/* Features */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {plan.features.map((f, i) => (
                      <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, marginTop: '1px' }}>
                          <circle cx="12" cy="12" r="10" fill={plan.color} opacity="0.15"/>
                          <path d="M8 12l3 3 5-5" stroke={plan.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <span style={{ fontSize: '13px', color: '#374151', lineHeight: 1.4 }}>{f}</span>
                      </div>
                    ))}

                    {/* Missing features */}
                    {plan.missing.map((f, i) => (
                      <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', opacity: 0.4 }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, marginTop: '1px' }}>
                          <circle cx="12" cy="12" r="10" fill="#9ca3af" opacity="0.2"/>
                          <path d="M8 12h8" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round"/>
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

        {/* NRB/Global Plan */}
        <div style={{
          background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
          borderRadius: '20px', padding: '36px 40px',
          display: 'grid', gridTemplateColumns: '1fr auto',
          gap: '32px', alignItems: 'center',
          marginBottom: '60px'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <h3 style={{ margin: 0, fontSize: '22px', fontWeight: 900, color: 'white' }}>{nrbPlan.name}</h3>
              <span style={{ fontSize: '13px', color: '#a5b4fc', fontWeight: 700, background: 'rgba(165,180,252,0.15)', padding: '2px 10px', borderRadius: '20px' }}>
                {nrbPlan.bangla}
              </span>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#fbbf24', background: 'rgba(251,191,36,0.15)', padding: '2px 8px', borderRadius: '20px' }}>
                Overseas Bangladeshi
              </span>
            </div>
            <p style={{ margin: '0 0 16px', fontSize: '28px', fontWeight: 900, color: 'white' }}>
              {nrbPlan.price} <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', fontWeight: 400 }}>{nrbPlan.period}</span>
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {nrbPlan.features.map((f, i) => (
                <span key={i} style={{ fontSize: '12px', color: 'rgba(255,255,255,0.8)', background: 'rgba(255,255,255,0.1)', padding: '4px 12px', borderRadius: '20px' }}>
                  {f}
                </span>
              ))}
            </div>
          </div>
          <Link href={nrbPlan.ctaAction} style={{
            flexShrink: 0, padding: '14px 28px',
            background: 'linear-gradient(135deg, #F0C040, #C07800)',
            color: '#080604', borderRadius: '12px',
            fontSize: '14px', fontWeight: 800,
            textDecoration: 'none', whiteSpace: 'nowrap'
          }}>
            {nrbPlan.cta}
          </Link>
        </div>

        {/* FAQ / Reassurance */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '48px' }}>
          {[
            { icon: '🔒', title: 'No hidden charges', desc: 'Pay only what you see. Cancel anytime via email.' },
            { icon: '📱', title: 'Pay via bKash', desc: 'Send payment to 01733577215 and email us your transaction ID.' },
            { icon: '⚡', title: 'Instant activation', desc: 'Your plan is activated within 2 hours of payment confirmation.' },
            { icon: '🤝', title: 'Satisfaction guaranteed', desc: 'Not happy? Contact us within 7 days for a full refund.' },
          ].map((item, i) => (
            <div key={i} style={{ background: 'white', borderRadius: '14px', padding: '20px', border: '1px solid #f1f5f9', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
              <span style={{ fontSize: '24px', display: 'block', marginBottom: '10px' }}>{item.icon}</span>
              <p style={{ margin: '0 0 6px', fontSize: '14px', fontWeight: 700, color: '#111827' }}>{item.title}</p>
              <p style={{ margin: 0, fontSize: '13px', color: '#6b7280', lineHeight: 1.5 }}>{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div style={{ textAlign: 'center', background: 'white', borderRadius: '20px', padding: '48px 32px', border: '1px solid #f1f5f9' }}>
          <h3 style={{ margin: '0 0 12px', fontSize: '24px', fontWeight: 800, color: '#111827' }}>
            Still not sure? Start free.
          </h3>
          <p style={{ margin: '0 0 24px', fontSize: '15px', color: '#6b7280' }}>
            No credit card needed. Create your profile and explore for free — upgrade only when you find someone worth contacting.
          </p>
          <Link href="/register" style={{
            display: 'inline-block', padding: '14px 40px',
            background: 'linear-gradient(135deg, #e11d48, #db2777)',
            color: 'white', borderRadius: '12px',
            fontSize: '15px', fontWeight: 800, textDecoration: 'none'
          }}>
            Create Free Profile
          </Link>
        </div>

      </div>
    </div>
  )
}
