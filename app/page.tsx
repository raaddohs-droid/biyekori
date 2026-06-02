import LogoWrapper from "@/components/LogoWrapper"
import Link from "next/link"
import HomeCTA from "@/components/HomeCTA"
import HomeCTA2 from "@/components/HomeCTA2"

export default function Home() {
  return (
    <main style={{ fontFamily: "'Georgia', serif", background: '#080604', color: '#FDF6EE', overflowX: 'hidden' }}>
      <section style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '120px 24px 60px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '700px', height: '700px', borderRadius: '50%', background: 'radial-gradient(circle,rgba(192,120,0,0.07) 0%,transparent 65%)', pointerEvents: 'none' }}/>

        <h1 style={{ fontSize: 'clamp(32px, 5.5vw, 76px)', fontWeight: 700, color: '#FDF6EE', margin: '0 0 24px', lineHeight: 1, letterSpacing: '-2px', position: 'relative', zIndex: 2, whiteSpace: 'nowrap' }}>
          Your person is out there.
        </h1>

        <p style={{ fontSize: 'clamp(16px, 1.8vw, 22px)', fontWeight: 700, color: '#F0C040', margin: '0 0 8px', letterSpacing: '3px', position: 'relative', zIndex: 2 }}>
          <span style={{fontFamily: "var(--font-hind-siliguri)"}}>বিয়ে করি ম্যাট্রিমনি</span>
        </p>
        <p style={{ fontSize: 'clamp(15px, 1.6vw, 20px)', color: '#F0C040', margin: '0 0 40px', fontStyle: 'normal', letterSpacing: '2px', position: 'relative', zIndex: 2 }}>
          <span style={{fontFamily: "var(--font-hind-siliguri)"}}>মনের মানুষ পাবেই তুমি</span>
        </p>

        <HomeCTA />

        <div style={{ width: '100%', minHeight: '220px', position: 'relative', zIndex: 2, overflow: 'visible', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <LogoWrapper />
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

      <footer style={{ padding: '40px 60px', borderTop: '1px solid rgba(240,192,64,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <span style={{ fontSize: '18px', fontWeight: 700, color: '#F0C040', letterSpacing: '3px' }}>BIYEKORI</span>
        <span style={{ fontSize: '12px', color: 'rgba(253,246,238,0.2)' }}>2026 BIYEKORI - BANGLADESH AI MATRIMONY</span>
        <div style={{ display: 'flex', gap: '32px' }}>
          {['Pricing','Profiles','Register','Login'].map(l => (
            <Link key={l} href={`/${l.toLowerCase()}`} style={{ fontSize: '12px', color: 'rgba(253,246,238,0.25)', textDecoration: 'none' }}>{l.toUpperCase()}</Link>
          ))}
        </div>
      </footer>
    </main>
  )
}
