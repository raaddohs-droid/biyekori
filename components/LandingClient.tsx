'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

function FadeIn({ children, delay = 0 }: { children: React.ReactNode, delay?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true) }, { threshold: 0.1 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])
  return (
    <div ref={ref} style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(28px)', transition: `opacity 0.65s ease ${delay}ms, transform 0.65s ease ${delay}ms` }}>
      {children}
    </div>
  )
}

function HoverCard({ children, href, style }: { children: React.ReactNode, href?: string, style?: React.CSSProperties }) {
  const [hovered, setHovered] = useState(false)
  const base: React.CSSProperties = { ...style, transform: hovered ? 'translateY(-5px)' : 'translateY(0)', boxShadow: hovered ? '0 16px 40px rgba(123,29,46,0.1)' : 'none', transition: 'transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease', borderColor: hovered ? 'rgba(123,29,46,0.35)' : ((style as any)?.borderColor || 'rgba(240,192,64,0.1)'), cursor: 'pointer' }
  if (href) return <Link href={href} style={{ textDecoration: 'none', display: 'block' }}><div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} style={base}>{children}</div></Link>
  return <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} style={base}>{children}</div>
}

function Counter({ target }: { target: number }) {
  const [count, setCount] = useState(0)
  const [started, setStarted] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting && !started) setStarted(true) }, { threshold: 0.5 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [started])
  useEffect(() => {
    if (!started) return
    const steps = 60
    const increment = target / steps
    let current = 0
    const timer = setInterval(() => {
      current += increment
      if (current >= target) { setCount(target); clearInterval(timer) }
      else setCount(Math.floor(current))
    }, 1800 / steps)
    return () => clearInterval(timer)
  }, [started, target])
  return <div ref={ref}>{count.toLocaleString()}</div>
}

