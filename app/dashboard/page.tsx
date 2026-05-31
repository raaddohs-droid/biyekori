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
    `${SUPABASE_URL}/rest/v1/profiles?gender=eq.${showGender}&id=neq.${excludeId}&select=id,full_name,photo_url,age,city,district,profession&order=created_at.desc&limit=3`,
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
    if (!isPremium) {
      alert('Who Viewed Me is a Premium feature. Upgrade to see who viewed your profile.');
      return;
    }
    setLoadingViewers(true);
    setShowViewers(true);
    const data = await fetchViewers(user.id);
    setViewers(Array.isArray(data) ? data : []);
    setLoadingViewers(false);
  };

  if (!user) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f9fafb' }}>
        <div style={{ fontSize: '16px', color: '#9ca3af' }}>Loading...</div>
      </div>
    );
  }

  const isPremium = user?.package && user.package !== 'prottasha';
  const planLabel = user.package === 'prottasha' || !user.package ? 'Free' : user.package.charAt(0).toUpperCase() + user.package.slice(1);

  const stats = [
    { label: 'Interests Sent', value: interestsSent, color: '#e11d48', bg: '#fff1f2' },
    { label: 'Interests Received', value: interestsReceived, color: '#7c3aed', bg: '#f5f3ff' },
    { label: 'Profile Views', value: viewCount, color: '#0891b2', bg: '#ecfeff' },
    { label: 'Current Plan', value: planLabel, color: '#d97706', bg: '#fffbeb' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', paddingTop: '80px' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 16px 48px' }}>

        {/* Welcome */}
        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ margin: '0 0 4px', fontSize: '26px', fontWeight: 800, color: '#111827' }}>
            Welcome back, {user.full_name?.split(' ')[0] || 'there'}
          </h1>
          <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>Here is your activity summary</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '24px' }}>
          <div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '10px', marginBottom: '24px' }}>
              {stats.map((s, i) => (
                <div key={i} style={{ background: 'white', borderRadius: '12px', padding: '12px 14px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '40px', height: '40px', background: s.bg, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '18px', fontWeight: 800, color: s.color }}>
                    {String(s.value).length <= 3 ? s.value : String(s.value).slice(0,3)}
                  </div>
                  <div>
                    <div style={{ fontSize: '18px', fontWeight: 800, color: s.color, lineHeight: 1.1 }}>{s.value}</div>
                    <div style={{ fontSize: '10px', color: '#9ca3af', fontWeight: 600, marginTop: '1px' }}>{s.label}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* NID Banner */}
            {!user.is_verified && (
              <div style={{ background: 'white', borderRadius: '16px', padding: '20px 24px', marginBottom: '24px', boxShadow: '0 1px 6px rgba(0,0,0,0.06)', border: '1px solid #fde68a', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
                <div>
                  <p style={{ margin: '0 0 4px', fontSize: '14px', fontWeight: 700, color: '#111827' }}>Get your verified badge</p>
                  <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>5x more views, top search results, 80% more responses</p>
                </div>
                <Link href="/verify" style={{ padding: '8px 20px', background: 'linear-gradient(135deg,#f59e0b,#d97706)', color: 'white', borderRadius: '10px', fontWeight: 700, fontSize: '13px', textDecoration: 'none' }}>
                  Verify — ৳200
                </Link>
              </div>
            )}

            {user.is_verified && (
              <div style={{ background: 'white', borderRadius: '16px', padding: '16px 24px', marginBottom: '24px', boxShadow: '0 1px 6px rgba(0,0,0,0.06)', border: '1px solid #6ee7b7', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '36px', height: '36px', background: '#ecfdf5', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5"><path d="M20 6L9 17l-5-5"/></svg>
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#059669' }}>Profile Verified</p>
                  <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>You have the trusted verified badge</p>
                </div>
              </div>
            )}

            {/* Suggested Matches */}
            {suggestedProfiles.length > 0 && (
              <div style={{ background: 'white', borderRadius: '16px', padding: '20px 24px', marginBottom: '24px', boxShadow: '0 1px 6px rgba(0,0,0,0.06)', border: '1px solid #f3f4f6' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <div>
                    <h2 style={{ margin: '0 0 2px', fontSize: '16px', fontWeight: 800, color: '#111827' }}>Suggested for You</h2>
                    <p style={{ margin: 0, fontSize: '12px', color: '#9ca3af' }}>Based on your profile</p>
                  </div>
                  <Link href={'/profiles?userGender=' + (user.gender || '')} style={{ fontSize: '12px', color: '#e11d48', fontWeight: 700, textDecoration: 'none' }}>See all</Link>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px' }}>
                  {suggestedProfiles.map((p: any) => (
                    <Link key={p.id} href={'/profile/' + p.id} style={{ textDecoration: 'none', display: 'block', borderRadius: '12px', overflow: 'hidden', border: '1px solid #f3f4f6' }}>
                      <div style={{ width: '100%', height: '130px', background: '#f3f4f6', overflow: 'hidden' }}>
                        {p.photo_url ? (
                          <img src={p.photo_url} alt={p.full_name} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 15%' }} />
                        ) : (
                          <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg,#fce7f3,#ede9fe)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px' }}>
                            {p.gender === 'male' ? '\uD83D\uDC68' : '\uD83D\uDC69'}
                          </div>
                        )}
                      </div>
                      <div style={{ padding: '8px 10px' }}>
                        <p style={{ margin: '0 0 2px', fontSize: '13px', fontWeight: 700, color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.full_name || 'Anonymous'}</p>
                        <p style={{ margin: 0, fontSize: '11px', color: '#9ca3af' }}>{p.age} yrs{p.city || p.district ? ' · ' + (p.city || p.district) : ''}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Who Viewed Me */}
            <div style={{ background: 'white', borderRadius: '16px', padding: '20px 24px', marginBottom: '24px', boxShadow: '0 1px 6px rgba(0,0,0,0.06)', border: '1px solid #f3f4f6' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div>
                  <h2 style={{ margin: '0 0 2px', fontSize: '16px', fontWeight: 800, color: '#111827' }}>Who Viewed My Profile</h2>
                  <p style={{ margin: 0, fontSize: '12px', color: '#9ca3af' }}>{viewCount} total views</p>
                </div>
                {isPremium && (
                  <button onClick={handleShowViewers} style={{ padding: '6px 14px', background: 'linear-gradient(135deg,#7c3aed,#db2777)', color: 'white', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>
                    See viewers
                  </button>
                )}
              </div>

              {!isPremium ? (
                <div style={{ background: '#faf5ff', borderRadius: '12px', padding: '16px', border: '1px solid #e9d5ff' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                    <p style={{ margin: 0, fontSize: '13px', color: '#6b7280' }}>Upgrade to see who viewed your profile</p>
                    <Link href="/pricing" style={{ padding: '6px 14px', background: 'linear-gradient(135deg,#7c3aed,#db2777)', color: 'white', borderRadius: '8px', fontSize: '12px', fontWeight: 700, textDecoration: 'none' }}>
                      Upgrade
                    </Link>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', filter: 'blur(4px)', pointerEvents: 'none' }}>
                    {[1,2,3].map(i => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px', background: 'white', borderRadius: '8px' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#e5e7eb', flexShrink: 0 }} />
                        <div>
                          <div style={{ width: '80px', height: '10px', background: '#e5e7eb', borderRadius: '4px', marginBottom: '4px' }} />
                          <div style={{ width: '56px', height: '8px', background: '#f3f4f6', borderRadius: '4px' }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : showViewers && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {loadingViewers ? (
                    <div style={{ textAlign: 'center', padding: '24px', color: '#9ca3af', fontSize: '13px' }}>Loading...</div>
                  ) : viewers.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '24px', color: '#9ca3af', fontSize: '13px' }}>No views yet. Share your profile to get more visibility!</div>
                  ) : viewers.map((view: any, i: number) => {
                    const viewer = view.viewer;
                    if (!viewer) return null;
                    return (
                      <Link key={i} href={'/profile/' + viewer.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', background: '#faf5ff', borderRadius: '10px', textDecoration: 'none' }}>
                        {viewer.photo_url ? (
                          <img src={viewer.photo_url} alt={viewer.full_name} style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                        ) : (
                          <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#ede9fe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 }}>?</div>
                        )}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ margin: '0 0 2px', fontSize: '13px', fontWeight: 700, color: '#111827' }}>{viewer.full_name || 'Anonymous'}</p>
                          <p style={{ margin: 0, fontSize: '11px', color: '#9ca3af' }}>{viewer.age} yrs · {viewer.city} · {viewer.profession}</p>
                        </div>
                        <p style={{ margin: 0, fontSize: '11px', color: '#9ca3af', flexShrink: 0 }}>{new Date(view.viewed_at).toLocaleDateString('en-GB')}</p>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div style={{ background: 'white', borderRadius: '14px', boxShadow: '0 1px 6px rgba(0,0,0,0.06)', border: '1px solid #f3f4f6', overflow: 'hidden' }}>
              {[
                { href: '/profiles?userGender=' + (user.gender || ''), color: '#e11d48', bg: '#fff1f2', title: 'Browse Profiles', sub: 'Find your perfect match' },
                { href: '/interests', color: '#7c3aed', bg: '#f5f3ff', title: 'My Interests', sub: interestsReceived > 0 ? interestsReceived + ' new interest waiting' : 'View sent and received' },
                { href: '/pricing', color: '#d97706', bg: '#fffbeb', title: isPremium ? 'Manage Plan' : 'Upgrade Plan', sub: isPremium ? 'Current: ' + planLabel : 'Unlock premium features' },
              ].map((a, i) => (
                <Link key={i} href={a.href} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px', borderBottom: i < 2 ? '1px solid #f9fafb' : 'none' }}>
                  <div style={{ width: '36px', height: '36px', background: a.bg, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <div style={{ width: '14px', height: '14px', background: a.color, borderRadius: '3px', opacity: 0.7 }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: '0 0 1px', fontSize: '13px', fontWeight: 700, color: '#111827' }}>{a.title}</p>
                    <p style={{ margin: 0, fontSize: '11px', color: '#9ca3af' }}>{a.sub}</p>
                  </div>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
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
