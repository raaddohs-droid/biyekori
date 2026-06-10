import Link from "next/link"
import HomeCTA from "@/components/HomeCTA"
import HomeCTA2 from "@/components/HomeCTA2"

export default function Home() {
  return (
    <main style={{ fontFamily: "'Georgia', serif", background: '#080604', color: '#FDF6EE', overflowX: 'hidden' }}>

      <section style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundImage: "url('/hero-bg.jpg')", backgroundSize: 'cover', backgroundPosition: 'center 30%', backgroundRepeat: 'no-repeat', padding: '120px 24px 80px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(8,6,4,0.55)', pointerEvents: 'none' }}/>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '800px', height: '800px', borderRadius: '50%', background: 'radial-gradient(circle,rgba(192,120,0,0.09) 0%,transparent 65%)', pointerEvents: 'none' }}/>
        <p style={{ fontSize: 'clamp(18px, 2.5vw, 28px)', fontWeight: 400, color: '#F0C040', margin: '0 0 20px', letterSpacing: '2px', position: 'relative', zIndex: 2, fontStyle: 'italic', opacity: 0.9 }}>
          <span style={{fontFamily: "var(--font-hind-siliguri)"}}>আপনার জন্য কেউ অপেক্ষা করছে</span>
        </p>
        <h1 style={{ fontSize: 'clamp(36px, 6vw, 82px)', fontWeight: 700, color: '#FFFFFF', margin: '0 0 20px', lineHeight: 1.05, letterSpacing: '-2px', position: 'relative', zIndex: 2, textShadow: '0 2px 30px rgba(0,0,0,0.8)' }}>
          Someone is waiting<br/>for you.
        </h1>
        <p style={{ fontSize: 'clamp(15px, 1.6vw, 20px)', color: 'rgba(253,246,238,0.65)', margin: '0 0 48px', lineHeight: 1.7, maxWidth: '520px', position: 'relative', zIndex: 2 }}>
          Bangladesh&apos;s most thoughtful matrimony platform. Real profiles, real families, real matches — with AI that explains exactly why two people belong together.
        </p>
        <HomeCTA />
        <div style={{ position: 'relative', zIndex: 2, display: 'flex', gap: '40px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '8px' }}>
          {[['3,010+', 'Verified profiles'], ['64', 'Districts covered'], ['100%', 'Free to join']].map(([n, l]) => (
            <div key={n} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 'clamp(20px, 2.5vw, 30px)', fontWeight: 800, color: '#F0C040' }}>{n}</div>
              <div style={{ fontSize: '11px', color: 'rgba(253,246,238,0.4)', letterSpacing: '2px', marginTop: '2px' }}>{l}</div>
            </div>
          ))}
        </div>
        <div style={{ position: 'relative', zIndex: 2, display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '40px' }}>
          {['For yourself', 'For your son or daughter', 'For a sibling', 'For someone abroad'].map(label => (
            <span key={label} style={{ fontSize: '12px', color: 'rgba(253,246,238,0.5)', border: '1px solid rgba(240,192,64,0.2)', borderRadius: '20px', padding: '5px 14px', letterSpacing: '0.5px' }}>{label}</span>
          ))}
        </div>
        <div style={{ position: 'absolute', bottom: '40px', left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', opacity: 0.25, zIndex: 2 }}>
          <div style={{ width: '1px', height: '48px', background: 'linear-gradient(to bottom, transparent, #F0C040)' }}/>
          <span style={{ fontSize: '10px', letterSpacing: '3px', color: '#F0C040' }}>SCROLL</span>
        </div>
      </section>

      <section style={{ padding: 'clamp(60px,8vw,100px) clamp(24px,6vw,80px)', borderTop: '1px solid rgba(240,192,64,0.06)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <p style={{ fontSize: '11px', color: 'rgba(240,192,64,0.4)', letterSpacing: '3px', marginBottom: '20px', textAlign: 'center' }}>WHO BIYEKORI IS FOR</p>
          <h2 style={{ fontSize: 'clamp(24px, 3.5vw, 44px)', fontWeight: 700, color: '#FDF6EE', textAlign: 'center', margin: '0 0 60px', lineHeight: 1.2 }}>
            Whether you&apos;re searching yourself<br/>
            <span style={{ color: '#F0C040' }}>or searching for someone you love</span>
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' }}>
            {[
              { icon: '👤', title: 'For Yourself', desc: 'Browse privately. Message when you are ready. Your profile, your pace. No pressure.' },
              { icon: '👨‍👩‍👧', title: 'For Your Child', desc: 'Guardian Mode lets parents manage their child\'s profile with full control. The family stays involved.' },
              { icon: '👫', title: 'For a Sibling', desc: 'Create a profile on behalf of your brother or sister. Filter by their preferences, shortlist the best.' },
              { icon: '✈️', title: 'For Someone Abroad', desc: 'NRB profiles from UK, USA, Canada and beyond. Find someone from home, wherever you are.' },
            ].map(({ icon, title, desc }) => (
              <div key={title} style={{ background: 'rgba(240,192,64,0.04)', border: '1px solid rgba(240,192,64,0.1)', borderRadius: '16px', padding: '32px 28px' }}>
                <div style={{ fontSize: '32px', marginBottom: '16px' }}>{icon}</div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#FDF6EE', margin: '0 0 10px' }}>{title}</h3>
                <p style={{ fontSize: '14px', color: 'rgba(253,246,238,0.5)', lineHeight: 1.8, margin: 0 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: 'clamp(60px,8vw,100px) clamp(24px,6vw,80px)', borderTop: '1px solid rgba(240,192,64,0.06)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '80px', alignItems: 'center' }}>
          <div>
            <p style={{ fontSize: '11px', color: 'rgba(240,192,64,0.4)', letterSpacing: '3px', marginBottom: '16px' }}>AI MATCH SCORE</p>
            <h2 style={{ fontSize: 'clamp(26px, 3.5vw, 46px)', fontWeight: 700, color: '#FDF6EE', margin: '0 0 16px', lineHeight: 1.15 }}>
              <span style={{ color: '#F0C040', fontFamily: 'var(--font-hind-siliguri)' }}>মিল আছে কিনা —</span><br/>
              <span style={{ fontFamily: 'var(--font-hind-siliguri)' }}>এক নজরেই বুঝুন</span>
            </h2>
            <p style={{ fontSize: 'clamp(14px, 1.4vw, 17px)', color: 'rgba(253,246,238,0.55)', lineHeight: 1.9, margin: '0 0 32px' }}>
              Every profile gets a personal match score based on your religion, age preference, height, education, income expectations, family values, location and more. Not a black box — every point explained, field by field.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                ['🕌', 'Religion & religious level'],
                ['🎂', 'Age range compatibility'],
                ['📍', 'Location & district match'],
                ['💰', 'Income expectation met'],
                ['✅', 'Profile trust & verification'],
              ].map(([icon, label]) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '18px' }}>{icon}</span>
                  <span style={{ fontSize: '14px', color: 'rgba(253,246,238,0.6)' }}>{label}</span>
                  <span style={{ marginLeft: 'auto', fontSize: '11px', color: '#10b981', fontWeight: 700 }}>✅ scored</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ background: 'rgba(240,192,64,0.04)', border: '1px solid rgba(240,192,64,0.15)', borderRadius: '20px', padding: '32px', fontFamily: 'system-ui, sans-serif' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <span style={{ fontSize: '13px', color: 'rgba(253,246,238,0.4)', letterSpacing: '1px' }}>💕 WHY YOU MATCH</span>
              <span style={{ fontSize: '32px', fontWeight: 900, color: '#10b981' }}>86%</span>
            </div>
            {[
              { icon: '🕌', label: 'Religion', you: 'Islam', them: 'Islam', match: true, pts: '15/15' },
              { icon: '🎂', label: 'Age', you: '25–32 yrs', them: '28 yrs', match: true, pts: '12/12' },
              { icon: '🎓', label: 'Education', you: "Master's", them: "Master's", match: true, pts: '8/8' },
              { icon: '💰', label: 'Income', you: '৳50k+', them: '৳45k', match: false, pts: '3/7' },
              { icon: '📍', label: 'Location', you: 'Dhaka', them: 'Dhaka', match: true, pts: '7/7' },
            ].map(({ icon, label, you, them, match, pts }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px', borderRadius: '10px', marginBottom: '8px', background: match ? 'rgba(16,185,129,0.06)' : 'rgba(249,115,22,0.06)', border: `1px solid ${match ? 'rgba(16,185,129,0.15)' : 'rgba(249,115,22,0.15)'}` }}>
                <span style={{ fontSize: '16px' }}>{icon}</span>
                <span style={{ fontSize: '12px', color: 'rgba(253,246,238,0.7)', width: '70px' }}>{label}</span>
                <span style={{ fontSize: '10px', color: 'rgba(253,246,238,0.35)', flex: 1 }}>You: {you} • Profile: {them}</span>
                <span style={{ fontSize: '11px', fontWeight: 700 }}>{match ? '✅' : '❌'}</span>
                <span style={{ fontSize: '10px', color: 'rgba(253,246,238,0.3)', width: '36px', textAlign: 'right' }}>{pts}</span>
              </div>
            ))}
            <div style={{ marginTop: '16px', padding: '12px', background: 'rgba(240,192,64,0.06)', borderRadius: '10px', textAlign: 'center' }}>
              <span style={{ fontSize: '12px', color: 'rgba(253,246,238,0.4)' }}>Score based on 13 compatibility factors</span>
            </div>
          </div>
        </div>
      </section>

      <section style={{ padding: 'clamp(60px,8vw,100px) clamp(24px,6vw,80px)', borderTop: '1px solid rgba(240,192,64,0.06)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <p style={{ fontSize: '11px', color: 'rgba(240,192,64,0.4)', letterSpacing: '3px', marginBottom: '16px', textAlign: 'center' }}>WHAT MAKES US DIFFERENT</p>
          <h2 style={{ fontSize: 'clamp(24px, 3vw, 40px)', fontWeight: 700, color: '#FDF6EE', textAlign: 'center', margin: '0 0 56px', lineHeight: 1.2 }}>
            Built for Bangladesh.<br/><span style={{ color: '#F0C040' }}>Every detail.</span>
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2px', border: '1px solid rgba(240,192,64,0.08)', borderRadius: '20px', overflow: 'hidden' }}>
            {[
              { icon: '🛡️', title: 'Guardian Mode', desc: 'Parents or siblings can fully manage a profile. Perfect for families who want to stay involved in the search.' },
              { icon: '♥', title: 'AI Match Score', desc: 'A transparent compatibility score based on 13 real factors. Not guesswork — you see exactly why you match.' },
              { icon: '🔒', title: 'Photo Privacy', desc: 'Your photo is only visible to people you choose. Full control over who sees what.' },
              { icon: '📞', title: 'Voice Calling', desc: 'Talk safely before you meet. In-app calling means no phone numbers shared until you are ready.' },
              { icon: '🎮', title: 'A Day Together', desc: 'A fun compatibility game you play together. 12 moments, sealed reveal, AI compatibility summary.' },
              { icon: '📄', title: 'PDF Biodata', desc: 'One click generates a beautifully designed biodata. Share with family instantly.' },
              { icon: '✅', title: 'Profile Verification', desc: 'Selfie liveness check and NID document verification. Every verified profile is marked clearly.' },
              { icon: '🌍', title: 'NRB Ready', desc: 'Dedicated support for Bangladeshis in UK, USA, Canada, Australia, UAE and beyond.' },
              { icon: '💕', title: 'Partner Expectations', desc: 'Every profile shows exactly what they are looking for — age, height, income, district, education. No surprises.' },
            ].map(({ icon, title, desc }) => (
              <div key={title} style={{ padding: '32px 28px', background: 'rgba(240,192,64,0.02)', borderBottom: '1px solid rgba(240,192,64,0.06)', borderRight: '1px solid rgba(240,192,64,0.06)' }}>
                <div style={{ fontSize: '28px', marginBottom: '14px' }}>{icon}</div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#FDF6EE', margin: '0 0 8px' }}>{title}</h3>
                <p style={{ fontSize: '13px', color: 'rgba(253,246,238,0.45)', lineHeight: 1.8, margin: 0 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: 'clamp(60px,8vw,100px) clamp(24px,6vw,80px)', borderTop: '1px solid rgba(240,192,64,0.06)', textAlign: 'center' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <p style={{ fontSize: '11px', color: 'rgba(240,192,64,0.4)', letterSpacing: '3px', marginBottom: '16px' }}>BUILT ON TRUST</p>
          <h2 style={{ fontSize: 'clamp(24px, 3vw, 40px)', fontWeight: 700, color: '#FDF6EE', margin: '0 0 16px', lineHeight: 1.2 }}>
            Your family&apos;s trust is everything.<br/><span style={{ color: '#F0C040' }}>We take it seriously.</span>
          </h2>
          <p style={{ fontSize: 'clamp(14px, 1.4vw, 17px)', color: 'rgba(253,246,238,0.5)', lineHeight: 1.9, margin: '0 0 56px' }}>
            No fake profiles. No spam. Every registration requires a verified phone number. Premium members go through photo and NID verification. Your privacy is never compromised.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '24px' }}>
            {[
              ['📱', 'Phone verified', 'Every account'],
              ['🪪', 'NID verified', 'Premium members'],
              ['🤳', 'Selfie liveness', 'AI powered check'],
              ['🔐', 'Photo privacy', 'Your control'],
              ['🚫', 'Block & report', 'Always available'],
            ].map(([icon, title, sub]) => (
              <div key={title} style={{ padding: '24px 16px', background: 'rgba(240,192,64,0.04)', border: '1px solid rgba(240,192,64,0.1)', borderRadius: '12px' }}>
                <div style={{ fontSize: '28px', marginBottom: '10px' }}>{icon}</div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#FDF6EE', marginBottom: '4px' }}>{title}</div>
                <div style={{ fontSize: '11px', color: 'rgba(253,246,238,0.35)', letterSpacing: '0.5px' }}>{sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: 'clamp(60px,8vw,100px) clamp(24px,6vw,80px)', borderTop: '1px solid rgba(240,192,64,0.06)', textAlign: 'center' }}>
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          <p style={{ fontSize: '11px', color: 'rgba(240,192,64,0.4)', letterSpacing: '3px', marginBottom: '16px' }}>SUCCESS STORIES</p>
          <h2 style={{ fontSize: 'clamp(24px, 3vw, 40px)', fontWeight: 700, color: '#FDF6EE', margin: '0 0 16px', lineHeight: 1.2 }}>
            <span style={{ fontFamily: 'var(--font-hind-siliguri)', color: '#F0C040' }}>তাদের বিয়ে হয়েছে এই অ্যাপ থেকে</span>
          </h2>
          <p style={{ fontSize: 'clamp(14px, 1.4vw, 17px)', color: 'rgba(253,246,238,0.4)', lineHeight: 1.9, margin: '0 0 40px' }}>
            Real couples. Real families. Their story started here.<br/>
            <span style={{ fontSize: '13px', color: 'rgba(253,246,238,0.25)' }}>Success stories coming soon as our first matches are confirmed.</span>
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            {['💍 Dhaka couple, 2026', '✈️ UK–Sylhet match', '🕌 Religious family match'].map(s => (
              <span key={s} style={{ fontSize: '13px', color: 'rgba(253,246,238,0.3)', border: '1px solid rgba(240,192,64,0.1)', borderRadius: '20px', padding: '6px 16px' }}>{s}</span>
            ))}
          </div>
        </div>
      </section>

      <section style={{ minHeight: '50vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderTop: '1px solid rgba(240,192,64,0.06)', textAlign: 'center', padding: 'clamp(60px,8vw,100px) 24px', position: 'relative' }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '600px', height: '600px', borderRadius: '50%', background: 'radial-gradient(circle,rgba(192,120,0,0.08) 0%,transparent 70%)', pointerEvents: 'none' }}/>
        <p style={{ fontSize: 'clamp(16px, 2vw, 22px)', color: '#F0C040', fontStyle: 'italic', margin: '0 0 16px', position: 'relative', zIndex: 2 }}>
          <span style={{ fontFamily: 'var(--font-hind-siliguri)' }}>দেরি কেন? শুরু করুন আজই</span>
        </p>
        <h2 style={{ fontSize: 'clamp(28px, 4vw, 56px)', fontWeight: 700, color: '#FDF6EE', margin: '0 0 16px', lineHeight: 1.1, position: 'relative', zIndex: 2 }}>
          Your person is out there.<br/><span style={{ color: '#F0C040' }}>Start looking today.</span>
        </h2>
        <p style={{ fontSize: 'clamp(14px, 1.4vw, 17px)', color: 'rgba(253,246,238,0.4)', margin: '0 0 48px', position: 'relative', zIndex: 2 }}>
          Free to join. No credit card. Browse 3,010 profiles right now.
        </p>
        <div style={{ position: 'relative', zIndex: 2 }}>
          <HomeCTA2 />
        </div>
        <p style={{ fontSize: '11px', color: 'rgba(253,246,238,0.15)', letterSpacing: '2.5px', margin: '32px 0 0', position: 'relative', zIndex: 2 }}>
          3,010 PROFILES · 64 DISTRICTS · AI MATCHMAKING · FREE TO JOIN
        </p>
      </section>

      <footer style={{ padding: '64px 80px 40px', borderTop: '1px solid rgba(240,192,64,0.15)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '40px', marginBottom: '56px' }}>
          <div>
            <span style={{ fontSize: '26px', fontWeight: 800, color: '#F0C040', letterSpacing: '4px', display: 'block', marginBottom: '8px' }}>BIYEKORI</span>
            <p style={{ margin: '0 0 6px', fontSize: '13px', color: 'rgba(253,246,238,0.35)', fontStyle: 'italic' }}>
              <span style={{ fontFamily: 'var(--font-hind-siliguri)' }}>আপনার জন্য কেউ অপেক্ষা করছে</span>
            </p>
            <p style={{ margin: 0, fontSize: '14px', color: 'rgba(253,246,238,0.5)', lineHeight: 1.7, maxWidth: '260px' }}>Bangladesh&apos;s most thoughtful matrimony platform.</p>
          </div>
          <div style={{ display: 'flex', gap: '64px', flexWrap: 'wrap' }}>
            <div>
              <p style={{ margin: '0 0 18px', fontSize: '13px', fontWeight: 700, color: '#F0C040', letterSpacing: '2px' }}>PLATFORM</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {['Profiles','Pricing','About','FAQ'].map(l => (
                  <Link key={l} href={`/${l.toLowerCase()}`} style={{ fontSize: '15px', color: 'rgba(253,246,238,0.65)', textDecoration: 'none', fontWeight: 500 }}>{l}</Link>
                ))}
              </div>
            </div>
            <div>
              <p style={{ margin: '0 0 18px', fontSize: '13px', fontWeight: 700, color: '#F0C040', letterSpacing: '2px' }}>LEGAL</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {['Safety','Privacy','Terms'].map(l => (
                  <Link key={l} href={`/${l.toLowerCase()}`} style={{ fontSize: '15px', color: 'rgba(253,246,238,0.65)', textDecoration: 'none', fontWeight: 500 }}>{l}</Link>
                ))}
              </div>
            </div>
            <div>
              <p style={{ margin: '0 0 18px', fontSize: '13px', fontWeight: 700, color: '#F0C040', letterSpacing: '2px' }}>CONTACT</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <a href="mailto:support@biyekori.com" style={{ fontSize: '15px', color: 'rgba(253,246,238,0.65)', textDecoration: 'none', fontWeight: 500 }}>support@biyekori.com</a>
                <a href="https://wa.me/8801733577215" target="_blank" rel="noreferrer" style={{ fontSize: '15px', color: 'rgba(253,246,238,0.65)', textDecoration: 'none', fontWeight: 500 }}>WhatsApp</a>
              </div>
            </div>
          </div>
        </div>
        <div style={{ borderTop: '1px solid rgba(240,192,64,0.1)', paddingTop: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
          <span style={{ fontSize: '14px', color: 'rgba(253,246,238,0.45)', fontWeight: 500 }}>&copy; 2026 Biyekori. All rights reserved.</span>
          <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
            <a href="https://facebook.com/biyekori" target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '46px', height: '46px', borderRadius: '50%', background: 'rgba(240,192,64,0.12)', border: '1px solid rgba(240,192,64,0.2)' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="#F0C040"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
            </a>
            <a href="https://instagram.com/biyekori" target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '46px', height: '46px', borderRadius: '50%', background: 'rgba(240,192,64,0.12)', border: '1px solid rgba(240,192,64,0.2)' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#F0C040" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
            </a>
            <a href="https://youtube.com/@biyekori" target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '46px', height: '46px', borderRadius: '50%', background: 'rgba(240,192,64,0.12)', border: '1px solid rgba(240,192,64,0.2)' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="#F0C040"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="#080604"/></svg>
            </a>
            <a href="https://linkedin.com/company/biyekori" target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '46px', height: '46px', borderRadius: '50%', background: 'rgba(240,192,64,0.12)', border: '1px solid rgba(240,192,64,0.2)' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="#F0C040"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
            </a>
          </div>
        </div>
      </footer>
    </main>
  )
}
