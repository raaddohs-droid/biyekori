'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'

export default function Navbar() {
  const pathname = usePathname()
  const [user, setUser] = useState<any>(null)
  const [showMenu, setShowMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    try {
      const stored = localStorage.getItem('biyekori_user')
      if (stored) setUser(JSON.parse(stored))
    } catch(e) {}
  }, [])

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setShowMenu(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('biyekori_user')
    setUser(null)
    setShowMenu(false)
    window.location.href = '/'
  }

  const isActive = (path: string) => pathname === path
  const isHome = pathname === '/'
  const completion = user?.profile_completion || 30

  // On homepage use dark navbar, elsewhere use white
  const navBg = isHome ? 'rgba(8,6,4,0.85)' : 'white'
  const navBorder = isHome ? 'rgba(240,192,64,0.08)' : '#f3f4f6'
  const textColor = isHome ? 'rgba(253,246,238,0.6)' : '#4b5563'
  const activeColor = isHome ? '#F0C040' : '#e11d48'
  const logoGold = isHome

  const planColors: Record<string, {color: string; bg: string}> = {
    prottasha: { color: '#6b7280', bg: '#f3f4f6' },
    biswas:    { color: '#2563eb', bg: '#eff6ff' },
    shopno:    { color: '#7c3aed', bg: '#f5f3ff' },
    proyash:   { color: '#d97706', bg: '#fffbeb' },
  }
  const plan = planColors[user?.package] || planColors.prottasha

  return (
    <nav style={{
      background: navBg,
      backdropFilter: isHome ? 'blur(20px)' : 'none',
      borderBottom: `1px solid ${navBorder}`,
      position: 'fixed', top: 0, left: 0, right: 0,
      zIndex: 50, transition: 'background 0.3s'
    }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '60px' }}>

        {/* Logo */}
        <Link href="/" style={{ textDecoration: 'none' }}>
          {logoGold ? (
            <span style={{ fontSize: '20px', fontWeight: 700, color: '#F0C040', letterSpacing: '3px', fontFamily: 'Georgia, serif' }}>BIYEKORI</span>
          ) : (
            <span style={{ fontSize: '20px', fontWeight: 700, background: 'linear-gradient(135deg, #e11d48, #9333ea)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontFamily: 'Georgia, serif' }}>Biye Kori</span>
          )}
        </Link>

        {/* Center nav */}
        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
          {user ? (
            <>
              {[
                { href: '/profiles', label: 'Profiles' },
                { href: '/interests', label: 'Interests' },
                { href: '/dashboard', label: 'Dashboard' },
              ].map(({ href, label }) => (
                <Link key={href} href={href} style={{
                  padding: '6px 14px', borderRadius: '6px', fontSize: '13px',
                  fontWeight: isActive(href) ? 600 : 400,
                  color: isActive(href) ? activeColor : textColor,
                  textDecoration: 'none',
                  background: isActive(href) && !isHome ? '#fff1f2' : 'transparent',
                  fontFamily: 'Georgia, serif'
                }}>
                  {label}
                </Link>
              ))}
            </>
          ) : (
            <>
              {[
                { href: '/profiles', label: 'Profiles' },
                { href: '/pricing', label: 'Pricing' },
              ].map(({ href, label }) => (
                <Link key={href} href={href} style={{
                  padding: '6px 14px', borderRadius: '6px', fontSize: '13px',
                  color: textColor, textDecoration: 'none', fontFamily: 'Georgia, serif'
                }}>
                  {label}
                </Link>
              ))}
            </>
          )}
        </div>

        {/* Right */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {user ? (
            <div style={{ position: 'relative' }} ref={menuRef}>
              <button onClick={() => setShowMenu(!showMenu)} style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '5px 12px 5px 5px',
                borderRadius: '40px',
                border: isHome ? '1px solid rgba(240,192,64,0.3)' : '1px solid #e5e7eb',
                background: isHome ? 'rgba(240,192,64,0.08)' : 'white',
                cursor: 'pointer'
              }}>
                {/* Avatar */}
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', overflow: 'hidden', background: 'linear-gradient(135deg, #e11d48, #9333ea)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {user.photo_url
                    ? <img src={user.photo_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <span style={{ color: 'white', fontSize: '13px', fontWeight: 700 }}>{user.full_name?.charAt(0)}</span>
                  }
                </div>
                <span style={{ fontSize: '13px', fontWeight: 600, color: isHome ? '#FDF6EE' : '#1f2937', maxWidth: '80px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: 'Georgia, serif' }}>
                  {user.full_name?.split(' ')[0]}
                </span>
                <svg style={{ width: '14px', height: '14px', color: isHome ? '#F0C040' : '#9ca3af', transition: 'transform 0.2s', transform: showMenu ? 'rotate(180deg)' : 'none' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* â”€â”€ DROPDOWN â”€â”€ */}
              {showMenu && (
                <div style={{
                  position: 'absolute', right: 0, top: 'calc(100% + 10px)',
                  width: '280px', background: 'white', borderRadius: '16px',
                  border: '1px solid #e5e7eb',
                  boxShadow: '0 12px 40px rgba(0,0,0,0.12)', zIndex: 100, overflow: 'hidden'
                }}>

                  {/* User header */}
                  <div style={{ padding: '18px', background: 'linear-gradient(135deg, #080604, #1a1208)', borderBottom: '1px solid rgba(240,192,64,0.15)' }}>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '14px' }}>
                      <div style={{ width: '48px', height: '48px', borderRadius: '50%', overflow: 'hidden', background: 'linear-gradient(135deg, #e11d48, #9333ea)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {user.photo_url
                          ? <img src={user.photo_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          : <span style={{ color: 'white', fontSize: '20px', fontWeight: 700 }}>{user.full_name?.charAt(0)}</span>
                        }
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#FDF6EE', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.full_name}</p>
                        <p style={{ margin: 0, fontSize: '12px', color: 'rgba(253,246,238,0.4)' }}>{user.phone}</p>
                      </div>
                    </div>

                    {/* Profile completion */}
                    <div style={{ marginBottom: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                        <span style={{ fontSize: '11px', color: 'rgba(253,246,238,0.5)', letterSpacing: '1px' }}>PROFILE COMPLETION</span>
                        <span style={{ fontSize: '11px', fontWeight: 700, color: completion >= 70 ? '#4ade80' : '#F0C040' }}>{completion}%</span>
                      </div>
                      <div style={{ height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${completion}%`, background: completion >= 70 ? '#4ade80' : 'linear-gradient(90deg,#F0C040,#C07800)', borderRadius: '4px' }} />
                      </div>
                    </div>

                    {/* Plan */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: 'rgba(240,192,64,0.08)', borderRadius: '8px', border: '1px solid rgba(240,192,64,0.15)' }}>
                      <div>
                        <p style={{ margin: 0, fontSize: '10px', color: 'rgba(253,246,238,0.4)', letterSpacing: '1px' }}>CURRENT PLAN</p>
                        <p style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: '#F0C040', textTransform: 'capitalize' }}>{user.package || 'Prottasha'}</p>
                      </div>
                      {user.package === 'prottasha' && (
                        <Link href="/pricing" onClick={() => setShowMenu(false)} style={{ padding: '5px 14px', background: 'linear-gradient(135deg,#F0C040,#C07800)', color: '#080604', borderRadius: '6px', fontSize: '11px', fontWeight: 700, textDecoration: 'none', letterSpacing: '0.5px' }}>
                          Upgrade
                        </Link>
                      )}
                    </div>
                  </div>

                  {/* Menu items */}
                  <div style={{ padding: '8px 0' }}>
                    {[
                      { href: '/dashboard', icon: 'ðŸ“Š', label: 'Dashboard' },
                      { href: '/interests', icon: 'ðŸ’Œ', label: 'My Interests' },
                      { href: '/profiles', icon: 'ðŸ”', label: 'Browse Profiles' },
                      { href: '/pricing', icon: 'â­', label: 'Plans & Pricing' },
                    ].map(({ href, icon, label }) => (
                      <Link key={href} href={href} onClick={() => setShowMenu(false)}
                        style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 18px', fontSize: '13px', color: '#374151', textDecoration: 'none', fontFamily: 'Georgia, serif' }}
                        onMouseEnter={e => (e.currentTarget.style.background = '#f9fafb')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                      >
                        <span style={{ fontSize: '15px' }}>{icon}</span>{label}
                      </Link>
                    ))}
                  </div>

                  <div style={{ borderTop: '1px solid #f3f4f6', padding: '8px 0' }}>
                    <button onClick={handleLogout}
                      style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 18px', fontSize: '13px', color: '#ef4444', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left', fontFamily: 'Georgia, serif' }}
                      onMouseEnter={e => (e.currentTarget.style.background = '#fef2f2')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      <span style={{ fontSize: '15px' }}>ðŸšª</span>Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <Link href="/login" style={{
                padding: '8px 18px', fontSize: '13px', fontWeight: 600,
                color: isHome ? 'rgba(253,246,238,0.6)' : '#4b5563',
                textDecoration: 'none', borderRadius: '6px',
                border: isHome ? '1px solid rgba(240,192,64,0.2)' : '1px solid #e5e7eb',
                fontFamily: 'Georgia, serif'
              }}>
                Login
              </Link>
              <Link href="/register" style={{
                padding: '8px 20px', fontSize: '13px', fontWeight: 700,
                color: isHome ? '#080604' : 'white',
                textDecoration: 'none', borderRadius: '6px',
                background: isHome ? 'linear-gradient(135deg,#F0C040,#C07800)' : 'linear-gradient(135deg,#e11d48,#9333ea)',
                fontFamily: 'Georgia, serif', letterSpacing: '0.5px'
              }}>
                Join Free
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}

