import LogoWrapper from "@/components/LogoWrapper"
import Link from "next/link"
import HomeCTA from "@/components/HomeCTA"
import HomeCTA2 from "@/components/HomeCTA2"

export default function Home() {
  return (
    <main style={{ fontFamily: "'Georgia', serif", background: '#080604', color: '#FDF6EE', overflowX: 'hidden' }}>
      <section style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundImage: "url('/hero-bg.jpg')", backgroundSize: 'cover', backgroundPosition: 'center 30%', backgroundRepeat: 'no-repeat', padding: '120px 24px 60px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '700px', height: '700px', borderRadius: '50%', background: 'radial-gradient(circle,rgba(192,120,0,0.07) 0%,transparent 65%)', pointerEvents: 'none' }}/>

        <h1 style={{ fontSize: 'clamp(32px, 5.5vw, 76px)', fontWeight: 700, color: '#FFFFFF', margin: '0 0 24px', lineHeight: 1, letterSpacing: '-2px', position: 'relative', zIndex: 2, textShadow: '0 2px 20px rgba(0,0,0,0.9), 0 4px 40px rgba(0,0,0,0.7)' }}>
          Your person is out there.
        </h1>

        <p style={{ fontSize: 'clamp(22px, 2.8vw, 36px)', fontWeight: 700, color: '#FFE066', margin: '0 0 8px', letterSpacing: '3px', position: 'relative', zIndex: 2, textShadow: '0 2px 12px rgba(0,0,0,0.9)' }}>
          <span style={{fontFamily: "var(--font-hind-siliguri)"}}>বিয়ে করি ম্যাট্রিমনি</span>
        </p>
        <p style={{ fontSize: 'clamp(18px, 2.2vw, 28px)', color: '#FFD700', margin: '0 0 40px', fontStyle: 'normal', letterSpacing: '2px', position: 'relative', zIndex: 2, textShadow: '0 2px 12px rgba(0,0,0,0.9)' }}>
          <span style={{fontFamily: "var(--font-hind-siliguri)"}}>মনের মানুষ পাবেই তুমি</span>
        </p>

        <HomeCTA />

        <div style={{ position: 'relative', zIndex: 2, marginTop: '16px', textAlign: 'center' }}>
          <div style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(24px, 5vw, 44px)', fontWeight: 700, color: '#F0C040', letterSpacing: '3px' }}>biyekori</div>
        </div>

        <p style={{ fontSize: '11px', color: 'rgba(253,246,238,0.15)', letterSpacing: '2.5px', margin: '24px 0 0', position: 'relative', zIndex: 2 }}>
          1000+ PROFILES · AI MATCHMAKING · NO CREDIT CARD
        </p>

        <div style={{ position: 'absolute', bottom: '40px', left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', opacity: 0.25 }}>
          <div style={{ width: '1px', height: '48px', background: 'linear-gradient(to bottom, transparent, #F0C040)' }}/>
          <span style={{ fontSize: '10px', letterSpacing: '3px', color: '#F0C040' }}>SCROLL</span>
        </div>
      </section>

      <section style={{ padding: '100px 80px', textAlign: 'center', borderTop: '1px solid rgba(240,192,64,0.06)' }}>
        <p style={{ fontSize: 'clamp(24px, 3.5vw, 48px)', fontWeight: 700, color: '#FDF6EE', lineHeight: 1.3, maxWidth: '900px', margin: '0 auto' }}>
          Not just a matrimony site.<br/>
          <span style={{ color: '#F0C040' }}>Bangladesh first AI-powered</span><br/>
          match engine.
        </p>
      </section>

      {[
        { num: '01', title: 'AI Match Score', sub: 'Compatibility, calculated.', body: 'Our algorithm analyses religion, education, location, personality, family values and 3 more factors giving every pair a score out of 100.' },
        { num: '02', title: 'Predictability Score', sub: 'Know before you reach out.', body: 'Every profile gets a trust score based on completeness, NID verification and photo quality.' },
        { num: '03', title: 'Who Viewed Me', sub: 'Full visibility.', body: 'See every person who visited your profile with photo, name and city. Premium members get the full list.' },
        { num: '04', title: 'PDF Biodata', sub: 'Share with family instantly.', body: 'Generate a beautifully designed biodata PDF in one click. Perfect for sharing with parents and relatives.' },
      ].map(({ num, title, sub, body }) => (
        <section key={num} style={{ padding: '80px 120px', display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '80px', alignItems: 'center', maxWidth: '1200px', margin: '0 auto', borderTop: '1px solid rgba(240,192,64,0.06)' }}>
          <div>
            <div style={{ fontSize: '11px', color: 'rgba(240,192,64,0.3)', letterSpacing: '3px', marginBottom: '16px' }}>{num}</div>
            <h2 style={{ fontSize: 'clamp(22px, 2.5vw, 36px)', fontWeight: 700, color: '#FDF6EE', margin: '0 0 10px', lineHeight: 1.1 }}>{title}</h2>
            <p style={{ fontSize: '15px', color: '#F0C040', margin: 0, fontStyle: 'italic' }}>{sub}</p>
          </div>
          <p style={{ fontSize: 'clamp(14px, 1.4vw, 18px)', color: 'rgba(253,246,238,0.4)', lineHeight: 1.9, margin: 0 }}>{body}</p>
        </section>
      ))}

      <section style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderTop: '1px solid rgba(240,192,64,0.06)', textAlign: 'center', padding: '80px 24px', position: 'relative' }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle,rgba(192,120,0,0.07) 0%,transparent 70%)', pointerEvents: 'none' }}/>
        <h2 style={{ fontSize: 'clamp(24px, 3.5vw, 50px)', fontWeight: 700, color: '#FDF6EE', margin: '0 0 14px', lineHeight: 1.15 }}>
          <span style={{fontFamily: "var(--font-hind-siliguri)"}}>বিয়ে করি ম্যাট্রিমনি</span>
        </h2>
        <p style={{ fontSize: 'clamp(18px, 2vw, 28px)', color: '#F0C040', fontStyle: 'italic', margin: '0 0 48px' }}>
          <span style={{fontFamily: "var(--font-hind-siliguri)"}}>মনের মানুষ পাবেই তুমি</span>
        </p>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <HomeCTA2 />
        </div>
      </section>

      <footer style={{ padding: '64px 80px 40px', borderTop: '1px solid rgba(240,192,64,0.15)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '40px', marginBottom: '56px' }}>
          <div>
            <span style={{ fontSize: '26px', fontWeight: 800, color: '#F0C040', letterSpacing: '4px', display: 'block', marginBottom: '12px' }}>BIYEKORI</span>
            <p style={{ margin: 0, fontSize: '15px', color: 'rgba(253,246,238,0.6)', lineHeight: 1.7, maxWidth: '260px' }}>Bangladesh first AI-powered matrimony platform. Find your life partner.</p>
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
            <a href="https://facebook.com/biyekori" target="_blank" rel="noreferrer" title="Facebook" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '46px', height: '46px', borderRadius: '50%', background: 'rgba(240,192,64,0.12)', border: '1px solid rgba(240,192,64,0.2)', transition: 'all 0.2s' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="#F0C040"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
            </a>
            <a href="https://instagram.com/biyekori" target="_blank" rel="noreferrer" title="Instagram" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '46px', height: '46px', borderRadius: '50%', background: 'rgba(240,192,64,0.12)', border: '1px solid rgba(240,192,64,0.2)', transition: 'all 0.2s' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#F0C040" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
            </a>
            <a href="https://youtube.com/@biyekori" target="_blank" rel="noreferrer" title="YouTube" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '46px', height: '46px', borderRadius: '50%', background: 'rgba(240,192,64,0.12)', border: '1px solid rgba(240,192,64,0.2)', transition: 'all 0.2s' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="#F0C040"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="#080604"/></svg>
            </a>
            <a href="https://linkedin.com/company/biyekori" target="_blank" rel="noreferrer" title="LinkedIn" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '46px', height: '46px', borderRadius: '50%', background: 'rgba(240,192,64,0.12)', border: '1px solid rgba(240,192,64,0.2)', transition: 'all 0.2s' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="#F0C040"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
            </a>
          </div>
        </div>
      </footer>
    </main>
  )
}
