'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

function maskName(name: string): string {
  if (!name) return 'A***'
  const parts = name.trim().split(' ')
  return parts.map(p => p[0] + '*'.repeat(Math.max(p.length - 1, 2))).join(' ')
}

function getSlotTime(): number {
  const now = new Date()
  const bdTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Dhaka' }))
  const hour = bdTime.getHours()
  if (hour < 6) return 0
  if (hour < 12) return 1
  if (hour < 18) return 2
  return 3
}

const COUNTERS = [
  { active: '১,২৪৭', interests: '৮৩', joined: '১২' },
  { active: '১,৩১৫', interests: '৯৭', joined: '১৮' },
  { active: '১,১৮৩', interests: '৭৪', joined: '৯' },
  { active: '১,৪২১', interests: '১০৮', joined: '২১' },
]

export default function OrbitCards() {
  const router = useRouter()
  const [profiles, setProfiles] = useState<any[]>([])
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const slot = getSlotTime()
  const counter = COUNTERS[slot]

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem('biyekori_user'))

    // Fetch profiles — 3 female, 1 male per set, total 16
    const fetchProfiles = async () => {
      const [female, male] = await Promise.all([
        fetch(`${SUPABASE_URL}/rest/v1/profiles?gender=eq.female&photo_privacy=eq.false&select=id,full_name,age,city,district,profession,religion&order=created_at.desc&limit=100`, {
          headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
        }).then(r => r.json()),
        fetch(`${SUPABASE_URL}/rest/v1/profiles?gender=eq.male&photo_privacy=eq.false&select=id,full_name,age,city,district,profession,religion&order=created_at.desc&limit=50`, {
          headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
        }).then(r => r.json())
      ])

      if (!Array.isArray(female) || !Array.isArray(male)) return

      // Shuffle with slot seed for 6hr refresh
      const seed = slot * 17
      const shuffled = (arr: any[]) => [...arr].sort((a, b) => ((a.id * 7 + seed) % 100) - ((b.id * 7 + seed) % 100))
      const f = shuffled(female).slice(0, 12)
      const m = shuffled(male).slice(0, 4)

      // Interleave 3:1
      const cards: any[] = []
      for (let i = 0; i < 4; i++) {
        if (f[i * 3]) cards.push({ ...f[i * 3], gender: 'female' })
        if (f[i * 3 + 1]) cards.push({ ...f[i * 3 + 1], gender: 'female' })
        if (f[i * 3 + 2]) cards.push({ ...f[i * 3 + 2], gender: 'female' })
        if (m[i]) cards.push({ ...m[i], gender: 'male' })
      }
      setProfiles(cards)
    }
    fetchProfiles().catch(() => {})
  }, [])

  const handleCardClick = () => {
    if (isLoggedIn) router.push('/profiles')
    else router.push('/register')
  }

  if (profiles.length === 0) return null

  // Duplicate for seamless loop
  const allCards = [...profiles, ...profiles]

  return (
    <section style={{
      background: 'linear-gradient(180deg, #0d0a1a 0%, #080604 100%)',
      padding: '70px 0 60px',
      overflow: 'hidden',
      borderTop: '1px solid rgba(240,192,64,0.08)',
      borderBottom: '1px solid rgba(240,192,64,0.08)',
    }}>
      {/* Heading */}
      <div style={{ textAlign: 'center', marginBottom: '48px', padding: '0 20px' }}>
        <p style={{ margin: '0 0 8px', fontSize: '11px', letterSpacing: '4px', color: 'rgba(240,192,64,0.5)', textTransform: 'uppercase', fontWeight: 600 }}>
          ACTIVE MEMBERS
        </p>
        <h2 style={{ margin: 0, fontSize: 'clamp(22px, 3vw, 36px)', fontWeight: 800, color: '#FDF6EE' }}>
          আপনার মনের মানুষ এখানেই আছে
        </h2>
        <p style={{ margin: '8px 0 0', fontSize: '14px', color: 'rgba(253,246,238,0.5)' }}>
          Your perfect match is already waiting
        </p>
      </div>

      {/* Orbital scroll container */}
      <div style={{
        position: 'relative',
        perspective: '1200px',
        perspectiveOrigin: '50% 50%',
        height: '220px',
        marginBottom: '48px',
      }}>
        <div
          ref={containerRef}
          style={{
            position: 'absolute',
            top: '50%',
            left: 0,
            right: 0,
            transform: 'translateY(-50%) rotateX(16deg)',
            transformStyle: 'preserve-3d',
            display: 'flex',
            gap: '20px',
            padding: '0 40px',
            animation: 'orbitScroll 35s linear infinite',
            width: 'max-content',
          }}
        >
          {allCards.map((profile: any, i: number) => {
            const isFemale = profile.gender === 'female'
            const location = profile.city || profile.district || 'Bangladesh'
            return (
              <div
                key={i}
                onClick={handleCardClick}
                style={{
                  flexShrink: 0,
                  width: '180px',
                  background: isFemale
                    ? 'linear-gradient(135deg, rgba(225,29,72,0.15) 0%, rgba(139,0,60,0.25) 100%)'
                    : 'linear-gradient(135deg, rgba(30,50,120,0.15) 0%, rgba(60,30,100,0.25) 100%)',
                  border: `1px solid ${isFemale ? 'rgba(225,29,72,0.3)' : 'rgba(99,102,241,0.3)'}`,
                  borderRadius: '16px',
                  padding: '18px 16px',
                  cursor: 'pointer',
                  backdropFilter: 'blur(8px)',
                  transition: 'transform 0.2s',
                  boxShadow: isFemale
                    ? '0 4px 20px rgba(225,29,72,0.1)'
                    : '0 4px 20px rgba(99,102,241,0.1)',
                }}
                onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.05)')}
                onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
              >
                {/* Gender indicator */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: isFemale ? '#e11d48' : '#6366f1', flexShrink: 0 }} />
                  <span style={{ fontSize: '10px', color: isFemale ? '#fda4af' : '#a5b4fc', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>
                    {isFemale ? 'Bride' : 'Groom'}
                  </span>
                </div>

                {/* Name */}
                <p style={{ margin: '0 0 6px', fontSize: '15px', fontWeight: 800, color: '#FDF6EE', letterSpacing: '0.3px' }}>
                  {maskName(profile.full_name)}
                </p>

                {/* Details */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '12px', color: 'rgba(253,246,238,0.65)' }}>
                    {profile.age} yrs • {location}
                  </span>
                  {profile.profession && (
                    <span style={{ fontSize: '11px', color: 'rgba(253,246,238,0.5)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {profile.profession}
                    </span>
                  )}
                  {profile.religion && (
                    <span style={{ fontSize: '11px', color: isFemale ? 'rgba(253,164,175,0.7)' : 'rgba(165,180,252,0.7)', fontWeight: 600 }}>
                      {profile.religion}
                    </span>
                  )}
                </div>

                {/* CTA */}
                <div style={{ marginTop: '12px', padding: '6px 0', borderTop: `1px solid ${isFemale ? 'rgba(225,29,72,0.2)' : 'rgba(99,102,241,0.2)'}`, fontSize: '11px', color: isFemale ? '#fda4af' : '#a5b4fc', fontWeight: 700, textAlign: 'center' }}>
                  View Profile →
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Live counter */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '40px', flexWrap: 'wrap', padding: '0 20px' }}>
        {[
          { value: counter.active, label: 'আজ সক্রিয়', sublabel: 'Active today' },
          { value: counter.interests, label: 'ইন্টারেস্ট পাঠানো', sublabel: 'Interests sent' },
          { value: counter.joined, label: 'নতুন যোগদান', sublabel: 'Joined today' },
        ].map((c, i) => (
          <div key={i} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 'clamp(24px, 3vw, 36px)', fontWeight: 900, color: '#F0C040', lineHeight: 1 }}>{c.value}</div>
            <div style={{ fontSize: '13px', color: '#FDF6EE', fontWeight: 600, marginTop: '4px' }}>{c.label}</div>
            <div style={{ fontSize: '11px', color: 'rgba(253,246,238,0.4)', marginTop: '2px' }}>{c.sublabel}</div>
          </div>
        ))}
      </div>

      {/* Join CTA */}
      <div style={{ textAlign: 'center', marginTop: '36px' }}>
        <button onClick={handleCardClick} style={{
          padding: '14px 40px',
          background: 'linear-gradient(135deg, #F0C040, #C07800)',
          color: '#080604', border: 'none', borderRadius: '8px',
          fontSize: '13px', fontWeight: 800, letterSpacing: '2px',
          cursor: 'pointer', textTransform: 'uppercase'
        }}>
          {isLoggedIn ? 'Browse All Profiles' : 'Join Free & Meet Them'}
        </button>
      </div>

      <style>{`
        @keyframes orbitScroll {
          0% { transform: translateY(-50%) rotateX(16deg) translateX(0); }
          100% { transform: translateY(-50%) rotateX(16deg) translateX(-50%); }
        }
      `}</style>
    </section>
  )
}
