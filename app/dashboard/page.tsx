"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ProfileCompletion from '@/components/ProfileCompletion';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

async function fetchViewers(profileId: string) {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/profile_views?viewed_profile_id=eq.${profileId}&select=*,viewer:viewer_id(id,full_name,photo_url,age,city,profession,gender)&order=viewed_at.desc&limit=20`,
    { headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` } }
  );
  return res.json();
}

async function fetchViewCount(profileId: string) {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/profile_views?viewed_profile_id=eq.${profileId}&select=count`,
    { headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}`, 'Prefer': 'count=exact', 'Range': '0-0' } }
  );
  const count = res.headers.get('content-range')?.split('/')[1] || '0';
  return count;
}

async function fetchSuggestedProfiles(gender: string, excludeId: string) {
  const showGender = gender === 'male' ? 'female' : 'male';
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/profiles?gender=eq.${showGender}&id=neq.${excludeId}&select=id,full_name,photo_url,age,city,district,profession&order=created_at.desc&limit=4`,
    { headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` } }
  );
  return res.json();
}

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [viewers, setViewers] = useState<any[]>([]);
  const [viewCount, setViewCount] = useState('0');
  const [showViewers, setShowViewers] = useState(false);
  const [loadingViewers, setLoadingViewers] = useState(false);
  const [interestsSent, setInterestsSent] = useState(0);
  const [interestsReceived, setInterestsReceived] = useState(0);
  const [suggestedProfiles, setSuggestedProfiles] = useState<any[]>([]);

  useEffect(() => {
    const userData = localStorage.getItem('biyekori_user');
    if (!userData) { router.push('/login'); return; }
    const parsed = JSON.parse(userData);
    setUser(parsed);
    if (parsed.id) {
      fetchViewCount(parsed.id).then(setViewCount);
      fetch('/api/interests/list?userId=' + parsed.id)
        .then(r => r.json())
        .then(data => {
          setInterestsSent((data.sent || []).length);
          setInterestsReceived((data.received || []).length);
        }).catch(() => {});
      if (parsed.gender) {
        fetchSuggestedProfiles(parsed.gender, parsed.id)
          .then(data => setSuggestedProfiles(Array.isArray(data) ? data : []))
          .catch(() => {});
      }
    }
  }, [router]);

  const handleShowViewers = async () => {
    const isPremium = user?.package && user.package !== 'prottasha';
    if (!isPremium) { window.location.href = '/pricing'; return; }
    setLoadingViewers(true);
    setShowViewers(true);
    const data = await fetchViewers(user.id);
    setViewers(Array.isArray(data) ? data : []);
    setLoadingViewers(false);
  };

  if (!user) {
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div style={{ fontSize: '14px', color: '#9ca3af' }}>Loading...</div></div>;
  }

  const isPremium = user?.package && user.package !== 'prottasha';
  const planLabel = !user.package || user.package === 'prottasha' ? 'Free' : user.package.charAt(0).toUpperCase() + user.package.slice(1);
  const firstName = user.full_name?.split(' ')[0] || 'there';

  return (
    <div style={{ minHeight: '100vh', background: '#f1f5f9', paddingTop: '80px' }}>
      <div style={{ maxWidth: '1120px', margin: '0 auto', padding: '0 20px 60px' }}>

        {/* Hero welcome bar */}
        <div style={{ background: 'linear-gradient(135deg, #e11d48 0%, #9333ea 100%)', borderRadius: '20px', padding: '24px 32px', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
          <div>
            <p style={{ margin: '0 0 4px', fontSize: '13px', color: 'rgba(255,255,255,0.7)', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase' }}>Dashboard</p>
            <h1 style={{ margin: '0 0 6px', fontSize: '24px', fontWeight: 800, color: 'white' }}>Welcome back, {firstName}!</h1>
            <p style={{ margin: 0, fontSize: '13px', color: 'rgba(255,255,255,0.75)' }}>
              {interestsReceived > 0 ? `You have ${interestsReceived} new interest${interestsReceived > 1 ? 's' : ''} waiting` : 'Your perfect match could be one click away'}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px', flexShrink: 0 }}>
            <Link href={'/profiles?userGender=' + (user.gender || '')} style={{ padding: '10px 20px', background: 'white', color: '#e11d48', borderRadius: '10px', fontWeight: 700, fontSize: '13px', textDecoration: 'none' }}>
              Browse Profiles
            </Link>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '20px' }}>
          <div>

            {/* Stats row - 4 compact cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px', marginBottom: '20px' }}>
              {[
                { label: 'Interests Sent', value: interestsSent, color: '#e11d48', bg: '#fff1f2', border: '#fecdd3' },
                { label: 'Received', value: interestsReceived, color: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe' },
                { label: 'Profile Views', value: viewCount, color: '#0891b2', bg: '#ecfeff', border: '#a5f3fc' },
                { label: 'Plan', value: planLabel, color: '#d97706', bg: '#fffbeb', border: '#fde68a' },
              ].map((s, i) => (
                <div key={i} style={{ background: 'white', borderRadius: '14px', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', border: '1px solid ' + s.border }}>
                  <div style={{ fontSize: '26px', fontWeight: 900, color: s.color, lineHeight: 1, marginBottom: '6px' }}>{s.value}</div>
                  <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: 600 }}>{s.label}</div>
                  <div style={{ marginTop: '8px', height: '3px', background: s.bg, borderRadius: '2px' }}>
                    <div style={{ height: '100%', width: '60%', background: s.color, borderRadius: '2px', opacity: 0.4 }} />
                  </div>
                </div>
              ))}
            </div>

            {/* NID banner - slim */}
            {!user.is_verified && (
              <div style={{ background: 'white', borderRadius: '14px', padding: '14px 20px', marginBottom: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', border: '1px solid #fde68a', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '32px', height: '32px', background: '#fef3c7', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                  </div>
                  <div>
                    <p style={{ margin: '0 0 1px', fontSize: '13px', fontWeight: 700, color: '#111827' }}>Get your verified badge</p>
                    <p style={{ margin: 0, fontSize: '11px', color: '#9ca3af' }}>5x more views · top search results · 80% more responses</p>
                  </div>
                </div>
                <Link href="/verify" style={{ flexShrink: 0, padding: '7px 16px', background: '#d97706', color: 'white', borderRadius: '8px', fontWeight: 700, fontSize: '12px', textDecoration: 'none' }}>
                  Verify — ৳200
                </Link>
              </div>
            )}

            {/* Suggested Matches */}
            <div style={{ background: 'white', borderRadius: '16px', padding: '20px', marginBottom: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div>
                  <h2 style={{ margin: '0 0 2px', fontSize: '15px', fontWeight: 800, color: '#111827' }}>Suggested for You</h2>
                  <p style={{ margin: 0, fontSize: '11px', color: '#9ca3af' }}>Profiles that may interest you</p>
                </div>
                <Link href={'/profiles?userGender=' + (user.gender || '')} style={{ fontSize: '12px', color: '#e11d48', fontWeight: 700, textDecoration: 'none' }}>See all</Link>
              </div>
              {suggestedProfiles.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '10px' }}>
                  {suggestedProfiles.map((p: any) => (
                    <Link key={p.id} href={'/profile/' + p.id} style={{ textDecoration: 'none', display: 'block' }}>
                      <div style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid #f1f5f9', background: '#f8fafc' }}>
                        <div style={{ width: '100%', paddingBottom: '120%', position: 'relative', background: '#f1f5f9' }}>
                          {p.photo_url ? (
                            <img src={p.photo_url} alt={p.full_name} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 15%' }} />
                          ) : (
                            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg,#fce7f3,#ede9fe)', fontSize: '28px' }}>?</div>
                          )}
                        </div>
                        <div style={{ padding: '8px' }}>
                          <p style={{ margin: '0 0 1px', fontSize: '12px', fontWeight: 700, color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.full_name || 'Anonymous'}</p>
                          <p style={{ margin: 0, fontSize: '10px', color: '#9ca3af' }}>{p.age} yrs{p.city || p.district ? ' · ' + (p.city || p.district) : ''}</p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '20px', color: '#9ca3af', fontSize: '13px' }}>
                  Complete your profile to see better suggestions
                </div>
              )}
            </div>

            {/* Who Viewed Me */}
            <div style={{ background: 'white', borderRadius: '16px', padding: '20px', marginBottom: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <div>
                  <h2 style={{ margin: '0 0 2px', fontSize: '15px', fontWeight: 800, color: '#111827' }}>Who Viewed My Profile</h2>
                  <p style={{ margin: 0, fontSize: '11px', color: '#9ca3af' }}>{viewCount} total views</p>
                </div>
                {isPremium && (
                  <button onClick={handleShowViewers} style={{ padding: '6px 14px', background: 'linear-gradient(135deg,#7c3aed,#9333ea)', color: 'white', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>
                    See who
                  </button>
                )}
              </div>

              {!isPremium ? (
                <div style={{ background: 'linear-gradient(135deg,#faf5ff,#fff1f2)', borderRadius: '12px', padding: '16px', border: '1px solid #e9d5ff' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                    <div>
                      <p style={{ margin: '0 0 2px', fontSize: '13px', fontWeight: 700, color: '#111827' }}>Premium Feature</p>
                      <p style={{ margin: 0, fontSize: '11px', color: '#6b7280' }}>See exactly who is interested in you</p>
                    </div>
                    <Link href="/pricing" style={{ padding: '7px 14px', background: 'linear-gradient(135deg,#7c3aed,#e11d48)', color: 'white', borderRadius: '8px', fontSize: '12px', fontWeight: 700, textDecoration: 'none', whiteSpace: 'nowrap' }}>
                      Upgrade
                    </Link>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', filter: 'blur(5px)', pointerEvents: 'none', userSelect: 'none' }}>
                    {[1,2,3].map(i => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 10px', background: 'white', borderRadius: '10px' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#e5e7eb', flexShrink: 0 }} />
                        <div style={{ flex: 1 }}>
                          <div style={{ width: '100px', height: '10px', background: '#e5e7eb', borderRadius: '4px', marginBottom: '5px' }} />
                          <div style={{ width: '70px', height: '8px', background: '#f3f4f6', borderRadius: '4px' }} />
                        </div>
                        <div style={{ width: '40px', height: '8px', background: '#f3f4f6', borderRadius: '4px' }} />
                      </div>
                    ))}
                  </div>
                </div>
              ) : showViewers && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {loadingViewers ? (
                    <div style={{ textAlign: 'center', padding: '20px', color: '#9ca3af', fontSize: '13px' }}>Loading...</div>
                  ) : viewers.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '20px', color: '#9ca3af', fontSize: '13px' }}>No views yet. Share your profile!</div>
                  ) : viewers.map((view: any, i: number) => {
                    const viewer = view.viewer;
                    if (!viewer) return null;
                    return (
                      <Link key={i} href={'/profile/' + viewer.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', background: '#f8fafc', borderRadius: '10px', textDecoration: 'none', border: '1px solid #f1f5f9' }}>
                        {viewer.photo_url ? (
                          <img src={viewer.photo_url} alt={viewer.full_name} style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                        ) : (
                          <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#ede9fe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', flexShrink: 0 }}>?</div>
                        )}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ margin: '0 0 1px', fontSize: '13px', fontWeight: 700, color: '#111827' }}>{viewer.full_name || 'Anonymous'}</p>
                          <p style={{ margin: 0, fontSize: '11px', color: '#9ca3af', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{viewer.age} yrs · {viewer.city} · {viewer.profession}</p>
                        </div>
                        <p style={{ margin: 0, fontSize: '11px', color: '#9ca3af', flexShrink: 0 }}>{new Date(view.viewed_at).toLocaleDateString('en-GB')}</p>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Quick Actions - list style */}
            <div style={{ background: 'white', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid #f8fafc' }}>
                <h2 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#111827' }}>Quick Actions</h2>
              </div>
              {[
                { href: '/profiles?userGender=' + (user.gender || ''), color: '#e11d48', bg: '#fff1f2', title: 'Browse Profiles', sub: 'Find your perfect match' },
                { href: '/interests', color: '#7c3aed', bg: '#f5f3ff', title: 'My Interests', sub: interestsReceived > 0 ? interestsReceived + ' new interest waiting' : 'View sent and received' },
                { href: '/verify', color: '#d97706', bg: '#fffbeb', title: 'Verify NID', sub: user.is_verified ? 'Already verified' : 'Get your verified badge' },
                { href: '/pricing', color: '#0891b2', bg: '#ecfeff', title: isPremium ? 'Manage Plan' : 'Upgrade to Premium', sub: isPremium ? 'Current: ' + planLabel : 'Unlock all features' },
              ].map((a, i) => (
                <Link key={i} href={a.href} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 20px', borderBottom: i < 3 ? '1px solid #f8fafc' : 'none', background: 'white', transition: 'background 0.15s' }}>
                  <div style={{ width: '38px', height: '38px', background: a.bg, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <div style={{ width: '16px', height: '16px', borderRadius: '4px', background: a.color, opacity: 0.8 }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: '0 0 1px', fontSize: '13px', fontWeight: 700, color: '#111827' }}>{a.title}</p>
                    <p style={{ margin: 0, fontSize: '11px', color: '#9ca3af' }}>{a.sub}</p>
                  </div>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="2.5"><path d="M9 18l6-6-6-6"/></svg>
                </Link>
              ))}
            </div>

          </div>

          {/* Sidebar */}
          <div>
            <ProfileCompletion user={user} />
          </div>

        </div>
      </div>
    </div>
  );
}
