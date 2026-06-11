import Link from "next/link"
import HomeCTA from "@/components/HomeCTA"
import HomeCTA2 from "@/components/HomeCTA2"
import LandingClient from "@/components/LandingClient"
import DemoExperience from "@/components/DemoExperience"

export default function Home() {
  return (
    <main style={{ fontFamily: "'Georgia', serif", background: '#080604', color: '#FDF6EE', overflowX: 'hidden' }}>

      <section style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundImage: "url('/hero-bg.jpg')", backgroundSize: 'cover', backgroundPosition: 'center 30%', backgroundRepeat: 'no-repeat', padding: '120px 24px 80px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(8,6,4,0.58)', pointerEvents: 'none' }}/>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '800px', height: '800px', borderRadius: '50%', background: 'radial-gradient(circle,rgba(192,120,0,0.09) 0%,transparent 65%)', pointerEvents: 'none' }}/>
        <p style={{ fontSize: 'clamp(18px, 2.2vw, 26px)', color: '#F0C040', margin: '0 0 16px', letterSpacing: '3px', position: 'relative', zIndex: 2 }}>
          <span style={{fontFamily: "var(--font-hind-siliguri)"}}>আপনার জন্য কেউ অপেক্ষা করছে</span>
        </p>
        <h1 style={{ fontSize: 'clamp(40px, 6.5vw, 90px)', fontWeight: 700, color: '#FFFFFF', margin: '0 0 24px', lineHeight: 1.0, letterSpacing: '-2px', position: 'relative', zIndex: 2, textShadow: '0 2px 30px rgba(0,0,0,0.8)' }}>
          Someone is waiting<br/>for you.
        </h1>
        <p style={{ fontSize: 'clamp(17px, 1.7vw, 21px)', color: 'rgba(253,246,238,0.82)', margin: '0 0 48px', lineHeight: 1.8, maxWidth: '540px', position: 'relative', zIndex: 2, fontFamily: 'system-ui, sans-serif' }}>
          Bangladesh&apos;s most thoughtful matrimony platform. Real profiles, real families — and AI that tells you <em>exactly</em> why two people belong together.
        </p>
        <div style={{ position: 'relative', zIndex: 2, marginBottom: '48px' }}>
          <HomeCTA />
        </div>
        <div style={{ position: 'relative', zIndex: 2, display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
          {["Searching for yourself", "Searching for your child", "Searching for a sibling", "Living abroad"].map(label => (
            <span key={label} style={{ fontSize: '13px', color: 'rgba(253,246,238,0.65)', border: '1px solid rgba(240,192,64,0.25)', borderRadius: '20px', padding: '6px 16px', fontFamily: 'system-ui, sans-serif' }}>{label}</span>
          ))}
        </div>
        <div style={{ position: 'absolute', bottom: '40px', left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', opacity: 0.3, zIndex: 2 }}>
          <div style={{ width: '1px', height: '48px', background: 'linear-gradient(to bottom, transparent, #F0C040)' }}/>
          <span style={{ fontSize: '11px', letterSpacing: '3px', color: '#F0C040', fontFamily: 'system-ui, sans-serif' }}>SCROLL</span>
        </div>
      </section>

      <section style={{ padding: 'clamp(60px,8vw,80px) clamp(24px,6vw,80px)', borderTop: '1px solid rgba(240,192,64,0.08)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '64px', alignItems: 'center' }}>
          <div>
            <p style={{ fontSize: '13px', color: 'rgba(240,192,64,0.8)', letterSpacing: '3px', marginBottom: '16px', fontFamily: 'system-ui, sans-serif', textTransform: 'uppercase' }}>Try before you join</p>
            <h2 style={{ fontSize: 'clamp(28px, 3.5vw, 48px)', fontWeight: 700, color: '#FDF6EE', margin: '0 0 20px', lineHeight: 1.1 }}>
              Call. Message. Play.<br/><span style={{ color: '#F0C040' }}>Feel it first.</span>
            </h2>
            <p style={{ fontSize: 'clamp(16px, 1.4vw, 18px)', color: 'rgba(253,246,238,0.78)', lineHeight: 1.9, margin: 0, fontFamily: 'system-ui, sans-serif' }}>
              No login needed. Hear Sumaiya speak, chat with her AI persona, and play the first question of our compatibility game — right now, before you register.
            </p>
          </div>
          <DemoExperience />
        </div>
      </section>

      <LandingClient />

      <section style={{ minHeight: '55vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderTop: '1px solid rgba(240,192,64,0.08)', textAlign: 'center', padding: 'clamp(60px,8vw,100px) 24px', position: 'relative' }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '700px', height: '700px', borderRadius: '50%', background: 'radial-gradient(circle,rgba(192,120,0,0.09) 0%,transparent 70%)', pointerEvents: 'none' }}/>
        <p style={{ fontSize: 'clamp(18px, 2vw, 24px)', color: '#F0C040', margin: '0 0 16px', position: 'relative', zIndex: 2, letterSpacing: '2px' }}>
          <span style={{ fontFamily: 'var(--font-hind-siliguri)' }}>দেরি কেন? শুরু করুন আজই</span>
        </p>
        <h2 style={{ fontSize: 'clamp(32px, 4.5vw, 62px)', fontWeight: 700, color: '#FDF6EE', margin: '0 0 20px', lineHeight: 1.05, position: 'relative', zIndex: 2, letterSpacing: '-1.5px' }}>
          Your person is out there.<br/><span style={{ color: '#F0C040' }}>Go find them.</span>
        </h2>
        <p style={{ fontSize: 'clamp(16px, 1.4vw, 19px)', color: 'rgba(253,246,238,0.72)', margin: '0 0 48px', position: 'relative', zIndex: 2, fontFamily: 'system-ui, sans-serif' }}>
          Free to join. No credit card. 3,010 real profiles waiting.
        </p>
        <div style={{ position: 'relative', zIndex: 2 }}>
          <HomeCTA2 />
        </div>
        <p style={{ fontSize: '12px', color: 'rgba(253,246,238,0.38)', letterSpacing: '2px', margin: '40px 0 0', position: 'relative', zIndex: 2, fontFamily: 'system-ui, sans-serif' }}>
          1,811 WOMEN · 1,199 MEN · ALL 8 DIVISIONS · AI MATCHMAKING · FREE
        </p>
      </section>

      <footer style={{ padding: 'clamp(40px,6vw,64px) clamp(24px,6vw,80px) 40px', borderTop: '1px solid rgba(240,192,64,0.15)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '40px', marginBottom: '48px' }}>
          <div style={{ maxWidth: '280px' }}>
            <span style={{ fontSize: '24px', fontWeight: 800, color: '#F0C040', letterSpacing: '4px', display: 'block', marginBottom: '10px' }}>BIYEKORI</span>
            <p style={{ margin: '0 0 8px', fontSize: '14px', color: 'rgba(253,246,238,0.45)', fontStyle: 'italic' }}>
              <span style={{ fontFamily: 'var(--font-hind-siliguri)' }}>আপনার জন্য কেউ অপেক্ষা করছে</span>
            </p>
            <p style={{ margin: 0, fontSize: '15px', color: 'rgba(253,246,238,0.65)', lineHeight: 1.7, fontFamily: 'system-ui, sans-serif' }}>Bangladesh&apos;s most thoughtful matrimony platform. Built in Dhaka.</p>
          </div>
          <div style={{ display: 'flex', gap: '48px', flexWrap: 'wrap' }}>
            <div>
              <p style={{ margin: '0 0 16px', fontSize: '12px', fontWeight: 700, color: '#F0C040', letterSpacing: '2px', fontFamily: 'system-ui, sans-serif' }}>PLATFORM</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[["Profiles","/profiles"],["Pricing","/pricing"],["About","/about"],["FAQ","/faq"]].map(([l,h]) => (
                  <Link key={l} href={h} style={{ fontSize: '15px', color: 'rgba(253,246,238,0.68)', textDecoration: 'none', fontFamily: 'system-ui, sans-serif' }}>{l}</Link>
                ))}
              </div>
            </div>
            <div>
              <p style={{ margin: '0 0 16px', fontSize: '12px', fontWeight: 700, color: '#F0C040', letterSpacing: '2px', fontFamily: 'system-ui, sans-serif' }}>LEGAL</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[["Safety","/safety"],["Privacy","/privacy"],["Terms","/terms"]].map(([l,h]) => (
                  <Link key={l} href={h} style={{ fontSize: '15px', color: 'rgba(253,246,238,0.68)', textDecoration: 'none', fontFamily: 'system-ui, sans-serif' }}>{l}</Link>
                ))}
              </div>
            </div>
            <div>
              <p style={{ margin: '0 0 16px', fontSize: '12px', fontWeight: 700, color: '#F0C040', letterSpacing: '2px', fontFamily: 'system-ui, sans-serif' }}>CONTACT</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <a href="mailto:support@biyekori.com" style={{ fontSize: '15px', color: 'rgba(253,246,238,0.68)', textDecoration: 'none', fontFamily: 'system-ui, sans-serif' }}>support@biyekori.com</a>
                <a href="https://wa.me/8801733577215" target="_blank" rel="noreferrer" style={{ fontSize: '15px', color: 'rgba(253,246,238,0.68)', textDecoration: 'none', fontFamily: 'system-ui, sans-serif' }}>WhatsApp</a>
              </div>
            </div>
          </div>
        </div>
        <div style={{ borderTop: '1px solid rgba(240,192,64,0.1)', paddingTop: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <span style={{ fontSize: '14px', color: 'rgba(253,246,238,0.48)', fontFamily: 'system-ui, sans-serif' }}>&copy; 2026 Biyekori. All rights reserved.</span>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <a href="https://facebook.com/biyekori" target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '42px', height: '42px', borderRadius: '50%', background: 'rgba(240,192,64,0.1)', border: '1px solid rgba(240,192,64,0.2)' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#F0C040"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
            </a>
            <a href="https://instagram.com/biyekori" target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '42px', height: '42px', borderRadius: '50%', background: 'rgba(240,192,64,0.1)', border: '1px solid rgba(240,192,64,0.2)' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F0C040" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
            </a>
            <a href="https://youtube.com/@biyekori" target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '42px', height: '42px', borderRadius: '50%', background: 'rgba(240,192,64,0.1)', border: '1px solid rgba(240,192,64,0.2)' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#F0C040"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="#080604"/></svg>
            </a>
            <a href="https://linkedin.com/company/biyekori" target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '42px', height: '42px', borderRadius: '50%', background: 'rgba(240,192,64,0.1)', border: '1px solid rgba(240,192,64,0.2)' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#F0C040"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
            </a>
          </div>
        </div>
      </footer>
    </main>
  )
}
