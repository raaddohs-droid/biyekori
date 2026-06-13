import Link from "next/link"
import HomeCTA from "@/components/HomeCTA"
import HomeCTA2 from "@/components/HomeCTA2"
import LandingClient from "@/components/LandingClient"
import UrgencyBar from "@/components/UrgencyBar"
import DemoExperience from "@/components/DemoExperience"

export default function Home() {
  return (
    <main style={{ fontFamily: "'Georgia', serif", background: '#FFFBF5', color: '#1a0a0d', overflowX: 'hidden' }}>

      

      {/* HERO */}
      <style>{`
        @media (max-width: 767px) {
          .bk-hero { background-image: none !important; background: #1a0a0d !important; min-height: auto !important; padding: 120px 24px 120px !important; align-items: center !important; text-align: center !important; }
          .bk-hero h1 { font-size: clamp(36px,10vw,52px) !important; }
          .bk-hero p { max-width: 100% !important; }
          .bk-stats-bar { position: static !important; flex-wrap: wrap !important; padding: 16px !important; }
          .bk-stats-bar > div { width: 50% !important; padding: 12px 8px !important; border-right: none !important; border-bottom: 1px solid rgba(240,192,64,0.1) !important; }
          .bk-footer-links { flex-direction: column !important; gap: 32px !important; }
          .bk-footer-cols { gap: 24px !important; }
        }
        @media (max-width: 767px) {
          .bk-hero { background-image: none !important; background: #1a0a0d !important; min-height: auto !important; padding: 120px 24px 100px !important; align-items: center !important; text-align: center !important; }
          .bk-hero h1 { font-size: clamp(36px,10vw,52px) !important; }
          .bk-hero-tags { justify-content: center !important; }
          .bk-stats-bar { flex-wrap: wrap !important; padding: 16px !important; gap: 0 !important; }
          .bk-stats-bar > div { width: 50% !important; padding: 10px 8px !important; border-right: none !important; border-bottom: 1px solid rgba(240,192,64,0.15) !important; }
        }
      `}</style>
      <section className="bk-hero" style={{ position: 'relative', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center', backgroundImage: "url('/hero-wedding.jpg')", backgroundSize: 'cover', backgroundPosition: 'center top', backgroundRepeat: 'no-repeat', padding: 'clamp(100px,12vw,120px) clamp(16px,5vw,24px) 80px clamp(16px,5vw,40%)', textAlign: 'left', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(0,0,0,0) 0%, rgba(0,0,0,0.15) 100%)', pointerEvents: 'none' }}/>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 'min(800px, 100%)', height: 'min(800px, 100%)', borderRadius: '50%', background: 'radial-gradient(circle,rgba(240,192,64,0.08) 0%,transparent 65%)', pointerEvents: 'none' }}/>

        <p style={{ fontSize: 'clamp(16px, 2vw, 22px)', color: '#F0C040', margin: '0 0 14px', letterSpacing: '3px', position: 'relative', zIndex: 2, fontStyle: 'italic' }}>
        </p>
        <h1 style={{ fontSize: 'clamp(40px, 6.5vw, 90px)', fontWeight: 700, color: '#FFFFFF', margin: '0 0 12px', lineHeight: 1.0, letterSpacing: '-2px', position: 'relative', zIndex: 2, textShadow: '0 2px 30px rgba(0,0,0,0.4)' }}>
          Someone is waiting<br/>for you.
        </h1>
        <p style={{ fontSize: 'clamp(22px, 3vw, 36px)', fontWeight: 600, color: 'rgba(255,255,255,0.7)', margin: '0 0 20px', lineHeight: 1.3, position: 'relative', zIndex: 2, fontFamily: "'Hind Siliguri', sans-serif" }}>
          যেখানে দুটি পরিবার একটি স্বপ্ন বুনে
        </p>
        <p style={{ fontSize: 'clamp(16px, 1.6vw, 20px)', color: 'rgba(255,255,255,0.85)', margin: '0 0 40px', lineHeight: 1.8, maxWidth: '520px', position: 'relative', zIndex: 2, fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
          Bangladesh&apos;s most trusted matrimony platform. Privacy-first, consent-based — and AI that tells you <em>exactly</em> why two people belong together.
        </p>
        <div style={{ position: 'relative', zIndex: 2, marginBottom: '40px' }}>
          <HomeCTA />
        </div>
        <div style={{ position: 'relative', zIndex: 2, display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '40px' }}>
          {["Searching for yourself", "Searching for your child", "Searching for a sibling", "Living abroad"].map(label => (
            <span key={label} style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.25)', borderRadius: '20px', padding: '6px 16px', fontFamily: 'system-ui, sans-serif' }}>{label}</span>
          ))}
        </div>

        {/* Stats bar */}
        <div className="bk-stats-bar" style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(255,255,255,0.97)', padding: '18px 40px', display: 'flex', gap: '0', justifyContent: 'center', zIndex: 2 }}>
          {[['1,811', 'Women registered'], ['1,199', 'Men registered'], ['3,010+', 'Total profiles'], ['Free', 'To join & browse']].map(([n, l], i) => (
            <div key={n} style={{ textAlign: 'center', padding: '0 clamp(12px,3vw,40px)', borderRight: i < 3 ? '1px solid rgba(240,192,64,0.2)' : 'none' }}>
              <div style={{ fontSize: 'clamp(20px, 2.5vw, 28px)', fontWeight: 800, color: '#F0C040', letterSpacing: '-1px' }}>{n}</div>
              <div style={{ fontSize: '11px', color: 'rgba(26,10,13,0.55)', letterSpacing: '1.5px', marginTop: '3px', fontFamily: 'system-ui, sans-serif' }}>{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* DEMO EXPERIENCE */}
      <section style={{ padding: 'clamp(40px,6vw,80px) clamp(16px,4vw,48px)', overflowX: 'hidden', background: '#FFFBF5', borderTop: '1px solid rgba(123,29,46,0.08)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '64px', alignItems: 'center' }}>
          <div>
            <p style={{ fontSize: '13px', color: '#7B1D2E', letterSpacing: '3px', marginBottom: '16px', fontFamily: 'system-ui, sans-serif', textTransform: 'uppercase', opacity: 0.7 }}>Try before you join</p>
            <h2 style={{ fontSize: 'clamp(28px, 3.5vw, 48px)', fontWeight: 700, color: '#1a0a0d', margin: '0 0 20px', lineHeight: 1.1 }}>
              Call. Message. Play.<br/><span style={{ color: '#7B1D2E' }}>Feel it first.</span>
            </h2>
            <p style={{ fontSize: 'clamp(15px, 1.4vw, 17px)', color: '#4b2020', lineHeight: 1.9, margin: 0, fontFamily: 'system-ui, sans-serif', opacity: 0.85 }}>
              No login needed. Hear Sumaiya speak, chat with her AI persona, and play the first question of our compatibility game — right now, before you register.
            </p>
          </div>
          <DemoExperience />
        </div>
      </section>

      {/* INTERACTIVE SECTIONS */}
      <LandingClient />

      {/* FINAL CTA */}
      <section style={{ minHeight: '50vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#7B1D2E', textAlign: 'center', padding: 'clamp(60px,8vw,100px) 24px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 'min(700px, 100%)', height: 'min(700px, 100%)', borderRadius: '50%', background: 'radial-gradient(circle,rgba(240,192,64,0.08) 0%,transparent 70%)', pointerEvents: 'none' }}/>
        <p style={{ fontSize: 'clamp(18px, 2vw, 24px)', color: '#F0C040', margin: '0 0 16px', position: 'relative', zIndex: 2, letterSpacing: '2px' }}>
        </p>
        <h2 style={{ fontSize: 'clamp(32px, 4.5vw, 62px)', fontWeight: 700, color: '#FFFFFF', margin: '0 0 20px', lineHeight: 1.05, position: 'relative', zIndex: 2, letterSpacing: '-1.5px' }}>
          Your person is out there.<br/><span style={{ color: '#F0C040' }}>Go find them.</span>
        </h2>
        <p style={{ fontSize: 'clamp(15px, 1.4vw, 18px)', color: 'rgba(255,255,255,0.72)', margin: '0 0 48px', position: 'relative', zIndex: 2, fontFamily: 'system-ui, sans-serif' }}>
          Free to join. No credit card. 3,010 real profiles waiting.
        </p>
        <div style={{ position: 'relative', zIndex: 2 }}>
          <HomeCTA2 />
        </div>
        <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', letterSpacing: '2px', margin: '40px 0 0', position: 'relative', zIndex: 2, fontFamily: 'system-ui, sans-serif' }}>
          1,811 WOMEN · 1,199 MEN · ALL 8 DIVISIONS · AI MATCHMAKING · FREE
        </p>
      </section>

      {/* FOOTER */}
      <footer style={{ padding: 'clamp(40px,6vw,64px) clamp(24px,6vw,80px) 40px', background: '#1a0a0d', borderTop: '3px solid #F0C040' }}>
        <div className="bk-footer-links" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '40px', marginBottom: '48px' }}>
          <div style={{ maxWidth: '280px' }}>
            <span style={{ fontSize: '24px', fontWeight: 800, color: '#F0C040', letterSpacing: '4px', display: 'block', marginBottom: '10px' }}>BIYEKORI</span>
            <p style={{ margin: '0 0 8px', fontSize: '13px', color: 'rgba(255,255,255,0.35)', fontStyle: 'italic' }}>
            </p>
            <p style={{ margin: 0, fontSize: '14px', color: 'rgba(255,255,255,0.55)', lineHeight: 1.7, fontFamily: 'system-ui, sans-serif' }}>Bangladesh&apos;s most thoughtful matrimony platform. Built in Dhaka.</p>
          </div>
          <div className="bk-footer-cols" style={{ display: 'flex', gap: '48px', flexWrap: 'wrap' }}>
            <div>
              <p style={{ margin: '0 0 16px', fontSize: '11px', fontWeight: 700, color: '#F0C040', letterSpacing: '2px', fontFamily: 'system-ui, sans-serif' }}>PLATFORM</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[["Profiles","/profiles"],["Pricing","/pricing"],["About","/about"],["FAQ","/faq"]].map(([l,h]) => (
                  <Link key={l} href={h} style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontFamily: 'system-ui, sans-serif' }}>{l}</Link>
                ))}
              </div>
            </div>
            <div>
              <p style={{ margin: '0 0 16px', fontSize: '11px', fontWeight: 700, color: '#F0C040', letterSpacing: '2px', fontFamily: 'system-ui, sans-serif' }}>LEGAL</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[["Safety","/safety"],["Privacy","/privacy"],["Terms","/terms"]].map(([l,h]) => (
                  <Link key={l} href={h} style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontFamily: 'system-ui, sans-serif' }}>{l}</Link>
                ))}
              </div>
            </div>
            <div>
              <p style={{ margin: '0 0 16px', fontSize: '11px', fontWeight: 700, color: '#F0C040', letterSpacing: '2px', fontFamily: 'system-ui, sans-serif' }}>CONTACT</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <a href="mailto:support@biyekori.com" style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontFamily: 'system-ui, sans-serif' }}>support@biyekori.com</a>
                <a href="https://wa.me/8801733577215" target="_blank" rel="noreferrer" style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontFamily: 'system-ui, sans-serif' }}>WhatsApp</a>
              </div>
            </div>
          </div>
        </div>
        <div style={{ borderTop: '1px solid rgba(240,192,64,0.15)', paddingTop: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', flexWrap: 'wrap', gap: '16px' }}>
          <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.3)', fontFamily: 'system-ui, sans-serif' }}>&copy; 2026 Biyekori. All rights reserved.</span>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <a href="https://www.facebook.com/profile.php?id=61590028991299" target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '42px', height: '42px', borderRadius: '50%', background: 'rgba(240,192,64,0.1)', border: '1px solid rgba(240,192,64,0.2)' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#F0C040"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
            </a>
            <a href="https://instagram.com/biyekori" target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '42px', height: '42px', borderRadius: '50%', background: 'rgba(240,192,64,0.1)', border: '1px solid rgba(240,192,64,0.2)' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F0C040" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
            </a>
            <a href="https://youtube.com/@biyekori" target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '42px', height: '42px', borderRadius: '50%', background: 'rgba(240,192,64,0.1)', border: '1px solid rgba(240,192,64,0.2)' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#F0C040"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="#1a0a0d"/></svg>
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

