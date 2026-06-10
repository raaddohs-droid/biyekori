import Link from "next/link"
import HomeCTA from "@/components/HomeCTA"
import HomeCTA2 from "@/components/HomeCTA2"

export default function Home() {
  return (
    <main style={{ fontFamily: "'Georgia', serif", background: '#080604', color: '#FDF6EE', overflowX: 'hidden' }}>

      <section style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundImage: "url('/hero-bg.jpg')", backgroundSize: 'cover', backgroundPosition: 'center 30%', backgroundRepeat: 'no-repeat', padding: '120px 24px 80px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(8,6,4,0.58)', pointerEvents: 'none' }}/>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '800px', height: '800px', borderRadius: '50%', background: 'radial-gradient(circle,rgba(192,120,0,0.09) 0%,transparent 65%)', pointerEvents: 'none' }}/>
        <p style={{ fontSize: 'clamp(16px, 2vw, 24px)', fontWeight: 400, color: '#F0C040', margin: '0 0 16px', letterSpacing: '3px', position: 'relative', zIndex: 2, opacity: 0.9 }}>
          <span style={{fontFamily: "var(--font-hind-siliguri)"}}>আপনার জন্য কেউ অপেক্ষা করছে</span>
        </p>
        <h1 style={{ fontSize: 'clamp(38px, 6.5vw, 88px)', fontWeight: 700, color: '#FFFFFF', margin: '0 0 24px', lineHeight: 1.0, letterSpacing: '-2px', position: 'relative', zIndex: 2, textShadow: '0 2px 30px rgba(0,0,0,0.8)' }}>
          Someone is waiting<br/>for you.
        </h1>
        <p style={{ fontSize: 'clamp(16px, 1.6vw, 20px)', color: 'rgba(253,246,238,0.85)', margin: '0 0 48px', lineHeight: 1.8, maxWidth: '540px', position: 'relative', zIndex: 2, fontFamily: 'system-ui, sans-serif' }}>
          Bangladesh&apos;s most thoughtful matrimony platform. Real profiles, real families — and AI that tells you <em>exactly</em> why two people belong together.
        </p>
        <div style={{ position: 'relative', zIndex: 2, marginBottom: '40px' }}>
          <HomeCTA />
        </div>
        <div style={{ position: 'relative', zIndex: 2, display: 'flex', gap: '48px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '36px' }}>
          {[["1,811", "Women registered"], ["1,199", "Men registered"], ["Free", "To join and browse"]].map(([n, l]) => (
            <div key={n} style={{ textAlign: "center" }}>
              <div style={{ fontSize: "clamp(22px, 2.5vw, 32px)", fontWeight: 800, color: "#F0C040", letterSpacing: "-1px" }}>{n}</div>
              <div style={{ fontSize: "11px", color: "rgba(253,246,238,0.68)", letterSpacing: "1.5px", marginTop: "4px", fontFamily: "system-ui, sans-serif" }}>{l}</div>
            </div>
          ))}
        </div>
        <div style={{ position: 'relative', zIndex: 2, display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
          {["Searching for yourself", "Searching for your child", "Searching for a sibling", "Living abroad"].map(label => (
            <span key={label} style={{ fontSize: "12px", color: "rgba(253,246,238,0.72)", border: "1px solid rgba(240,192,64,0.2)", borderRadius: "20px", padding: "5px 14px", fontFamily: "system-ui, sans-serif" }}>{label}</span>
          ))}
        </div>
        <div style={{ position: 'absolute', bottom: '40px', left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', opacity: 0.25, zIndex: 2 }}>
          <div style={{ width: '1px', height: '48px', background: 'linear-gradient(to bottom, transparent, #F0C040)' }}/>
          <span style={{ fontSize: '10px', letterSpacing: '3px', color: '#F0C040', fontFamily: 'system-ui, sans-serif' }}>SCROLL</span>
        </div>
      </section>

      <section style={{ padding: 'clamp(60px,8vw,100px) clamp(24px,6vw,80px)', borderTop: '1px solid rgba(240,192,64,0.08)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '64px', alignItems: 'center' }}>
          <div>
            <p style={{ fontSize: '11px', color: 'rgba(240,192,64,0.8)', letterSpacing: '3px', marginBottom: '16px', fontFamily: 'system-ui, sans-serif' }}>THE FEATURE NOBODY ELSE HAS</p>
            <h2 style={{ fontSize: 'clamp(28px, 3.5vw, 48px)', fontWeight: 700, color: '#FDF6EE', margin: '0 0 20px', lineHeight: 1.1 }}>
              See <span style={{ color: '#F0C040' }}>exactly</span> why<br/>you match.
            </h2>
            <p style={{ fontSize: 'clamp(15px, 1.4vw, 17px)', color: 'rgba(253,246,238,0.80)', lineHeight: 1.9, margin: '0 0 28px', fontFamily: 'system-ui, sans-serif' }}>
              Every profile shows a personal compatibility score — not a mystery number, but a field-by-field breakdown. Religion, age, height, income, location, family values. You see where you match and where you do not, before you even say hello.
            </p>
            <p style={{ fontSize: '14px', color: 'rgba(253,246,238,0.58)', fontStyle: 'italic', fontFamily: 'system-ui, sans-serif' }}>No other matrimony platform in Bangladesh does this.</p>
          </div>
          <div style={{ background: 'linear-gradient(135deg, rgba(240,192,64,0.06), rgba(240,192,64,0.02))', border: '1px solid rgba(240,192,64,0.18)', borderRadius: '20px', padding: '28px', fontFamily: 'system-ui, sans-serif' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid rgba(240,192,64,0.1)' }}>
              <div>
                <div style={{ fontSize: '12px', color: 'rgba(253,246,238,0.62)', letterSpacing: '1px', marginBottom: '4px' }}>WHY YOU MATCH</div>
                <div style={{ fontSize: '13px', color: 'rgba(253,246,238,0.78)' }}>Sumaiya, 26 · Dhaka</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '36px', fontWeight: 900, color: '#10b981', lineHeight: 1 }}>86%</div>
                <div style={{ fontSize: '10px', color: '#10b981', opacity: 0.7, marginTop: '2px' }}>Great match</div>
              </div>
            </div>
            {[
              { icon: "🕌", label: "Religion", you: "Islam", them: "Islam", match: true, pts: "15/15" },
              { icon: "🎂", label: "Age", you: "25-32 yrs", them: "28 yrs", match: true, pts: "12/12" },
              { icon: "🎓", label: "Education", you: "Master's+", them: "Master's", match: true, pts: "8/8" },
              { icon: "💰", label: "Income", you: "50,000+", them: "45,000", match: false, pts: "3/7" },
              { icon: "📍", label: "Location", you: "Dhaka", them: "Dhaka", match: true, pts: "7/7" },
            ].map(({ icon, label, you, them, match, pts }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '9px 11px', borderRadius: '10px', marginBottom: '6px', background: match ? 'rgba(16,185,129,0.07)' : 'rgba(249,115,22,0.07)', border: "1px solid " + (match ? 'rgba(16,185,129,0.18)' : 'rgba(249,115,22,0.18)') }}>
                <span style={{ fontSize: '15px', width: '20px' }}>{icon}</span>
                <span style={{ fontSize: '12px', color: 'rgba(253,246,238,0.88)', width: '64px', fontWeight: 600 }}>{label}</span>
                <span style={{ fontSize: '10px', color: 'rgba(253,246,238,0.55)', flex: 1 }}>You: {you} · Profile: {them}</span>
                <span style={{ fontSize: '13px' }}>{match ? "✅" : "❌"}</span>
                <span style={{ fontSize: '10px', color: 'rgba(253,246,238,0.50)', width: '32px', textAlign: 'right' }}>{pts}</span>
              </div>
            ))}
            <div style={{ marginTop: '14px', textAlign: 'center' }}>
              <span style={{ fontSize: '11px', color: 'rgba(253,246,238,0.50)' }}>Based on 13 compatibility factors</span>
            </div>
          </div>
        </div>
      </section>

      <section style={{ padding: 'clamp(60px,8vw,100px) clamp(24px,6vw,80px)', borderTop: '1px solid rgba(240,192,64,0.08)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <p style={{ fontSize: '11px', color: 'rgba(240,192,64,0.8)', letterSpacing: '3px', marginBottom: '16px', textAlign: 'center', fontFamily: 'system-ui, sans-serif' }}>BIYEKORI IS FOR</p>
          <h2 style={{ fontSize: 'clamp(26px, 3.5vw, 46px)', fontWeight: 700, color: '#FDF6EE', textAlign: 'center', margin: '0 0 56px', lineHeight: 1.2 }}>
            Whether you&apos;re searching for yourself<br/>
            <span style={{ color: '#F0C040' }}>or for someone you love</span>
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
            {[
              { icon: "👤", title: "For Yourself", desc: "Browse privately. No pressure. Message when you are ready. Your profile, your pace." },
              { icon: "👨‍👩‍👧", title: "For Your Child", desc: "Guardian Mode lets parents manage their child’s profile with full control. The family stays involved." },
              { icon: "👫", title: "For a Sibling", desc: "Create a profile for your brother or sister. Filter by their preferences, shortlist the best." },
              { icon: "✈️", title: "Living Abroad", desc: "Bangladeshis in UK, USA, Canada and beyond. Find someone from home, wherever you are." },
            ].map(({ icon, title, desc }) => (
              <div key={title} style={{ background: 'rgba(240,192,64,0.04)', border: '1px solid rgba(240,192,64,0.1)', borderRadius: '16px', padding: '28px 24px' }}>
                <div style={{ fontSize: '30px', marginBottom: '14px' }}>{icon}</div>
                <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#FDF6EE', margin: '0 0 10px' }}>{title}</h3>
                <p style={{ fontSize: '14px', color: 'rgba(253,246,238,0.78)', lineHeight: 1.75, margin: 0, fontFamily: 'system-ui, sans-serif' }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: 'clamp(60px,8vw,100px) clamp(24px,6vw,80px)', borderTop: '1px solid rgba(240,192,64,0.08)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <p style={{ fontSize: '11px', color: 'rgba(240,192,64,0.8)', letterSpacing: '3px', marginBottom: '16px', textAlign: 'center', fontFamily: 'system-ui, sans-serif' }}>WHAT MAKES BIYEKORI DIFFERENT</p>
          <h2 style={{ fontSize: 'clamp(26px, 3vw, 42px)', fontWeight: 700, color: '#FDF6EE', textAlign: 'center', margin: '0 0 56px', lineHeight: 1.2 }}>
            Built for Bangladesh.<br/><span style={{ color: '#F0C040' }}>Every detail.</span>
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
            {[
              { icon: "🛡️", title: "Guardian Mode", desc: "Parents or siblings manage the profile. Badges show who controls each account. The family is always in the loop." },
              { icon: "📞", title: "Safe Voice Calling", desc: "Talk before you meet. In-app calling means no phone numbers shared until both sides are comfortable." },
              { icon: "🔒", title: "Photo Privacy", desc: "Your photo is only shown to people you approve. No strangers browsing your face without permission." },
              { icon: "🌍", title: "NRB Ready", desc: "Dedicated profiles for Bangladeshis abroad. UK, USA, Canada, Australia, UAE — wherever you are." },
              { icon: "🎮", title: "A Day Together", desc: "A fun compatibility game you play together. 12 scenarios, sealed reveal, AI compatibility summary." },
              { icon: "📄", title: "PDF Biodata", desc: "One click. A beautifully formatted biodata ready to share with parents or relatives." },
            ].map(({ icon, title, desc }) => (
              <div key={title} style={{ padding: '28px 24px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(240,192,64,0.08)', borderRadius: '16px' }}>
                <div style={{ fontSize: '28px', marginBottom: '14px' }}>{icon}</div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#FDF6EE', margin: '0 0 10px' }}>{title}</h3>
                <p style={{ fontSize: '13px', color: 'rgba(253,246,238,0.75)', lineHeight: 1.85, margin: 0, fontFamily: 'system-ui, sans-serif' }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: 'clamp(60px,8vw,100px) clamp(24px,6vw,80px)', borderTop: '1px solid rgba(240,192,64,0.08)', textAlign: 'center' }}>
        <div style={{ maxWidth: '780px', margin: '0 auto' }}>
          <p style={{ fontSize: '11px', color: 'rgba(240,192,64,0.8)', letterSpacing: '3px', marginBottom: '16px', fontFamily: 'system-ui, sans-serif' }}>SAFETY AND TRUST</p>
          <h2 style={{ fontSize: 'clamp(26px, 3vw, 42px)', fontWeight: 700, color: '#FDF6EE', margin: '0 0 16px', lineHeight: 1.2 }}>
            Your family&apos;s trust<br/><span style={{ color: '#F0C040' }}>is not negotiable.</span>
          </h2>
          <p style={{ fontSize: 'clamp(15px, 1.4vw, 17px)', color: 'rgba(253,246,238,0.78)', lineHeight: 1.9, margin: '0 0 52px', fontFamily: 'system-ui, sans-serif' }}>
            Every account requires phone verification. Premium members go through photo and NID document checks. Fake profiles are removed immediately. You can block or report anyone, anytime.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '16px' }}>
            {[
              ["📱", "Phone verified", "Every account"],
              ["🪪", "NID verified", "Premium members"],
              ["🤳", "Selfie check", "AI liveness detection"],
              ["🔐", "Photo privacy", "Your full control"],
              ["🚫", "Block and report", "Always available"],
            ].map(([icon, title, sub]) => (
              <div key={title as string} style={{ padding: '22px 14px', background: 'rgba(240,192,64,0.04)', border: '1px solid rgba(240,192,64,0.1)', borderRadius: '12px' }}>
                <div style={{ fontSize: '26px', marginBottom: '10px' }}>{icon}</div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#FDF6EE', marginBottom: '4px' }}>{title as string}</div>
                <div style={{ fontSize: '11px', color: 'rgba(253,246,238,0.58)', fontFamily: 'system-ui, sans-serif' }}>{sub as string}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: 'clamp(60px,8vw,100px) clamp(24px,6vw,80px)', borderTop: '1px solid rgba(240,192,64,0.08)' }}>
        <div style={{ maxWidth: '680px', margin: '0 auto', textAlign: 'center' }}>
          <p style={{ fontSize: 'clamp(18px, 2vw, 26px)', color: 'rgba(253,246,238,0.85)', lineHeight: 2.0, fontStyle: 'italic', margin: '0 0 28px' }}>
            &ldquo;We built Biyekori because finding the right match should feel as careful and respectful as the families doing the searching.&rdquo;
          </p>
          <p style={{ fontSize: '12px', color: 'rgba(253,246,238,0.50)', letterSpacing: '2px', fontFamily: 'system-ui, sans-serif' }}>THE BIYEKORI TEAM · DHAKA, BANGLADESH</p>
        </div>
      </section>

      <section style={{ minHeight: '55vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderTop: '1px solid rgba(240,192,64,0.08)', textAlign: 'center', padding: 'clamp(60px,8vw,100px) 24px', position: 'relative' }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '700px', height: '700px', borderRadius: '50%', background: 'radial-gradient(circle,rgba(192,120,0,0.09) 0%,transparent 70%)', pointerEvents: 'none' }}/>
        <p style={{ fontSize: 'clamp(16px, 2vw, 22px)', color: '#F0C040', margin: '0 0 16px', position: 'relative', zIndex: 2, letterSpacing: '2px' }}>
          <span style={{ fontFamily: 'var(--font-hind-siliguri)' }}>দেরি কেন? শুরু করুন আজই</span>
        </p>
        <h2 style={{ fontSize: 'clamp(30px, 4.5vw, 60px)', fontWeight: 700, color: '#FDF6EE', margin: '0 0 20px', lineHeight: 1.05, position: 'relative', zIndex: 2, letterSpacing: '-1.5px' }}>
          Your person is out there.<br/><span style={{ color: '#F0C040' }}>Go find them.</span>
        </h2>
        <p style={{ fontSize: 'clamp(15px, 1.4vw, 18px)', color: 'rgba(253,246,238,0.72)', margin: '0 0 48px', position: 'relative', zIndex: 2, fontFamily: 'system-ui, sans-serif' }}>
          Free to join. No credit card. 3,010 real profiles waiting.
        </p>
        <div style={{ position: 'relative', zIndex: 2 }}>
          <HomeCTA2 />
        </div>
        <p style={{ fontSize: '11px', color: 'rgba(253,246,238,0.40)', letterSpacing: '2px', margin: '40px 0 0', position: 'relative', zIndex: 2, fontFamily: 'system-ui, sans-serif' }}>
          1,811 WOMEN · 1,199 MEN · ALL 8 DIVISIONS · AI MATCHMAKING · FREE
        </p>
      </section>

      <footer style={{ padding: 'clamp(40px,6vw,64px) clamp(24px,6vw,80px) 40px', borderTop: '1px solid rgba(240,192,64,0.15)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '40px', marginBottom: '48px' }}>
          <div style={{ maxWidth: '260px' }}>
            <span style={{ fontSize: '24px', fontWeight: 800, color: '#F0C040', letterSpacing: '4px', display: 'block', marginBottom: '8px' }}>BIYEKORI</span>
            <p style={{ margin: '0 0 8px', fontSize: '13px', color: 'rgba(253,246,238,0.50)', fontStyle: 'italic' }}>
              <span style={{ fontFamily: 'var(--font-hind-siliguri)' }}>আপনার জন্য কেউ অপেক্ষা করছে</span>
            </p>
            <p style={{ margin: 0, fontSize: '14px', color: 'rgba(253,246,238,0.72)', lineHeight: 1.7, fontFamily: 'system-ui, sans-serif' }}>Bangladesh&apos;s most thoughtful matrimony platform. Built in Dhaka.</p>
          </div>
          <div style={{ display: 'flex', gap: '48px', flexWrap: 'wrap' }}>
            <div>
              <p style={{ margin: '0 0 16px', fontSize: '11px', fontWeight: 700, color: '#F0C040', letterSpacing: '2px', fontFamily: 'system-ui, sans-serif' }}>PLATFORM</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {["Profiles","Pricing","About","FAQ"].map(l => (
                  <Link key={l} href={"/" + l.toLowerCase()} style={{ fontSize: '14px', color: 'rgba(253,246,238,0.78)', textDecoration: 'none', fontFamily: 'system-ui, sans-serif' }}>{l}</Link>
                ))}
              </div>
            </div>
            <div>
              <p style={{ margin: '0 0 16px', fontSize: '11px', fontWeight: 700, color: '#F0C040', letterSpacing: '2px', fontFamily: 'system-ui, sans-serif' }}>LEGAL</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {["Safety","Privacy","Terms"].map(l => (
                  <Link key={l} href={"/" + l.toLowerCase()} style={{ fontSize: '14px', color: 'rgba(253,246,238,0.78)', textDecoration: 'none', fontFamily: 'system-ui, sans-serif' }}>{l}</Link>
                ))}
              </div>
            </div>
            <div>
              <p style={{ margin: '0 0 16px', fontSize: '11px', fontWeight: 700, color: '#F0C040', letterSpacing: '2px', fontFamily: 'system-ui, sans-serif' }}>CONTACT</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <a href="mailto:support@biyekori.com" style={{ fontSize: '14px', color: 'rgba(253,246,238,0.78)', textDecoration: 'none', fontFamily: 'system-ui, sans-serif' }}>support@biyekori.com</a>
                <a href="https://wa.me/8801733577215" target="_blank" rel="noreferrer" style={{ fontSize: '14px', color: 'rgba(253,246,238,0.78)', textDecoration: 'none', fontFamily: 'system-ui, sans-serif' }}>WhatsApp</a>
              </div>
            </div>
          </div>
        </div>
        <div style={{ borderTop: '1px solid rgba(240,192,64,0.1)', paddingTop: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <span style={{ fontSize: '13px', color: 'rgba(253,246,238,0.55)', fontFamily: 'system-ui, sans-serif' }}>&copy; 2026 Biyekori. All rights reserved.</span>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <a href="https://facebook.com/biyekori" target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(240,192,64,0.1)', border: '1px solid rgba(240,192,64,0.18)' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#F0C040"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
            </a>
            <a href="https://instagram.com/biyekori" target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(240,192,64,0.1)', border: '1px solid rgba(240,192,64,0.18)' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F0C040" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
            </a>
            <a href="https://youtube.com/@biyekori" target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(240,192,64,0.1)', border: '1px solid rgba(240,192,64,0.18)' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#F0C040"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="#080604"/></svg>
            </a>
            <a href="https://linkedin.com/company/biyekori" target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(240,192,64,0.1)', border: '1px solid rgba(240,192,64,0.18)' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#F0C040"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
            </a>
          </div>
        </div>
      </footer>
    </main>
  )
}
