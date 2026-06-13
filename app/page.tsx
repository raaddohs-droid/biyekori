import Link from "next/link"
import HomeCTA from "@/components/HomeCTA"
import HomeCTA2 from "@/components/HomeCTA2"
import LandingClient from "@/components/LandingClient"
import DemoExperience from "@/components/DemoExperience"

export default function Home() {
  return (
    <main style={{ fontFamily: "'Hind Siliguri', 'Plus Jakarta Sans', system-ui, sans-serif", background: '#FDF6EE', color: '#1a0a0d', overflowX: 'hidden' }}>

      <style>{`
        @media (max-width: 767px) {
          .bk-hero {
            background-image: none !important;
            background: #1a0a0d !important;
            min-height: auto !important;
            padding: 110px 20px 80px !important;
            align-items: center !important;
            text-align: center !important;
          }
          .bk-hero h1 { font-size: clamp(34px,10vw,52px) !important; letter-spacing: -1px !important; }
          .bk-hero-sub { max-width: 100% !important; }
          .bk-stats-bar { position: static !important; flex-wrap: wrap !important; padding: 16px !important; gap: 0 !important; }
          .bk-stats-bar > div { width: 50% !important; padding: 10px 8px !important; border-right: none !important; border-bottom: 1px solid rgba(240,192,64,0.15) !important; }
          .bk-footer-links { flex-direction: column !important; gap: 32px !important; }
          .bk-footer-cols { gap: 24px !important; }
          .bk-hero-tags { justify-content: center !important; }
        }
      `}</style>

      {/* HERO */}
      <section className="bk-hero" style={{ position: 'relative', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center', backgroundImage: "url('/hero-wedding.jpg')", backgroundSize: 'cover', backgroundPosition: 'center top', padding: 'clamp(100px,12vw,120px) clamp(16px,5vw,24px) 80px clamp(16px,5vw,40%)', textAlign: 'left', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(0,0,0,0) 0%, rgba(0,0,0,0.15) 100%)', pointerEvents: 'none' }} />

        <h1 style={{ fontSize: 'clamp(38px, 6.5vw, 88px)', fontWeight: 700, color: '#FFFFFF', margin: '0 0 12px', lineHeight: 1.0, letterSpacing: '-2px', position: 'relative', zIndex: 2, textShadow: '0 2px 30px rgba(0,0,0,0.4)' }}>
          Someone is waiting<br />for you.
        </h1>
        <p style={{ fontSize: 'clamp(20px, 3vw, 34px)', fontWeight: 600, color: 'rgba(255,255,255,0.7)', margin: '0 0 18px', lineHeight: 1.3, position: 'relative', zIndex: 2 }}>
          যেখানে দুটি পরিবার একটি স্বপ্ন বুনে
        </p>
        <p className="bk-hero-sub" style={{ fontSize: 'clamp(15px, 1.5vw, 19px)', color: 'rgba(255,255,255,0.85)', margin: '0 0 36px', lineHeight: 1.8, maxWidth: '500px', position: 'relative', zIndex: 2 }}>
          Bangladesh&apos;s most trusted matrimony platform. Privacy-first, consent-based — AI that tells you <em>exactly</em> why you match.
        </p>
        <div style={{ position: 'relative', zIndex: 2, marginBottom: '32px' }}>
          <HomeCTA />
        </div>
        <div className="bk-hero-tags" style={{ position: 'relative', zIndex: 2, display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {["For yourself", "For your child", "For a sibling", "Living abroad"].map(label => (
            <span key={label} style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.25)', borderRadius: '20px', padding: '5px 14px' }}>{label}</span>
          ))}
        </div>

        <div className="bk-stats-bar" style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(255,255,255,0.97)', padding: '16px 40px', display: 'flex', gap: '0', justifyContent: 'center', zIndex: 2 }}>
          {[['1,811', 'Women'], ['1,199', 'Men'], ['3,010+', 'Profiles'], ['Free', 'To join']].map(([n, l], i) => (
            <div key={n} style={{ textAlign: 'center', padding: '0 clamp(10px,3vw,36px)', borderRight: i < 3 ? '1px solid rgba(240,192,64,0.2)' : 'none' }}>
              <div style={{ fontSize: 'clamp(18px, 2.5vw, 26px)', fontWeight: 800, color: '#F0C040' }}>{n}</div>
              <div style={{ fontSize: '11px', color: 'rgba(26,10,13,0.55)', letterSpacing: '1px', marginTop: '2px' }}>{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* DEMO EXPERIENCE */}
      <section style={{ padding: 'clamp(40px,6vw,80px) clamp(16px,4vw,48px)', background: '#FDF6EE', borderTop: '1px solid rgba(123,29,46,0.08)', overflowX: 'hidden' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(280px,100%), 1fr))', gap: '48px', alignItems: 'center' }}>
          <div>
            <p style={{ fontSize: '12px', color: '#7B1D2E', letterSpacing: '3px', marginBottom: '14px', textTransform: 'uppercase', opacity: 0.7 }}>Try before you join</p>
            <h2 style={{ fontSize: 'clamp(26px, 3.5vw, 46px)', fontWeight: 700, color: '#1a0a0d', margin: '0 0 18px', lineHeight: 1.1 }}>
              Call. Message. Play.<br /><span style={{ color: '#7B1D2E' }}>Feel it first.</span>
            </h2>
            <p style={{ fontSize: 'clamp(14px, 1.4vw, 16px)', color: '#4b2020', lineHeight: 1.9, margin: 0, opacity: 0.85 }}>
              No login needed. Hear Sumaiya speak, chat with her AI persona, and play the first question of our compatibility game — right now.
            </p>
          </div>
          <DemoExperience />
        </div>
      </section>

      {/* INTERACTIVE SECTIONS */}
      <LandingClient />

      {/* FINAL CTA */}
      <section style={{ minHeight: '40vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#7B1D2E', textAlign: 'center', padding: 'clamp(48px,7vw,80px) clamp(16px,4vw,24px)', position: 'relative', overflow: 'hidden' }}>
        <h2 style={{ fontSize: 'clamp(28px, 4.5vw, 58px)', fontWeight: 700, color: '#FFFFFF', margin: '0 0 16px', lineHeight: 1.05, position: 'relative', zIndex: 2 }}>
          Your person is out there.<br /><span style={{ color: '#F0C040' }}>Go find them.</span>
        </h2>
        <p style={{ fontSize: 'clamp(14px, 1.4vw, 17px)', color: 'rgba(255,255,255,0.72)', margin: '0 0 36px', position: 'relative', zIndex: 2 }}>
          Free to join. No credit card. 3,010 real profiles waiting.
        </p>
        <div style={{ position: 'relative', zIndex: 2 }}>
          <HomeCTA2 />
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ padding: 'clamp(36px,5vw,56px) clamp(16px,5vw,64px) 32px', background: '#1a0a0d', borderTop: '3px solid #F0C040', overflowX: 'hidden' }}>
        <div className="bk-footer-links" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '32px', marginBottom: '40px' }}>
          <div style={{ maxWidth: '260px', minWidth: 0 }}>
            <span style={{ fontSize: '22px', fontWeight: 800, color: '#F0C040', letterSpacing: '4px', display: 'block', marginBottom: '10px' }}>BIYEKORI</span>
            <p style={{ margin: 0, fontSize: '13px', color: 'rgba(255,255,255,0.55)', lineHeight: 1.7 }}>Bangladesh&apos;s most thoughtful matrimony platform. Built in Dhaka.</p>
          </div>
          <div className="bk-footer-cols" style={{ display: 'flex', gap: '40px', flexWrap: 'wrap' }}>
            <div>
              <p style={{ margin: '0 0 14px', fontSize: '11px', fontWeight: 700, color: '#F0C040', letterSpacing: '2px' }}>PLATFORM</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[["Profiles", "/profiles"], ["Pricing", "/pricing"], ["About", "/about"], ["FAQ", "/faq"]].map(([l, h]) => (
                  <Link key={l} href={h} style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>{l}</Link>
                ))}
              </div>
            </div>
            <div>
              <p style={{ margin: '0 0 14px', fontSize: '11px', fontWeight: 700, color: '#F0C040', letterSpacing: '2px' }}>LEGAL</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[["Safety", "/safety"], ["Privacy", "/privacy"], ["Terms", "/terms"]].map(([l, h]) => (
                  <Link key={l} href={h} style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>{l}</Link>
                ))}
              </div>
            </div>
            <div>
              <p style={{ margin: '0 0 14px', fontSize: '11px', fontWeight: 700, color: '#F0C040', letterSpacing: '2px' }}>CONTACT</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <a href="mailto:support@biyekori.com" style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>support@biyekori.com</a>
                <a href="https://wa.me/8801733577215" target="_blank" rel="noreferrer" style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>WhatsApp</a>
              </div>
            </div>
          </div>
        </div>
        <div style={{ borderTop: '1px solid rgba(240,192,64,0.15)', paddingTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.3)' }}>&copy; 2026 Biyekori. All rights reserved.</span>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            {[
              { href: "https://www.facebook.com/profile.php?id=61590028991299", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="#F0C040"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg> },
              { href: "https://instagram.com/biyekori", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F0C040" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" /></svg> },
            ].map(({ href, icon }, i) => (
              <a key={i} href={href} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '38px', height: '38px', borderRadius: '50%', background: 'rgba(240,192,64,0.1)', border: '1px solid rgba(240,192,64,0.2)' }}>
                {icon}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </main>
  </div>
  )
}
