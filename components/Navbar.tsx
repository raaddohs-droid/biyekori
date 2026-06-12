'use client'




import { createClient } from '@supabase/supabase-js'




import Link from 'next/link'




import { usePathname } from 'next/navigation'




import { useState, useEffect, useRef } from 'react'




import dynamic from 'next/dynamic'




const CallModal = dynamic(() => import('./CallModal'), { ssr: false })









export default function Navbar() {




  const pathname = usePathname()




  const [user, setUser] = useState<any>(null)




  const [showMenu, setShowMenu] = useState(false)




  const [showNotifs, setShowNotifs] = useState(false)




  const [notifs, setNotifs] = useState<any[]>([])




  const [unreadCount, setUnreadCount] = useState(0)




  const notifRef = useRef<HTMLDivElement>(null)




  const menuRef = useRef<HTMLDivElement>(null)




  const [incomingCall, setIncomingCall] = useState<any>(null)




  const [showIncomingCall, setShowIncomingCall] = useState(false)




  const callPollRef = useRef<NodeJS.Timeout | null>(null)




  const callSinceRef = useRef<string>(new Date().toISOString())




  const [searchId, setSearchId] = useState('')




  const [searchError, setSearchError] = useState(false)









  useEffect(() => {




    try {




      if (typeof window !== 'undefined' && (window.location.pathname === '/login' || window.location.pathname === '/register')) return




      const stored = localStorage.getItem('biyekori_user')




      if (stored) {




        const u = JSON.parse(stored)




        setUser(u)




        if (u?.id) {




          fetch('/api/notifications?userId=' + u.id)




            .then(r => r.json())




            .then(data => {




              setNotifs(data.notifications || [])




              setUnreadCount(data.unreadCount || 0)




            })




            .catch(() => {})









          // Global incoming call detection via Supabase Realtime




          const SURL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''




          const SKEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''




          const supabase = createClient(SURL, SKEY)




          const channel = supabase




            .channel('incoming-calls-' + u.id)




            .on('postgres_changes', {




              event: 'INSERT',




              schema: 'public',




              table: 'call_signals',




              filter: 'to_id=eq.' + u.id




            }, async (payload: any) => {




              const signal = payload.new




              if (signal.type === 'call-offer') {




                const profileRes = await fetch(SURL + '/rest/v1/profiles?id=eq.' + signal.from_id + '&select=id,full_name,photo_url,age,package', {




                  headers: { apikey: SKEY, Authorization: 'Bearer ' + SKEY }




                })




                const profiles = await profileRes.json()




                if (profiles && profiles[0]) {




                  setIncomingCall({ signal, callerProfile: profiles[0] })




                  setShowIncomingCall(true)




                }




              }




            })




            .subscribe()




          callPollRef.current = channel as any




        }




      }




    } catch(e) {}




  }, [])









  useEffect(() => {




    const handleClick = (e: MouseEvent) => {




      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setShowMenu(false)




      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotifs(false)




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









  const handleOpenNotifs = () => {




    setShowNotifs(!showNotifs)




    if (!showNotifs && unreadCount > 0) {




      const stored = localStorage.getItem('biyekori_user')




      const u = stored ? JSON.parse(stored) : null




      if (u?.id) {




        fetch('/api/notifications', {




          method: 'POST',




          headers: { 'Content-Type': 'application/json' },




          body: JSON.stringify({ userId: u.id })




        }).then(() => setUnreadCount(0))




      }




    }




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









  const handleDobResponse = async (notif: any, action: 'grant' | 'decline') => {




    try {




      const userData = localStorage.getItem('biyekori_user')




      if (!userData) return




      const u = JSON.parse(userData)




      await fetch('/api/dob-request', {




        method: 'POST',




        headers: { 'Content-Type': 'application/json' },




        body: JSON.stringify({




          action,




          profileId: u.id,




          requesterId: notif.related_user_id || String(notif.message).match(/\[REQ:(\d+)\]/)?.[1],




          notificationId: notif.id




        })




      })




      setNotifs((prev: any[]) => prev.map((n: any) => n.id === notif.id ? { ...n, is_read: true } : n))




    } catch (e) {}




  }









  const handleIdSearch = (e: React.FormEvent) => {




    e.preventDefault()




    const id = searchId.trim()




    if (!id) return




    if (!/^\d+$/.test(id)) { setSearchError(true); setTimeout(() => setSearchError(false), 2000); return }




    setSearchId('')




    window.location.href = `/profile/${id}`




  }









  return (




    <>




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




            <span style={{ fontSize: '20px', fontWeight: 700, color: '#7B1D2E', letterSpacing: '3px', fontFamily: 'Georgia, serif' }}>BIYEKORI</span>




          )}




        </Link>









        {/* Center nav */}




        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>




          {user ? (




            <>




              {[




                { href: user ? `/profiles?userGender=${user.gender}&excludeId=${user.id}` : '/profiles', label: 'Profiles' },




                { href: '/interests', label: 'Interests' },




                { href: '/success-stories', label: 'Success Stories' },




                { href: '/messages', label: 'Messages' },




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




                { href: user ? `/profiles?userGender=${user.gender}&excludeId=${user.id}` : '/profiles', label: 'Profiles' },




                { href: '/success-stories', label: 'Success Stories' },




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




        {user && (




          <form onSubmit={handleIdSearch} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>




            <input




              value={searchId}




              onChange={e => setSearchId(e.target.value)}




              placeholder="Profile ID..."




              style={{




                width: '180px', padding: '7px 22px',




                border: `1px solid ${searchError ? '#e11d48' : '#e5e7eb'}`,




                borderRadius: '20px', fontSize: '12px', outline: 'none',




                background: isHome ? 'rgba(255,255,255,0.1)' : '#f9fafb',




                color: isHome ? 'white' : '#111827'




              }}




            />




            <button type="submit" style={{




              padding: '8px 14px', background: 'rgba(240,192,64,0.15)',




              border: 'none', borderRadius: '20px', cursor: 'pointer',




              display: 'flex', alignItems: 'center'




            }}>




              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">




                <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>




              </svg>




            </button>




          </form>




        )}




        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>




          {user ? (




            <>




            {/* Notification Bell */}




            <div style={{ position: 'relative' }} ref={notifRef}>




              <button onClick={handleOpenNotifs} style={{




                position: 'relative', background: 'transparent', border: 'none',




                cursor: 'pointer', padding: '6px', borderRadius: '50%',




                display: 'flex', alignItems: 'center', justifyContent: 'center'




              }}>




                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={isHome ? '#F0C040' : '#6b7280'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">




                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />




                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />




                </svg>




                {unreadCount > 0 && (




                  <span style={{




                    position: 'absolute', top: '2px', right: '2px',




                    background: '#e11d48', color: 'white', borderRadius: '50%',




                    width: '16px', height: '16px', fontSize: '10px', fontWeight: 700,




                    display: 'flex', alignItems: 'center', justifyContent: 'center',




                    lineHeight: 1




                  }}>




                    {unreadCount > 9 ? '9+' : unreadCount}




                  </span>




                )}




              </button>









              {showNotifs && (




                <div style={{




                  position: 'absolute', right: 0, top: 'calc(100% + 10px)',




                  width: '300px', background: 'white', borderRadius: '16px',




                  border: '1px solid #e5e7eb',




                  boxShadow: '0 12px 40px rgba(0,0,0,0.12)', zIndex: 100, overflow: 'hidden'




                }}>




                  <div style={{ padding: '14px 16px', borderBottom: '1px solid #f3f4f6' }}>




                    <p style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#111827' }}>Notifications</p>




                  </div>




                  <div style={{ maxHeight: '320px', overflowY: 'auto' }}>




                    {notifs.length === 0 ? (




                      <div style={{ padding: '24px', textAlign: 'center', color: '#9ca3af', fontSize: '13px' }}>




                        No notifications yet




                      </div>




                    ) : notifs.map((n: any, i: number) => {




                      const isDobRequest = n.type === 'dob_request' && !n.is_read




                      const icon = n.type === 'interest_received' ? '💗' : n.type === 'new_message' ? '💬' : n.type === 'contact_request' ? '📋' : n.type === 'dob_request' ? '📅' : n.type === 'dob_granted' ? '✅' : n.type === 'dob_declined' ? '❌' : '🔔'




                      const href = n.type === 'new_message' ? '/messages' : n.type === 'interest_received' || n.type === 'contact_request' || n.type === 'contact_approved' ? '/interests' : n.profile_id ? '/profile/' + n.profile_id : '/dashboard'




                      if (isDobRequest) {




                        return (




                          <div key={n.id || i} style={{ padding: '12px 16px', borderBottom: '1px solid #f9fafb', background: '#fef2f8' }}>




                            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', marginBottom: '10px' }}>




                              <span style={{ fontSize: '16px', flexShrink: 0 }}>📅</span>




                              <div style={{ flex: 1 }}>




                                <p style={{ margin: '0 0 2px', fontSize: '13px', color: '#111827', lineHeight: 1.4 }}>{n.message.replace(/\[REQ:\d+\]/, '').trim()}</p>




                                {n.created_at && <p style={{ margin: 0, fontSize: '11px', color: '#9ca3af' }}>{new Date(n.created_at).toLocaleDateString('en-GB')}</p>}




                              </div>




                            </div>




                            <div style={{ display: 'flex', gap: '8px' }}>




                              <button onClick={() => handleDobResponse(n, 'grant')} style={{ flex: 1, padding: '6px', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>Share DOB</button>




                              <button onClick={() => handleDobResponse(n, 'decline')} style={{ flex: 1, padding: '6px', background: '#f3f4f6', color: '#6b7280', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>Decline</button>




                            </div>




                          </div>




                        )




                      }




                      return (




                        <a key={n.id || i} href={href} onClick={() => setShowNotifs(false)} style={{ padding: '12px 16px', borderBottom: '1px solid #f9fafb', background: n.is_read ? 'white' : '#fef2f8', display: 'flex', gap: '10px', alignItems: 'flex-start', textDecoration: 'none', cursor: 'pointer' }}>




                          <span style={{ fontSize: '16px', flexShrink: 0 }}>{icon}</span>




                          <div style={{ flex: 1 }}>




                            <p style={{ margin: '0 0 2px', fontSize: '13px', color: '#111827', lineHeight: 1.4 }}>{n.message.replace(/\[(REQ|GRANT|DECLINE):[^\]]*\]/g, '').trim()}</p>




                            {n.created_at && <p style={{ margin: 0, fontSize: '11px', color: '#9ca3af' }}>{new Date(n.created_at).toLocaleDateString('en-GB')}</p>}




                          </div>




                          {!n.is_read && <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#e11d48', flexShrink: 0, marginTop: '4px' }} />}




                        </a>




                      )




                    })}




                  </div>




                </div>




              )}




            </div>









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




                        <p style={{ margin: 0, fontSize: '12px', color: 'rgba(253,246,238,0.4)' }}></p>




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




                        <p style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: '#F0C040', textTransform: 'capitalize' }}>{user.package === 'prottasha' ? 'Free' : user.package === 'silver' ? 'Silver' : user.package === 'gold' ? 'Gold' : user.package === 'milon' ? 'NRB Gold' : 'Free'}</p>




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




                      { href: '/dashboard', icon: '', label: 'Dashboard' },




                      { href: '/interests', icon: '', label: 'My Interests' },




                      { href: '/messages', icon: '', label: 'Messages' },




                      { href: '/edit-profile', icon: '', label: 'Edit Profile' },




                { href: '/verify-selfie', icon: '', label: 'Verify Identity' },




                      { href: user ? `/profiles?userGender=${user.gender}&excludeId=${user.id}` : '/profiles', icon: '', label: 'Browse Profiles' },




                      { href: '/pricing', icon: '', label: 'Plans & Pricing' },




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




                      Logout




                    </button>




                  </div>




                </div>




              )}




            </div>




            </>




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




      {showIncomingCall && incomingCall && user && (




        <CallModal




          currentUser={user}




          targetProfile={incomingCall.callerProfile}




          onClose={() => { setShowIncomingCall(false); setIncomingCall(null) }}




          mode="incoming"




          incomingSignal={incomingCall.signal}




        />




      )}




    </>




  )




}