export default function LandingClient() {
  return (
    <>
      {/* STATS */}
      <FadeIn delay={100}>
        <div style={{ display: 'flex', gap: '48px', flexWrap: 'wrap', justifyContent: 'center', padding: '0 24px 40px' }}>
          {[{ target: 1811, label: 'Women registered' }, { target: 1199, label: 'Men registered' }, { target: 3010, label: 'Total profiles' }].map(({ target, label }) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 'clamp(26px, 3vw, 38px)', fontWeight: 800, color: '#F0C040', letterSpacing: '-1px' }}>
                <Counter target={target} />
              </div>
              <div style={{ fontSize: '13px', color: '#6b4040', letterSpacing: '1px', marginTop: '4px', fontFamily: 'system-ui, sans-serif' }}>{label}</div>
            </div>
          ))}
        </div>
      </FadeIn>

      {/* WHO IS THIS FOR */}
      <section style={{ padding: 'clamp(60px,8vw,100px) clamp(24px,6vw,80px)', borderTop: '1px solid rgba(123,29,46,0.08)', background: '#FFFBF5' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <FadeIn>
            <p style={{ fontSize: '14px', color: 'rgba(123,29,46,0.7)', letterSpacing: '3px', marginBottom: '16px', textAlign: 'center', fontFamily: 'system-ui, sans-serif', textTransform: 'uppercase' }}>Biyekori is for</p>
            <h2 style={{ fontSize: 'clamp(28px, 3.5vw, 48px)', fontWeight: 700, color: '#1a0a0d', textAlign: 'center', margin: '0 0 56px', lineHeight: 1.2 }}>
              Whether you&apos;re searching for yourself<br/>
              <span style={{ color: '#F0C040' }}>or for someone you love</span>
            </h2>
          </FadeIn>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
            {[
              { icon: '👤', title: 'For Yourself', desc: 'Browse privately. No pressure. Message when you are ready. Your profile, your pace.', href: '/register' },
              { icon: '👨‍👩‍👧', title: 'For Your Child', desc: 'Guardian Mode lets parents manage the profile with full control. Family always involved.', href: '/register' },
              { icon: '👫', title: 'For a Sibling', desc: 'Create a profile for your brother or sister. Filter by their preferences, shortlist the best.', href: '/register' },
              { icon: '✈️', title: 'Living Abroad', desc: 'Bangladeshis in UK, USA, Canada and beyond. Find someone from home, wherever you are.', href: '/register' },
            ].map(({ icon, title, desc, href }, i) => (
              <FadeIn key={title} delay={i * 80}>
                <HoverCard href={href} style={{ background: 'white', border: '1px solid rgba(123,29,46,0.1)', borderRadius: '16px', padding: '28px 24px' }}>
                  <div style={{ fontSize: '32px', marginBottom: '14px' }}>{icon}</div>
                  <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1a0a0d', margin: '0 0 10px' }}>{title}</h3>
                  <p style={{ fontSize: '15px', color: '#4b2020', lineHeight: 1.75, margin: '0 0 16px', fontFamily: 'system-ui, sans-serif' }}>{desc}</p>
                  <span style={{ fontSize: '13px', color: '#7B1D2E', fontFamily: 'system-ui, sans-serif' }}>Get started \u2192</span>
                </HoverCard>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* AI MATCH SCORE */}
      <section style={{ padding: 'clamp(60px,8vw,100px) clamp(24px,6vw,80px)', borderTop: '1px solid rgba(123,29,46,0.08)', background: '#FFFBF5' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '64px', alignItems: 'center' }}>
          <FadeIn>
            <p style={{ fontSize: '14px', color: 'rgba(123,29,46,0.7)', letterSpacing: '3px', marginBottom: '16px', fontFamily: 'system-ui, sans-serif', textTransform: 'uppercase' }}>The feature nobody else has</p>
            <h2 style={{ fontSize: 'clamp(28px, 3.5vw, 48px)', fontWeight: 700, color: '#1a0a0d', margin: '0 0 20px', lineHeight: 1.1 }}>
              See <span style={{ color: '#F0C040' }}>exactly</span> why<br/>you match.
            </h2>
            <p style={{ fontSize: 'clamp(16px, 1.4vw, 18px)', color: '#3d1515', lineHeight: 1.9, margin: '0 0 28px', fontFamily: 'system-ui, sans-serif' }}>
              Every profile shows a personal compatibility score — a field-by-field breakdown. Religion, age, height, income, location, family values. See where you match and where you don&apos;t, before you say hello.
            </p>
            <p style={{ fontSize: '15px', color: 'rgba(253,246,238,0.52)', fontStyle: 'italic', fontFamily: 'system-ui, sans-serif', marginBottom: '28px' }}>No other matrimony platform in Bangladesh does this.</p>
            <Link href="/profiles" style={{ display: 'inline-block', padding: '14px 32px', background: 'linear-gradient(135deg, #F0C040, #C07800)', color: '#080604', fontSize: '14px', fontWeight: 700, textDecoration: 'none', borderRadius: '4px', letterSpacing: '2px', fontFamily: 'system-ui, sans-serif' }}>
              SEE LIVE SCORES
            </Link>
          </FadeIn>
          <FadeIn delay={150}>
            <div style={{ background: 'linear-gradient(135deg, rgba(240,192,64,0.07), rgba(240,192,64,0.02))', border: '1px solid rgba(240,192,64,0.2)', borderRadius: '20px', padding: '28px', fontFamily: 'system-ui, sans-serif' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid rgba(240,192,64,0.12)' }}>
                <div>
                  <div style={{ fontSize: '13px', color: '#6b7280', letterSpacing: '1px', marginBottom: '4px' }}>WHY YOU MATCH</div>
                  <div style={{ fontSize: '16px', color: '#1a0a0d', fontWeight: 600 }}>Sumaiya, 26 \u00b7 Dhaka</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '40px', fontWeight: 900, color: '#10b981', lineHeight: 1 }}>86%</div>
                  <div style={{ fontSize: '12px', color: '#10b981', marginTop: '2px' }}>Great match</div>
                </div>
              </div>
              {[
                { icon: '\ud83d\udd4c', label: 'Religion', you: 'Islam', them: 'Islam', match: true, pts: '15/15' },
                { icon: '\ud83c\udf82', label: 'Age', you: '25\u201332 yrs', them: '28 yrs', match: true, pts: '12/12' },
                { icon: '\ud83c\udf93', label: 'Education', you: "Master's+", them: "Master's", match: true, pts: '8/8' },
                { icon: '\ud83d\udcb0', label: 'Income', you: '\u09f3 50,000+', them: '\u09f3 45,000', match: false, pts: '3/7' },
                { icon: '\ud83d\udccd', label: 'Location', you: 'Dhaka', them: 'Dhaka', match: true, pts: '7/7' },
              ].map(({ icon, label, you, them, match, pts }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px', borderRadius: '10px', marginBottom: '7px', background: match ? 'rgba(16,185,129,0.08)' : 'rgba(249,115,22,0.08)', border: `1px solid ${match ? 'rgba(16,185,129,0.2)' : 'rgba(249,115,22,0.2)'}` }}>
                  <span style={{ fontSize: '16px', width: '22px' }}>{icon}</span>
                  <span style={{ fontSize: '13px', color: '#1a0a0d', width: '68px', fontWeight: 600 }}>{label}</span>
                  <span style={{ fontSize: '11px', color: '#6b7280', flex: 1 }}>You: {you} \u00b7 Profile: {them}</span>
                  <span style={{ fontSize: '14px' }}>{match ? '\u2705' : '\u274c'}</span>
                  <span style={{ fontSize: '11px', color: '#9ca3af', width: '34px', textAlign: 'right' }}>{pts}</span>
                </div>
              ))}
              <div style={{ marginTop: '14px', textAlign: 'center' }}>
                <span style={{ fontSize: '12px', color: '#9ca3af' }}>Based on 13 compatibility factors</span>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* FEATURES */}
      <section style={{ padding: 'clamp(60px,8vw,100px) clamp(24px,6vw,80px)', borderTop: '1px solid rgba(123,29,46,0.08)', background: '#FFFBF5' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <FadeIn>
            <p style={{ fontSize: '14px', color: 'rgba(123,29,46,0.7)', letterSpacing: '3px', marginBottom: '16px', textAlign: 'center', fontFamily: 'system-ui, sans-serif', textTransform: 'uppercase' }}>What makes Biyekori different</p>
            <h2 style={{ fontSize: 'clamp(28px, 3vw, 44px)', fontWeight: 700, color: '#1a0a0d', textAlign: 'center', margin: '0 0 56px', lineHeight: 1.2 }}>
              Built for Bangladesh.<br/><span style={{ color: '#F0C040' }}>Every detail.</span>
            </h2>
          </FadeIn>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
            {[
              { icon: '\ud83d\udee1\ufe0f', title: 'Guardian Mode', desc: 'Parents or siblings manage the profile. Badges show who controls each account. Family always in the loop.', href: '/register' },
              { icon: '\ud83d\udcde', title: 'Safe Voice Calling', desc: 'Talk before you meet. In-app calling — no phone numbers shared until both sides are ready.', href: '/profiles' },
              { icon: '\ud83d\udd12', title: 'Photo Privacy', desc: 'Your photo is only shown to people you approve. Full control over who sees your face.', href: '/register' },
              { icon: '\ud83c\udf0d', title: 'NRB Ready', desc: 'Dedicated profiles for Bangladeshis in UK, USA, Canada, Australia, UAE and beyond.', href: '/profiles' },
              { icon: '\ud83c\udfae', title: 'A Day Together', desc: 'A fun compatibility game you play together. 12 scenarios, sealed reveal, AI summary.', href: '/profiles' },
              { icon: '\ud83d\udcc4', title: 'PDF Biodata', desc: 'One click. A beautifully formatted biodata ready to share with parents or relatives.', href: '/profiles' },
            ].map(({ icon, title, desc, href }, i) => (
              <FadeIn key={title} delay={i * 60}>
                <HoverCard href={href} style={{ padding: '28px 24px', background: 'white', border: '1px solid rgba(123,29,46,0.08)', borderRadius: '16px' }}>
                  <div style={{ fontSize: '30px', marginBottom: '14px' }}>{icon}</div>
                  <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#1a0a0d', margin: '0 0 10px' }}>{title}</h3>
                  <p style={{ fontSize: '14px', color: '#5c3030', lineHeight: 1.85, margin: '0 0 14px', fontFamily: 'system-ui, sans-serif' }}>{desc}</p>
                  <span style={{ fontSize: '13px', color: '#7B1D2E', fontFamily: 'system-ui, sans-serif' }}>Learn more \u2192</span>
                </HoverCard>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* TRUST */}
      <section style={{ padding: 'clamp(60px,8vw,100px) clamp(24px,6vw,80px)', borderTop: '1px solid rgba(123,29,46,0.08)', textAlign: 'center', background: '#FFF0F3' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <FadeIn>
            <p style={{ fontSize: '14px', color: 'rgba(123,29,46,0.7)', letterSpacing: '3px', marginBottom: '16px', fontFamily: 'system-ui, sans-serif', textTransform: 'uppercase' }}>Safety and trust</p>
            <h2 style={{ fontSize: 'clamp(28px, 3vw, 44px)', fontWeight: 700, color: '#1a0a0d', margin: '0 0 16px', lineHeight: 1.2 }}>
              Your family&apos;s trust<br/><span style={{ color: '#F0C040' }}>is not negotiable.</span>
            </h2>
            <p style={{ fontSize: 'clamp(16px, 1.4vw, 18px)', color: '#4b2020', lineHeight: 1.9, margin: '0 0 52px', fontFamily: 'system-ui, sans-serif' }}>
              Every account requires phone verification. Premium members go through photo and NID document checks. Fake profiles are removed immediately. You can block or report anyone, anytime.
            </p>
          </FadeIn>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '16px' }}>
            {[
              ['\ud83d\udcf1', 'Phone verified', 'Every account', '/register'],
              ['\ud83e\udeb4', 'NID verified', 'Premium members', '/pricing'],
              ['\ud83e\udd73', 'Selfie check', 'AI liveness', '/register'],
              ['\ud83d\udd10', 'Photo privacy', 'Your control', '/register'],
              ['\ud83d\udeab', 'Block and report', 'Always available', '/profiles'],
            ].map(([icon, title, sub, href], i) => (
              <FadeIn key={title as string} delay={i * 70}>
                <HoverCard href={href as string} style={{ padding: '22px 14px', background: 'white', border: '1px solid rgba(123,29,46,0.1)', borderRadius: '12px' }}>
                  <div style={{ fontSize: '28px', marginBottom: '10px' }}>{icon}</div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#1a0a0d', marginBottom: '5px' }}>{title as string}</div>
                  <div style={{ fontSize: '12px', color: '#6b7280', fontFamily: 'system-ui, sans-serif' }}>{sub as string}</div>
                </HoverCard>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>


      {/* HOW IT WORKS */}
      <section style={{ padding: 'clamp(60px,8vw,100px) clamp(24px,6vw,80px)', background: '#FFFBF5', borderTop: '1px solid rgba(123,29,46,0.08)' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <FadeIn>
            <div style={{ textAlign: 'center', marginBottom: 'clamp(48px,6vw,72px)' }}>
              <p style={{ fontSize: '11px', color: 'rgba(123,29,46,0.6)', letterSpacing: '4px', marginBottom: '14px', fontFamily: 'system-ui, sans-serif', textTransform: 'uppercase' }}>How It Works</p>
              <h2 style={{ fontSize: 'clamp(28px, 3vw, 44px)', fontWeight: 700, color: '#1a0a0d', margin: '0 0 16px', lineHeight: 1.15 }}>
                Three steps to finding<br/>
                <span style={{ color: '#7B1D2E' }}>the one</span>
              </h2>
              <p style={{ fontSize: 'clamp(15px, 1.3vw, 17px)', color: '#4b2020', maxWidth: '480px', margin: '0 auto', lineHeight: 1.8, fontFamily: 'system-ui, sans-serif' }}>
                At your own pace. On your own terms.
              </p>
            </div>
          </FadeIn>

          {/* Steps with connecting line */}
          <div style={{ position: 'relative' }}>
            {/* Connecting line - desktop only */}
            <div style={{ position: 'absolute', top: '52px', left: '16.5%', right: '16.5%', height: '2px', background: 'linear-gradient(90deg, #7B1D2E, #9D174D, #7B1D2E)', opacity: 0.15, borderRadius: '2px' }} />

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
              {[
                {
                  num: '01',
                  icon: '👤',
                  title: 'Create Your Profile',
                  desc: 'Tell your story — who you are, what you value, what you're looking for. Takes two minutes.',
                  cta: 'Free to join',
                },
                {
                  num: '02',
                  icon: '✨',
                  title: 'Get Matched',
                  desc: 'AI finds profiles that match your religion, values, lifestyle and family expectations — with a score that explains why.',
                  cta: 'See live scores',
                },
                {
                  num: '03',
                  icon: '💬',
                  title: 'Connect Safely',
                  desc: 'Send interest, share biodata, talk on-platform. No phone numbers. No pressure. Family can be involved at every step.',
                  cta: 'Browse profiles',
                },
              ].map(({ num, icon, title, desc, cta }, i) => (
                <FadeIn key={num} delay={i * 150}>
                  <div style={{ textAlign: 'center', padding: '0 16px' }}>
                    {/* Number circle */}
                    <div style={{ width: '64px', height: '64px', borderRadius: '50%', border: '2px solid #7B1D2E', background: '#FFFBF5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', position: 'relative', zIndex: 1 }}>
                      <span style={{ fontSize: '22px', fontWeight: 900, color: '#7B1D2E', fontFamily: 'Georgia, serif', letterSpacing: '-1px' }}>{num}</span>
                    </div>
                    {/* Icon */}
                    <div style={{ fontSize: '36px', marginBottom: '16px' }}>{icon}</div>
                    {/* Title */}
                    <h3 style={{ margin: '0 0 12px', fontSize: 'clamp(17px,1.5vw,20px)', fontWeight: 800, color: '#1a0a0d', fontFamily: 'Georgia, serif', lineHeight: 1.2 }}>{title}</h3>
                    {/* Desc */}
                    <p style={{ margin: '0 0 16px', fontSize: '14px', color: '#4b5563', lineHeight: 1.8, fontFamily: 'system-ui, sans-serif' }}>{desc}</p>
                    {/* Subtle cta */}
                    <span style={{ fontSize: '12px', color: '#7B1D2E', fontWeight: 700, letterSpacing: '1px', fontFamily: 'system-ui, sans-serif', textTransform: 'uppercase' }}>{cta} →</span>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>

          {/* CTA */}
          <FadeIn delay={500}>
            <div style={{ textAlign: 'center', marginTop: '56px' }}>
              <a href="/register" style={{ display: 'inline-block', padding: '16px 44px', background: 'linear-gradient(135deg, #7B1D2E, #9D174D)', color: 'white', borderRadius: '4px', fontSize: '13px', fontWeight: 700, textDecoration: 'none', letterSpacing: '3px', fontFamily: 'system-ui, sans-serif', textTransform: 'uppercase' }}>
                Start Free Today
              </a>
              <p style={{ margin: '14px 0 0', fontSize: '12px', color: '#9ca3af', fontFamily: 'system-ui, sans-serif', letterSpacing: '1px' }}>
                NO CREDIT CARD · CANCEL ANYTIME
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* MISSION */}
      <section style={{ padding: 'clamp(60px,8vw,100px) clamp(24px,6vw,80px)', borderTop: '1px solid rgba(123,29,46,0.08)', background: '#FFFBF5' }}>
        <FadeIn>
          <div style={{ maxWidth: '700px', margin: '0 auto', textAlign: 'center' }}>
            <p style={{ fontSize: 'clamp(18px, 2vw, 26px)', color: '#2d1010', lineHeight: 2.0, fontStyle: 'italic', margin: '0 0 28px' }}>
              &ldquo;We built Biyekori because finding the right match should feel as careful and respectful as the families doing the searching.&rdquo;
            </p>
            <p style={{ fontSize: '13px', color: '#9ca3af', letterSpacing: '2px', fontFamily: 'system-ui, sans-serif' }}>THE BIYEKORI TEAM \u00b7 DHAKA, BANGLADESH</p>
          </div>
        </FadeIn>
      </section>
    </>
  )
}

